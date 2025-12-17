// src/components/HeroSection.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [category, setCategory] = useState(''); // Có thể thay bằng Select nếu có danh sách category

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (category) params.append('category', category);

        navigate(`/?${params.toString()}`);
    };

    return (
        <div className="relative bg-white text-gray-800 py-16 px-4 md:px-8 overflow-hidden">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
                {/* Left Section: Text Content */}
                <div className="md:w-1/2 lg:w-2/5 text-center md:text-left order-2 md:order-1">
                    <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">Lời Mời</p>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-orange-700 leading-tight mb-6">
                        FoodFast Delivery
                    </h1>
                    <p className="text-lg text-gray-700 leading-relaxed mb-6">
                        Khám phá các món ăn truyền thống và hiện đại, cùng với các loại đồ uống tinh tế.
                        Mỗi món ăn là một câu chuyện, một trải nghiệm ẩm thực độc đáo.
                    </p>

                    {/* --- SEARCH BAR & ADVANCED SEARCH --- */}
                    <div className="w-full max-w-lg mx-auto md:mx-0 bg-white p-4 rounded-xl shadow-lg border border-gray-100 relative z-10">
                        <form onSubmit={handleSearch}>
                            <div className="flex gap-2">
                                <div className="relative flex-grow">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg aria-hidden="true" className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                    </div>
                                    <input
                                        type="search"
                                        className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-orange-500 focus:border-orange-500"
                                        placeholder="Tìm món ngon..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="text-white bg-orange-700 hover:bg-orange-800 focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-4 py-2"
                                >
                                    Tìm
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                                    className="p-2.5 ml-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg border border-gray-200 hover:bg-gray-200 hover:text-orange-700 focus:ring-4 focus:outline-none focus:ring-gray-100"
                                    title="Bộ lọc nâng cao"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                                </button>
                            </div>

                            {/* Advanced Fields */}
                            {isAdvancedOpen && (
                                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-down">
                                    <div>
                                        <label className="block mb-1 text-xs font-medium text-gray-700">Giá thấp nhất</label>
                                        <input
                                            type="number"
                                            placeholder="VD: 10000"
                                            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-xs font-medium text-gray-700">Giá cao nhất</label>
                                        <input
                                            type="number"
                                            placeholder="VD: 500000"
                                            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block mb-1 text-xs font-medium text-gray-700">Danh mục</label>
                                        <input
                                            type="text"
                                            placeholder="VD: Burger, Pizza, Nước uống..."
                                            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                </div>

                {/* Right Section: Images (overlapping, artistic style) */}
                <div className="md:w-1/2 lg:w-3/5 relative order-1 md:order-2 flex justify-center items-center">
                    {/* Main image - nhà hàng */}
                    <img
                        src="https://th.bing.com/th/id/R.c6616b136a2911a2483682418315afb4?rik=G3kyaL7fsDbOmA&pid=ImgRaw&r=0" // Thay bằng link ảnh của bạn
                        alt="FoodFast Delivery"
                        className="w-full md:w-4/5 lg:w-3/4 rounded-lg shadow-xl"
                    />
                    {/* Overlapping image - người phụ nữ uống trà */}
                    <img
                        src="https://static.vecteezy.com/system/resources/previews/001/860/102/non_2x/fast-delivery-smartphone-online-food-order-service-free-vector.jpg" // Thay bằng link ảnh của bạn
                        alt="Woman drinking tea"
                        className="absolute -bottom-8 -right-8 w-1/2 md:w-2/5 lg:w-1/3 rounded-lg shadow-2xl border-4 border-white transform rotate-3"
                        style={{ minWidth: '150px' }} // Đảm bảo ảnh không quá nhỏ trên màn hình nhỏ
                    />
                </div>
            </div>
        </div>
    );
};

export default HeroSection;