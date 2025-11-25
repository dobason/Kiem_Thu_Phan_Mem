# Development stage with HMR support
FROM node:20-alpine

# Đặt thư mục làm việc
WORKDIR /app

# Copy file package.json và cài đặt thư viện
COPY package*.json ./
RUN npm install

# Copy toàn bộ source code
COPY . .

# Mở cổng 5173 (cổng mặc định của Vite)
EXPOSE 5173

# Chạy Vite dev server với HMR
CMD ["npm", "run", "dev"]
