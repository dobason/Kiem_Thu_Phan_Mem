// product-service/src/routes/productRoutes.js

import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    seedInventory
} from '../controllers/productController.js';

const router = express.Router();

// Route cho /
router.route('/')
    .post(protect, admin, createProduct) // Chỉ admin mới được tạo
    .get(getAllProducts);

router.route('/seed-inventory').post(seedInventory);

// Route cho /:id
router.route('/:id')
    .get(getProductById)
    .put(protect, admin, updateProduct) // Chỉ admin mới được cập nhật
    .delete(protect, admin, deleteProduct); // <-- Đảm bảo dòng này tồn tại
 // <--- Thêm route này
export default router;