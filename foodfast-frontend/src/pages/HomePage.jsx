// ... imports
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Product from '../components/Product.jsx';
import ErrorDisplay from '../components/ErrorDisplay.jsx';
import HeroSection from '../components/HeroSection.jsx';

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams(); // Hook để lấy query params

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
                const response = await axios.get(`${baseUrl}/api/products`);


                // ... (giữ nguyên logic xử lý data cũ)
                console.log("🔥 DỮ LIỆU API TRẢ VỀ:", response.data);

                let productData = [];
                if (Array.isArray(response.data)) {
                    productData = response.data;
                } else if (response.data && Array.isArray(response.data.products)) {
                    productData = response.data.products;
                } else {
                    console.warn("⚠️ Cấu trúc dữ liệu lạ, không tìm thấy mảng sản phẩm:", response.data);
                }

                setProducts(productData);
                setError(null);
            } catch (err) {
                setError('Rất tiếc, không thể tải dữ liệu sản phẩm.');
                console.error("Fetch products error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // --- LOGIC LỌC SẢN PHẨM (Client-side) ---
    const filteredProducts = products.filter(product => {
        const searchTerm = searchParams.get('search')?.toLowerCase() || '';
        const minPrice = parseInt(searchParams.get('minPrice')) || 0;
        const maxPrice = parseInt(searchParams.get('maxPrice')) || Infinity;
        const categoryQuery = searchParams.get('category')?.toLowerCase() || '';

        // 1. Lọc theo tên hoặc mô tả
        const matchesSearch =
            (product.name?.toLowerCase().includes(searchTerm) || '') ||
            (product.description?.toLowerCase().includes(searchTerm) || '');

        // 2. Lọc theo giá
        const price = product.price || 0;
        const matchesPrice = price >= minPrice && price <= maxPrice;

        // 3. Lọc theo danh mục (nếu chưa có field category, tạm thời tìm trong name/desc hoặc bỏ qua)
        // Lưu ý: Nếu backend chưa trả về 'category', logic này sẽ luôn đúng nếu categoryQuery rỗng
        // Nếu muốn search category chính xác cần check field product.category
        const matchesCategory = categoryQuery
            ? (product.category?.toLowerCase().includes(categoryQuery) ||
                product.name?.toLowerCase().includes(categoryQuery)) // Tìm tạm trong tên nếu chưa có field
            : true;

        return matchesSearch && matchesPrice && matchesCategory;
    });


    if (loading) return <div className="text-center py-10">Đang tải món ngon... 🍔</div>;

    if (error) {
        return <ErrorDisplay message={error} />;
    }

    return (
        <div className="bg-white min-h-screen">
            <HeroSection />

            <div className="container mx-auto p-4 md:p-8">
                <div className="text-center mb-10 md:mb-12">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-orange-700 leading-tight mb-6">
                        Thực Đơn Của Chúng Tôi
                    </h1>
                    <p className="text-lg text-gray-600">
                        Khám phá các món ăn 🍔 và đồ uống 🥤 tuyệt vời nhất.
                    </p>
                    {/* Hiển thị thông báo kết quả tìm kiếm */}
                    {(searchParams.toString() !== '') && (
                        <p className="mt-4 text-sm text-gray-500 italic">
                            Kết quả tìm kiếm cho:
                            {searchParams.get('search') && <span className="font-bold"> "{searchParams.get('search')}" </span>}
                            {searchParams.get('category') && <span> Danh mục "{searchParams.get('category')}" </span>}
                            ({filteredProducts.length} kết quả)
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array.isArray(filteredProducts) && filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <Product key={product._id} product={product} />
                        ))
                    ) : (
                        <p className="col-span-full text-center text-gray-500 text-lg py-10">
                            Hiện chưa có sản phẩm nào để hiển thị.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomePage;