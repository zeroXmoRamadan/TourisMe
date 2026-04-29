import api from '../api/axios';

class UserService {
    async getProfile() {
        try {
            const response = await api.get('/users/profile');
            return { success: true, user: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to fetch profile' };
        }
    }

    async updateProfile(updates) {
        try {
            const response = await api.put('/users/profile', updates);
            return { success: true, user: response.data.user };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to update profile' };
        }
    }

    async changePassword(currentPassword, newPassword) {
        try {
            const response = await api.put('/users/password', { currentPassword, newPassword });
            return { success: true, message: response.data.message };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to change password' };
        }
    }

    async deleteAccount(password) {
        try {
            const response = await api.delete('/users/profile', { data: { password } });
            return { success: true, message: response.data.message };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to delete account' };
        }
    }

    async getFavorites() {
        try {
            const response = await api.get('/users/favorites');
            return { success: true, favorites: response.data.favorites };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to fetch favorites' };
        }
    }

    async addFavorite(attractionId) {
        try {
            const response = await api.post(`/users/favorites/${attractionId}`);
            return { success: true, favorites: response.data.favorites };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to add favorite' };
        }
    }

    async removeFavorite(attractionId) {
        try {
            const response = await api.delete(`/users/favorites/${attractionId}`);
            return { success: true, favorites: response.data.favorites };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to remove favorite' };
        }
    }
}

export default new UserService();
