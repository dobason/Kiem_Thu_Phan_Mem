import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminMenu from '../../components/AdminMenu';

const DroneListAdminPage = () => {
    const { userInfo } = useContext(AuthContext);
    const [drones, setDrones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dronesWithActiveOrders, setDronesWithActiveOrders] = useState(new Set());
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

    const fetchDrones = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/api/delivery/drones`);
            setDrones(data);

            // Check which drones have active orders
            await checkActiveOrders(data);
        } catch (err) {
            console.error(err);
            alert('Lỗi tải danh sách Drone');
        } finally {
            setLoading(false);
        }
    };

    const checkActiveOrders = async (droneList) => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            // Get all orders with active statuses (including DRONE_ASSIGNED)
            const activeStatuses = ['Pending', 'Processing', 'Shipped', 'DRONE_ASSIGNED'];
            const dronesInUse = new Set();

            // For each branch, get orders and check which drones are in use
            const { data: branches } = await axios.get(`${API_URL}/api/branches`);

            for (const branch of branches) {
                const { data: orders } = await axios.get(
                    `${API_URL}/api/orders/all?branchId=${branch._id}`,
                    config
                );

                orders.forEach(order => {
                    // Check if order is active and has a drone assigned
                    const isActiveOrder = activeStatuses.includes(order.status) ||
                        (order.status !== 'DELIVERED' && order.status !== 'Cancelled' && order.status !== 'Delivered');

                    if (isActiveOrder && order.droneId) {
                        // Add both the droneId as string and compare with drone names
                        dronesInUse.add(order.droneId);
                        console.log('🚁 Drone đang được sử dụng:', order.droneId, 'Order:', order._id, 'Status:', order.status);
                    }
                });
            }

            console.log('📋 Danh sách drones đang được sử dụng:', Array.from(dronesInUse));
            console.log('📋 Danh sách tất cả drones:', droneList.map(d => ({ id: d._id, name: d.name })));

            setDronesWithActiveOrders(dronesInUse);
        } catch (err) {
            console.error('Lỗi kiểm tra đơn hàng:', err);
        }
    };

    useEffect(() => {
        fetchDrones();
    }, []);

    const handleDelete = async (id) => {
        // Check if drone has active orders
        if (dronesWithActiveOrders.has(id)) {
            alert('Không thể xóa Drone này vì đang có đơn hàng đang được xử lý hoặc giao hàng!');
            return;
        }

        if (window.confirm('Bạn có chắc chắn muốn xóa Drone này?')) {
            try {
                await axios.delete(`${API_URL}/api/delivery/drones/${id}`);
                fetchDrones();
            } catch (err) {
                alert('Lỗi khi xóa Drone');
            }
        }
    };

    return (
        <>
            <AdminMenu />
            <div className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Quản Lý Drone</h1>
                    <button
                        onClick={() => navigate('/admin/drone/create')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded flex items-center shadow-md transition"
                    >
                        <span className="mr-2 text-xl">+</span> Thêm Drone
                    </button>
                </div>

                {loading ? <div className="text-center py-10">Đang tải dữ liệu...</div> : (
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                                    <th className="py-3 px-6 text-left">Tên Drone</th>
                                    <th className="py-3 px-6 text-center">Trạng Thái</th>
                                    <th className="py-3 px-6 text-center">Pin (%)</th>
                                    <th className="py-3 px-6 text-center">Vị Trí</th>
                                    <th className="py-3 px-6 text-center">Đơn Hàng</th>
                                    <th className="py-3 px-6 text-center">Hành Động</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm font-light">
                                {drones.map((drone) => {
                                    // Check both _id and name against droneId in orders
                                    const hasActiveOrders = dronesWithActiveOrders.has(drone._id) ||
                                        dronesWithActiveOrders.has(drone.name);

                                    console.log(`Checking drone ${drone.name} (${drone._id}):`, hasActiveOrders);

                                    return (
                                        <tr key={drone._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-6 text-left font-medium text-indigo-600">
                                                {drone.name}
                                            </td>
                                            <td className="py-3 px-6 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold
                                                    ${drone.status === 'IDLE' || drone.status === 'available' ? 'bg-green-100 text-green-800' :
                                                        drone.status === 'BUSY' || drone.status === 'busy' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'}`}>
                                                    {drone.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-6 text-center">
                                                <div className="flex items-center justify-center">
                                                    <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                                                        <div
                                                            className={`h-2.5 rounded-full ${drone.battery > 20 ? 'bg-green-500' : 'bg-red-500'}`}
                                                            style={{ width: `${drone.battery}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs">{drone.battery}%</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-6 text-center font-mono text-xs">
                                                {drone.currentLocation ?
                                                    `[${drone.currentLocation.lat?.toFixed(4)}, ${drone.currentLocation.lng?.toFixed(4)}]` :
                                                    'N/A'
                                                }
                                            </td>
                                            <td className="py-3 px-6 text-center">
                                                {hasActiveOrders ? (
                                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                                                        Đang giao hàng
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
                                                        onClick={() => navigate(`/admin/drone/${drone._id}/edit`)}
                                                        className="transform hover:text-indigo-500 hover:scale-110 transition"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => !hasActiveOrders && handleDelete(drone._id)}
                                                        disabled={hasActiveOrders}
                                                        className={`transform transition ${hasActiveOrders
                                                            ? 'text-gray-300 cursor-not-allowed opacity-50'
                                                            : 'hover:text-red-500 hover:scale-110 cursor-pointer'
                                                            }`}
                                                        title={hasActiveOrders ? 'Không thể xóa - Đang giao hàng' : 'Xóa'}
                                                        style={hasActiveOrders ? { pointerEvents: 'none' } : {}}
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

export default DroneListAdminPage;