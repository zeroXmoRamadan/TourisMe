import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const currentUser = await authService.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    const login = async (email, password) => {
        const result = await authService.login(email, password);
        if (result.success) {
            setUser(result.user);
        }
        return result;
    };

    const register = async (userData) => {
        const result = await authService.register(userData);
        if (result.success) {
            setUser(result.user);
        }
        return result;
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    const updateProfile = async (updates) => {
        const result = await userService.updateProfile(updates);
        if (result.success) {
            setUser(result.user);
        }
        return result;
    };

    const changePassword = async (currentPassword, newPassword) => {
        return await userService.changePassword(currentPassword, newPassword);
    };

    const deleteAccount = async (password) => {
        const result = await userService.deleteAccount(password);
        if (result.success) {
            logout();
        }
        return result;
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin' || user?.role === 'Admin',
        isVendor: user?.role === 'vendor' || user?.role === 'LocalBusinessOwner',
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        deleteAccount,
    };

    if (loading) {
        return null; // Or a loading spinner
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
