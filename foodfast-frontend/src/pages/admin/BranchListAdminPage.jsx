import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminMenu from '../../components/AdminMenu';

const BranchListAdminPage = () => {
    const { userInfo } = useContext(AuthContext);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [branchesWithActiveOrders, setBranchesWithActiveOrders] = useState(new Set());
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

    const fetchBranches = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/api/branches`);
            setBranches(data);

            // Fetch active orders for all branches
            await checkActiveOrders(data);
        } catch (err) {
            alert('Lỗi tải danh sách chi nhánh');
        } finally {
            setLoading(false);
        }
    };

    const checkActiveOrders = async (branchList) => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            // Include all statuses that indicate an order is in progress
            const activeStatuses = ['Pending', 'Processing', 'Shipped', 'DRONE_ASSIGNED'];
            const branchesWithOrders = new Set();

            // Check each branch for active orders
            for (const branch of branchList) {
                const { data } = await axios.get(
                    `${API_URL}/api/orders/all?branchId=${branch._id}`,
                    config
                );

                const hasActiveOrders = data.some(order =>
                    activeStatuses.includes(order.status) ||
                    (order.status !== 'DELIVERED' && order.status !== 'Cancelled' && order.status !== 'Delivered')
                );

                if (hasActiveOrders) {
                    branchesWithOrders.add(branch._id);
                }
            }

            setBranchesWithActiveOrders(branchesWithOrders);
        } catch (err) {
            console.error('Lỗi kiểm tra đơn hàng:', err);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    const handleDelete = async (id) => {
        // Check if branch has active orders
        if (branchesWithActiveOrders.has(id)) {
            alert('Không thể xóa chi nhánh này vì đang có đơn hàng đang được xử lý hoặc giao hàng!');
            return;
        }

        if (window.confirm('Bạn có chắc chắn muốn xóa chi nhánh này?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                await axios.delete(`${API_URL}/api/branches/${id}`, config);
                fetchBranches();
            } catch (err) {
                alert('Lỗi khi xóa chi nhánh');
            }
        }
    };

    return (
        <>
            <AdminMenu />
            <div className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Quản Lý Chi Nhánh</h1>
                    <button
                        onClick={() => navigate('/admin/branch/create')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded flex items-center shadow-md transition"
                    >
                        <span className="mr-2 text-xl">+</span> Thêm Chi Nhánh
                    </button>
                </div>

                {loading ? <div className="text-center py-10">Đang tải dữ liệu...</div> : (
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                                    <th className="py-3 px-6 text-left">Tên Chi Nhánh</th>
                                    <th className="py-3 px-6 text-left">Địa Chỉ</th>
                                    <th className="py-3 px-6 text-center">Tọa Độ</th>
                                    <th className="py-3 px-6 text-center">Trạng Thái</th>
                                    <th className="py-3 px-6 text-center">Hành Động</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm font-light">
                                {branches.map((branch) => {
                                    const hasActiveOrders = branchesWithActiveOrders.has(branch._id);
                                    return (
                                        <tr key={branch._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-6 text-left font-medium text-indigo-600">
                                                {branch.name}
                                            </td>
                                            <td className="py-3 px-6 text-left">
                                                <p>{branch.address}</p>
                                                <p className="text-xs text-gray-400 mt-1">Hotline: {branch.phoneNumber || '---'}</p>
                                            </td>
                                            <td className="py-3 px-6 text-center font-mono text-xs">
                                                [{branch.location?.coordinates[1]}, {branch.location?.coordinates[0]}]
                                            </td>
                                            <td className="py-3 px-6 text-center">
                                                {hasActiveOrders ? (
                                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                                                        Đang có đơn
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                                                        Sẵn sàng
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-6 text-center">
                                                <div className="flex item-center justify-center gap-3">
                                                    <button
                                                        onClick={() => navigate(`/admin/branch/${branch._id}/edit`)}
                                                        className="transform hover:text-indigo-500 hover:scale-110 transition"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(branch._id)}
                                                        disabled={hasActiveOrders}
                                                        className={`transform transition ${hasActiveOrders
                                                                ? 'text-gray-300 cursor-not-allowed'
                                                                : 'hover:text-red-500 hover:scale-110'
                                                            }`}
                                                        title={hasActiveOrders ? 'Không thể xóa - Đang có đơn hàng' : 'Xóa'}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
};

export default BranchListAdminPage;