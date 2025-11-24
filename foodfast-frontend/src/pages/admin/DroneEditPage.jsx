import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import AdminMenu from '../../components/AdminMenu';
import LocationPicker from '../../components/LocationPicker';

const DroneEditPage = () => {
    const { id } = useParams(); // Nếu có id là Edit, không có là Create
    const isEditMode = !!id;

    const navigate = useNavigate();
    const { userInfo } = useContext(AuthContext);

    const [name, setName] = useState('');
    const [status, setStatus] = useState('IDLE');
    const [battery, setBattery] = useState(100);
    const [location, setLocation] = useState({ lat: 10.7769, lng: 106.7009 }); // Mặc định HCM
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

    useEffect(() => {
        if (isEditMode) {
            const fetchDrone = async () => {
                try {
                    const { data } = await axios.get(`${API_URL}/api/delivery/drones/${id}`);
                    setName(data.name);
                    setStatus(data.status);
                    setBattery(data.battery);
                    if (data.currentLocation) {
                        setLocation(data.currentLocation);
                    }
                } catch (err) {
                    setError('Không tìm thấy Drone');
                }
            };
            fetchDrone();
        }
    }, [id, isEditMode]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const droneData = {
                name,
                status,
                battery: Number(battery),
                location
            };

            if (isEditMode) {
                await axios.put(`${API_URL}/api/delivery/drones/${id}`, droneData);
                alert('Cập nhật Drone thành công!');
            } else {
                await axios.post(`${API_URL}/api/delivery/drones`, droneData);
                alert('Tạo Drone mới thành công!');
            }
            navigate('/admin/dronelist');
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
            setLoading(false);
        }
    };

    return (
        <>
            <AdminMenu />
            <div className="container mx-auto p-6 max-w-4xl">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">
                    {isEditMode ? 'Chỉnh Sửa Drone' : 'Thêm Drone Mới'}
                </h1>

                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

                <form onSubmit={submitHandler} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Cột Trái: Thông tin cơ bản */}
                    <div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                                Tên Drone
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="name"
                                type="text"
                                placeholder="Nhập tên Drone"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                                Trạng Thái
                            </label>
                            <select
                                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="IDLE">Rảnh (IDLE)</option>
                                <option value="BUSY">Bận (BUSY)</option>
                                <option value="MAINTENANCE">Bảo trì (MAINTENANCE)</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="battery">
                                Pin (%)
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="battery"
                                type="number"
                                min="0"
                                max="100"
                                value={battery}
                                onChange={(e) => setBattery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Cột Phải: Bản đồ chọn vị trí */}
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Vị Trí Hiện Tại
                        </label>
                        <div className="h-64 border rounded overflow-hidden mb-2">
                            <LocationPicker
                                onLocationSelect={setLocation}
                                initialPosition={[location.lat, location.lng]}
                            />
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                            Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                        </p>
                    </div>

                    {/* Nút Submit */}
                    <div className="md:col-span-2 flex items-center justify-between mt-4">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full md:w-auto"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : (isEditMode ? 'Cập Nhật' : 'Tạo Mới')}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/admin/dronelist')}
                            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                        >
                            Hủy bỏ
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default DroneEditPage;
