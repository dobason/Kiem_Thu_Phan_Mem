import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import branchRoutes from './src/routes/branchRoutes.js';

dotenv.config();

const app = express();

app.use((req, res, next) => {
    console.log(`[Branch Service] Received request for: ${req.originalUrl}`);
    next();
});

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB for Branch Service'))
    .catch((err) => console.error('Could not connect to MongoDB', err));

// --- CẤU HÌNH QUAN TRỌNG: TĂNG GIỚI HẠN NHẬN DỮ LIỆU LÊN 50MB ---
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// ---------------------------------------------------------------

app.use('/', branchRoutes);

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
    console.log(`🚀 Branch Service is running on http://localhost:${PORT}`);
});