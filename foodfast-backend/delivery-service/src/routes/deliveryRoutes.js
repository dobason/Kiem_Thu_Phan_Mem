import express from 'express';
import {
    getAllDrones,
    createDrone,
    getDroneById,
    updateDrone,
    deleteDrone,
    getIdleDrones,
    updateDroneStatus
} from '../controllers/deliveryController.js';

const router = express.Router();

// IMPORTANT: Specific routes MUST come before parameterized routes
// Otherwise /:id will match everything including /status/idle

// --- Routes chức năng (cho hệ thống) - MUST BE FIRST ---
router.get('/status/idle', getIdleDrones); // Lấy drone rảnh
router.put('/status/update', updateDroneStatus); // Cập nhật trạng thái (API cũ)

// --- CRUD Routes cho Admin ---
router.get('/', getAllDrones);           // Lấy tất cả
router.post('/', createDrone);           // Tạo mới
router.get('/:id', getDroneById);        // Lấy chi tiết
router.put('/:id', updateDrone);         // Cập nhật
router.delete('/:id', deleteDrone);      // Xóa

export default router;