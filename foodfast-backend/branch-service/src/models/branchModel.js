import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// --- 1. ĐỊNH NGHĨA MODEL (Branch) ---
const branchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    // Cấu trúc GeoJSON để lưu trữ tọa độ
    location: {
        type: {
            type: String,
            enum: ['Point'], // Bắt buộc phải là 'Point'
            required: true
        },
        coordinates: {
            type: [Number], // Định dạng: [Kinh độ (Lng), Vĩ độ (Lat)]
            required: true
        }
    },
    operatingHours: {
        type: String,
        default: '9:00 AM - 10:00 PM'
    },
    phoneNumber: String,
}, {
    timestamps: true // Tự động thêm createdAt, updatedAt
});

// [RẤT QUAN TRỌNG] Tạo chỉ mục 2dsphere cho tìm kiếm vị trí
branchSchema.index({ location: '2dsphere' });

const Branch = mongoose.model('Branch', branchSchema);
export default Branch;
