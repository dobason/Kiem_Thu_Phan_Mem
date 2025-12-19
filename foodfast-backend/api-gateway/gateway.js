import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();

const app = express();

app.use(cors());

// Log để xem đường dẫn đi như thế nào
app.use((req, res, next) => {
    console.log(`[Gateway] 🟢 Nhận request: ${req.method} ${req.originalUrl}`);
    next();
});

const services = [
    {
        route: '/api/users',
        target: 'http://user-service:3001',
    },
    {
        route: '/api/products',
        target: 'http://product-service:3002',
    },
    {
        route: '/api/orders',
        target: 'http://order-service:3003',
    },
    {
        route: '/api/payments',
        target: 'http://payment-service:3004',
    },
    {
        route: '/api/delivery',
        target: 'http://delivery-service:3005',
    },
    {
        route: '/api/branches',
        target: process.env.BRANCH_SERVICE_URL || 'http://branch-service:3006',
    },
];

// Tạo Proxy
services.forEach(({ route, target }) => {
    app.use(route, createProxyMiddleware({
        target,
        changeOrigin: true,
        // QUAN TRỌNG: Đã XÓA pathRewrite.
        // Gateway sẽ chuyển nguyên xi "/api/products" sang service con.
        proxyTimeout: 300000,
        timeout: 300000,
    }));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 API Gateway đang chạy tại http://localhost:${PORT}`);
});