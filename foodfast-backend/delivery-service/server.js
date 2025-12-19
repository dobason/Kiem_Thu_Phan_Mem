import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import axios from 'axios';
import Drone from './src/models/droneModel.js'; // Đảm bảo đường dẫn model đúng
import deliveryRoutes from './src/routes/deliveryRoutes.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// FORCE REBUILD: 2025-12-15T13:46:00
// Mount delivery routes AFTER specific routes
// app.use('/', deliveryRoutes); 
// MOVED TO BOTTOM

// --- 1. CẤU HÌNH DATABASE ---
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/foodfast-db');
        console.log('✅ Drone Service DB Connected');
    } catch (err) {
        console.error('❌ DB Connection Error:', err);
    }
};
connectDB();

// --- 2. CẤU HÌNH SOCKET.IO ---
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

// Middleware để dùng io trong route (nếu cần mở rộng sau này)
app.use((req, res, next) => {
    req.io = io;
    next();
});

// --- 3. CÁC CONST & URL ---
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3003';

// Tọa độ giả lập (Demo: Từ Dinh Độc Lập -> Chợ Bến Thành)
// Trong thực tế: Bạn sẽ truyền tọa độ này từ Frontend lên API /start-delivery
const RESTAURANT_LOC = { lat: 10.7769, lng: 106.7009 };
const CUSTOMER_LOC = { lat: 10.7626, lng: 106.6602 };

// --- 4. HÀM TIỆN ÍCH TÍNH KHOẢNG CÁCH (Haversine Formula) ---
const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
}

const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Bán kính trái đất (km)
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

// --- 5. HÀM MÔ PHỎNG DI CHUYỂN (CORE LOGIC) ---
const simulateDelivery = (drone, orderId, startLoc, endLoc) => {
    // A. Tính tổng quãng đường trước khi bay
    const totalDistanceKm = getDistanceFromLatLonInKm(
        startLoc.lat, startLoc.lng,
        endLoc.lat, endLoc.lng
    );

    console.log(`🚁 [SIMULATION] Drone ${drone.name} xuất phát từ [${startLoc.lat}, ${startLoc.lng}] đến [${endLoc.lat}, ${endLoc.lng}]. Tổng hành trình: ${totalDistanceKm.toFixed(2)} km`);

    let progress = 0; // 0.0 -> 1.0
    const step = 0.05; // 5% mỗi lần cập nhật (Tốc độ bay)

    const flightInterval = setInterval(async () => {
        progress += step;

        // Force completion if close to 1 to avoid floating point issues
        if (progress >= 0.99) progress = 1.0;

        // B. Tính tọa độ hiện tại (Nội suy tuyến tính)
        const currentLat = startLoc.lat + (endLoc.lat - startLoc.lat) * progress;
        const currentLng = startLoc.lng + (endLoc.lng - startLoc.lng) * progress;

        // C. Tính toán thông số quãng đường
        const distanceTraveled = (totalDistanceKm * progress).toFixed(2);
        const distanceRemaining = Math.max(0, totalDistanceKm - distanceTraveled).toFixed(2);

        // D. Xác định thông báo trạng thái
        let statusMessage = `Đang di chuyển đến vị trí của bạn`;

        if (progress >= 1) {
            statusMessage = 'Đang hạ cánh xuống vị trí của bạn...';
        } else if (Math.abs(progress - 0.5) < 0.01) {
            statusMessage = `Đang di chuyển đến vị trí của bạn`;
        }

        // E. Gửi dữ liệu xuống Frontend (chỉ gửi DELIVERING khi chưa >= 1)
        if (progress < 1) {
            io.to(orderId).emit('status_update', {
                status: 'DELIVERING', // Use valid ENUM
                message: statusMessage,
                location: { lat: currentLat, lng: currentLng },
                droneId: drone.name,
                progress: progress.toFixed(2),
                stats: {
                    total: totalDistanceKm.toFixed(2) + ' km',
                    traveled: distanceTraveled + ' km',
                    remaining: distanceRemaining + ' km'
                }
            });
        }

        // F. Xử lý khi đến đích (100%)
        if (progress >= 1) {
            clearInterval(flightInterval);
            console.log(`✅ [SIMULATION] Drone ${drone.name} đã hoàn thành đơn ${orderId}!`);

            // 1. Gửi thông báo cuối cùng CHO UI TRƯỚC (Ưu tiên UX)
            const deliveryData = {
                status: 'DELIVERED', // Use valid ENUM
                message: 'Giao hàng thành công! Cảm ơn quý khách.',
                location: endLoc,
                droneId: drone.name,
                progress: 1.0,
                stats: {
                    total: totalDistanceKm.toFixed(2) + ' km',
                    traveled: totalDistanceKm.toFixed(2) + ' km',
                    remaining: '0.00 km'
                }
            };
            io.to(orderId).emit('status_update', deliveryData);

            // 2. Gọi API cập nhật Order Service (Background)
            try {
                // IMPORTANT: Ensure full absolute URL if using axios serverside causing issues? 
                // Using configured ORDER_SERVICE_URL (http://order-service:3003)
                // Remove /api/orders prefix because internal service is mounted at /
                console.log(`Creating update request to: ${ORDER_SERVICE_URL}/${orderId}/status`);
                await axios.put(`${ORDER_SERVICE_URL}/${orderId}/status`, { status: 'DELIVERED' });
                console.log('✅ Order Service updated to DELIVERED');
            } catch (error) {
                console.error("❌ Lỗi khi gọi Order Service:", error.message);
                // Note: UI already notified, so user impact is minimal
            }

            // 3. Reset Drone: Về trạng thái rảnh + Trừ Pin
            try {
                const currentDrone = await Drone.findById(drone._id);
                if (currentDrone) {
                    currentDrone.status = 'IDLE';
                    currentDrone.currentOrderId = null;
                    // Giả lập trừ 10% pin mỗi chuyến
                    currentDrone.battery = Math.max(0, currentDrone.battery - 10);

                    const updatedDrone = await currentDrone.save();
                    io.emit('drone_update', updatedDrone); // Update cho Dashboard Admin
                    console.log(`-> Drone về trạm sạc. Pin còn: ${updatedDrone.battery}%`);
                }
            } catch (error) {
                console.error("❌ Lỗi khi cập nhật trạng thái Drone:", error.message);
            }
        }
    }, 2000); // Cập nhật mỗi 2 giây
};

