import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const VendorRoute = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    if (user?.role !== 'vendor' && user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default VendorRoute;
