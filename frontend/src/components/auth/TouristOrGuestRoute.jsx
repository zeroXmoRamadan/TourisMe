import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const TouristOrGuestRoute = ({ children }) => {
    const { user, isAuthenticated } = useAuth();

    if (isAuthenticated) {
        if (user?.role === 'LocalBusinessOwner') {
            return <Navigate to="/vendor/dashboard" replace />;
        }
        if (user?.role === 'Admin') {
            return <Navigate to="/admin/dashboard" replace />;
        }
    }

    return children;
};

export default TouristOrGuestRoute;
