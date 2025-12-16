import Drone from '../models/droneModel.js';

// Lấy danh sách tất cả Drone (Admin)
export const getAllDrones = async (req, res) => {
    try {
        const drones = await Drone.find({});
        res.json(drones);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách Drone' });
    }
};

// Lấy chi tiết Drone
export const getDroneById = async (req, res) => {
    try {
        const drone = await Drone.findById(req.params.id);
        if (drone) {
            res.json(drone);
        } else {
            res.status(404).json({ message: 'Không tìm thấy Drone' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Tạo Drone mới
export const createDrone = async (req, res) => {
    const { name, status, battery, location } = req.body;
    try {
        const droneExists = await Drone.findOne({ name });
        if (droneExists) {
            return res.status(400).json({ message: 'Tên Drone đã tồn tại' });
        }

        const drone = await Drone.create({
            name,
            status: status || 'IDLE',
            battery: battery || 100,
            currentLocation: location || { lat: 10.7769, lng: 106.7009 }
        });

        res.status(201).json(drone);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo Drone' });
    }
};

// Cập nhật thông tin Drone (Admin edit)
export const updateDrone = async (req, res) => {
    const { name, status, battery, location } = req.body;
    try {
        const drone = await Drone.findById(req.params.id);
        if (drone) {
            drone.name = name || drone.name;
            drone.status = status || drone.status;
            drone.battery = battery !== undefined ? battery : drone.battery;
            if (location) {
                drone.currentLocation = location;
            }

            const updatedDrone = await drone.save();
            res.json(updatedDrone);
        } else {
            res.status(404).json({ message: 'Không tìm thấy Drone' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật Drone' });
    }
};

// Xóa Drone
export const deleteDrone = async (req, res) => {
    try {
        const drone = await Drone.findById(req.params.id);
        if (drone) {
            await drone.deleteOne();
            res.json({ message: 'Đã xóa Drone thành công' });
        } else {
            res.status(404).json({ message: 'Không tìm thấy Drone' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa Drone' });
    }
};

// --- CÁC HÀM CŨ (GIỮ LẠI CHO TƯƠNG THÍCH) ---

// Lấy danh sách Drone đang rảnh (IDLE hoặc available)
export const getIdleDrones = async (req, res) => {
    try {
        // Tìm các drone có trạng thái rảnh
        console.log('Querying for IDLE drones...');
        const drones = await Drone.find({
            status: { $in: ['IDLE', 'available'] }
        });
        console.log(`Found ${drones.length} idle drones.`);
        res.json(drones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách Drone' });
    }
};

// Cập nhật trạng thái Drone (Khi bắt đầu giao hàng - API cũ)
export const updateDroneStatus = async (req, res) => {
    const { droneId, status, orderId } = req.body;
    try {
        const drone = await Drone.findById(droneId);
        if (drone) {
            drone.status = status || drone.status;
            if (orderId) drone.currentOrderId = orderId;

            const updatedDrone = await drone.save();
            res.json(updatedDrone);
        } else {
            res.status(404).json({ message: 'Không tìm thấy Drone' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};