import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/** Authenticated tourists and local business owners only (e.g. shared notification inbox). */
const TouristOrVendorRoute = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user?.role !== 'Tourist' && user?.role !== 'LocalBusinessOwner') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default TouristOrVendorRoute;