// --- 6. SOCKET CONNECTION ---
io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Client join room theo Order ID để nhận tin riêng
    socket.on('join_order_room', (orderId) => {
        console.log(`📡 User joined tracking room: ${orderId}`);
        socket.join(orderId);
    });

    socket.on('disconnect', () => { });
});

// --- 7. API ROUTES ---

// API ĐIỀU PHỐI GIAO HÀNG (TRIGGER SIMULATION)

app.post('/start-delivery', async (req, res) => {
    const { orderId, branchId, droneId, startLocation, endLocation } = req.body;
    console.log(`🚚 [API] Yêu cầu giao hàng. Order: ${orderId}, Branch: ${branchId}, DroneId: ${droneId}`);
    console.log(`📍 Start: [${startLocation?.lat}, ${startLocation?.lng}], End: [${endLocation?.lat}, ${endLocation?.lng}]`);

    if (!orderId) return res.status(400).json({ message: "Thiếu dữ liệu đầu vào (orderId)" });

    // Validate locations
    if (!startLocation || !endLocation || !startLocation.lat || !startLocation.lng || !endLocation.lat || !endLocation.lng) {
        return res.status(400).json({ message: "Thiếu tọa độ xuất phát hoặc điểm đến" });
    }

    try {
        let availableDrone;

        if (droneId) {
            // Nếu có droneId, tìm cụ thể drone đó
            availableDrone = await Drone.findById(droneId);
            // Kiểm tra xem drone có hợp lệ không (ví dụ check pin)
            if (availableDrone && availableDrone.battery <= 20) {
                return res.status(400).json({ message: "Drone này pin yếu, vui lòng chọn drone khác" });
            }
        } else {
            // Tìm Drone rảnh & còn pin (>20%)
            // Lưu ý: data mẫu status là 'IDLE', query phải khớp
            availableDrone = await Drone.findOne({
                status: 'IDLE',
                battery: { $gt: 20 }
            });
        }

        if (!availableDrone) {
            return res.status(404).json({ message: "Không tìm thấy Drone khả dụng hoặc pin yếu" });
        }

        // Cập nhật trạng thái Drone -> Delivering
        availableDrone.status = 'BUSY'; // Hoặc 'Delivering' nếu muốn, nhưng enum là 'BUSY'
        availableDrone.currentOrderId = orderId;
        const savedDrone = await availableDrone.save();

        // Báo cho Admin Dashboard
        io.emit('drone_update', savedDrone);

        // Gọi Order Service cập nhật trạng thái đơn hàng (Không await để tránh block)
        // URL phải đúng: http://order-service:3003/:id/status (NO /api/orders prefix)
        axios.put(`${ORDER_SERVICE_URL}/${orderId}/status`, {
            status: 'DRONE_ASSIGNED',
            droneId: savedDrone.name
        }).catch(e => console.error("⚠️ Lỗi gọi Order Service:", e.message));

        // BẮT ĐẦU MÔ PHỎNG BAY với tọa độ thực tế (Force Number type)
        simulateDelivery(
            savedDrone,
            orderId,
            { lat: parseFloat(startLocation.lat), lng: parseFloat(startLocation.lng) },
            { lat: parseFloat(endLocation.lat), lng: parseFloat(endLocation.lng) }
        );

        res.json({
            message: "Đã điều phối Drone thành công",
            drone: savedDrone
        });

    } catch (error) {
        console.error("❌ Server Error:", error);
        res.status(500).json({ message: error.message });
    }
});

// --- 8. KHỞI CHẠY SERVER ---
app.use('/api/deliveries', deliveryRoutes); // Mount general routes last

const PORT = process.env.PORT || 3005;
server.listen(PORT, () => {
    console.log(`🚀 Drone Delivery Service running on port ${PORT}`);
});
