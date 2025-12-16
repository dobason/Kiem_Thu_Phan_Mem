// src/components/AdminRoute.jsx
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { userInfo } = useContext(AuthContext);
    const location = useLocation();

    if (userInfo && !userInfo.isAdmin) {
        // Nếu chưa đăng nhập, chuyển hướng đến trang login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default AdminRoute;