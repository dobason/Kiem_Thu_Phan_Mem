import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const RevenuePage = () => {
    const [stats, setStats] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // State bộ lọc
    const [filters, setFilters] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        branchId: 'all'
    });

    // 1. Lấy danh sách chi nhánh
    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).token : ''}`
                    }
                };

                const { data } = await axios.get('/api/branches', config);

                if (Array.isArray(data)) {
                    setBranches(data);
                } else if (data.branches && Array.isArray(data.branches)) {
                    setBranches(data.branches);
                } else {
                    console.error("API Branch trả về format lạ:", data);
                    setBranches([]);
                }

            } catch (err) {
                console.error("Không tải được chi nhánh", err);
                setBranches([]);
            }
        };
        fetchBranches();
    }, []);

    // 2. Gọi API Thống kê khi Filter thay đổi
    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).token : ''}`
                    },
                    params: filters
                };

                const { data } = await axios.get('/api/orders/stats/revenue', config);
                setStats(processData(data));
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || 'Lỗi tải thống kê');
            }
            setLoading(false);
        };

        fetchStats();
    }, [filters]);

    // Hàm xử lý dữ liệu để vẽ biểu đồ
    const processData = (rawData) => {
        const grouped = {};
        rawData.forEach(item => {
            if (!grouped[item.date]) {
                grouped[item.date] = { date: item.date };
            }
            // Sử dụng branchName từ API (có thể là "Unknown Branch")
            const branchKey = item.branchName || 'Không xác định';
            grouped[item.date][branchKey] = item.totalRevenue;
        });

        const result = Object.values(grouped);
        console.log("🔧 Processed data:", result);
        return result;
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    // Tính tổng doanh thu hiển thị
    const grandTotal = stats.reduce((acc, curr) => {
        const daySum = Object.keys(curr).reduce((sum, key) => key !== 'date' ? sum + curr[key] : sum, 0);
        return acc + daySum;
    }, 0);

    // Debug: Kiểm tra dữ liệu
    console.log("📊 Stats data:", stats);
    console.log("🏢 Branches:", branches);
    console.log("💰 Grand Total:", grandTotal);

    // Lấy danh sách chi nhánh thực tế từ dữ liệu stats
    const actualBranches = stats.length > 0
        ? [...new Set(stats.flatMap(day => Object.keys(day).filter(k => k !== 'date')))]
        : [];
    console.log("✅ Actual branches in data:", actualBranches);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">📊 Thống Kê Doanh Thu</h1>

            {/* --- FILTER SECTION --- */}
            <div className="bg-white p-4 rounded shadow mb-6 flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium mb-1">Từ ngày</label>
                    <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="border p-2 rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Đến ngày</label>
                    <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="border p-2 rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Chi nhánh</label>
                    <select name="branchId" value={filters.branchId} onChange={handleFilterChange} className="border p-2 rounded min-w-[200px]">
                        <option value="all">Tất cả chi nhánh</option>
                        {branches.map(b => (
                            <option key={b._id} value={b._id}>{b.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            {/* --- SUMMARY CARD --- */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded">
                <p className="text-blue-700 font-bold">Tổng doanh thu trong kỳ</p>
                <p className="text-3xl font-bold text-gray-800">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(grandTotal)}
                </p>
            </div>

            {/* --- CHART --- */}
            <div className="bg-white p-6 rounded shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Biểu đồ biến động doanh thu</h3>

                {loading ? (
                    <p>Đang tải dữ liệu...</p>
                ) : stats.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Không có dữ liệu trong khoảng thời gian này
                    </div>
                ) : (
                    /* SỬA LẠI ĐOẠN NÀY: Dùng class Tailwind thay vì style inline để chắc chắn */
                    <div className="w-full h-[500px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    tickFormatter={(val) => new Intl.NumberFormat('vi-VN', { notation: "compact" }).format(val)}
                                />
                                <Tooltip
                                    formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                                    labelFormatter={(label) => `Ngày: ${label}`}
                                />
                                <Legend />

                                {actualBranches.map((branchName, index) => (
                                    <Line
                                        key={branchName} // Dùng branchName làm key
                                        type="monotone"
                                        dataKey={branchName} // Quan trọng: Phải khớp với key trong data
                                        stroke={['#8884d8', '#82ca9d', '#ffc658', '#ea580c', '#ec4899'][index % 5]}
                                        strokeWidth={3}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 8 }}
                                        name={branchName}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RevenuePage;