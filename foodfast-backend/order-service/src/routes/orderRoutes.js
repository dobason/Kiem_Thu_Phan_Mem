import express from 'express';
import {
    createOrder,
    getOrderById,
    updateOrderToPaid,
    updateOrderStatus,
    getAllOrders,
    getMyOrders,
    assignDrone,
    deleteOrder,
    getRevenueStats
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Tạo đơn hàng
router.route('/').post(protect, createOrder);

// Lấy tất cả đơn (Admin)
router.route('/all').get(protect, admin, getAllOrders);

// Lấy đơn hàng của tôi
router.route('/myorders/:userId').get(protect, getMyOrders);

// Thanh toán
router.route('/:id/pay').put(protect, updateOrderToPaid);

//Route thống kê
router.route('/stats/revenue').get(protect, admin, getRevenueStats);

// --- QUAN TRỌNG: BỎ PROTECT Ở 2 DÒNG NÀY ĐỂ DELIVERY SERVICE GỌI ĐƯỢC ---
router.route('/:id/status').put(updateOrderStatus);     // <-- Bỏ protect, admin
router.route('/:id/assign-drone').put(assignDrone);     // <-- Bỏ protect, admin
// ------------------------------------------------------------------------

// Lấy chi tiết & Xóa đơn
router.route('/:id')
    .get(protect, getOrderById)
    .delete(protect, admin, deleteOrder);

export default router;