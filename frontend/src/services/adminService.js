import api from '../api/axios';

class AdminService {
    async getDashboardStats(params = {}) {
        try {
            const response = await api.get('/admin/dashboard', { params });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to load admin dashboard' };
        }
    }

    async getUsers(params = {}) {
        try {
            const response = await api.get('/admin/users', { params });
            return { success: true, ...response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to load users' };
        }
    }

    async deleteUser(userId) {
        try {
            const response = await api.delete(`/admin/users/${userId}`);
            return { success: true, message: response.data?.message || 'User removed successfully' };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to remove user' };
        }
    }

    async toggleSuspend(userId) {
        try {
            const response = await api.patch(`/admin/users/${userId}/suspend`);
            return { 
                success: true, 
                isSuspended: response.data.isSuspended,
                message: response.data.message 
            };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to update suspension status' };
        }
    }

    async getAttractions(params = {}) {
        try {
            const response = await api.get('/attractions', { params });
            return { success: true, ...response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to load attractions' };
        }
    }

    async createAttraction(payload) {
        try {
            const response = await api.post('/attractions', payload);
            return { success: true, attraction: response.data?.attraction };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to create attraction' };
        }
    }

    async updateAttraction(id, payload) {
        try {
            const response = await api.put(`/attractions/${id}`, payload);
            return { success: true, attraction: response.data?.attraction };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to update attraction' };
        }
    }

    async deleteAttraction(id) {
        try {
            const response = await api.delete(`/attractions/${id}`);
            return { success: true, message: response.data?.message || 'Attraction deleted successfully' };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to delete attraction' };
        }
    }
}

export default new AdminService();
