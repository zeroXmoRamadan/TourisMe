import api from '../api/axios';

class VendorService {
    async getAll(params = {}) {
        try {
            const response = await api.get('/services', { 
                params: { ...params, serviceType: 'TourPackage' } 
            });
            return response.data.services || response.data || [];
        } catch (error) {
            console.error('Error fetching programs:', error);
            return [];
        }
    }

    async getByVendor() {
        try {
            const response = await api.get('/services/owner/my-services');
            return response.data.services.filter(s => s.serviceType === 'TourPackage');
        } catch (error) {
            console.error('Error fetching programs:', error);
            return [];
        }
    }

    async submit(formData) {
        try {
            const response = await api.post('/services', formData);
            return { success: true, program: response.data.service };
        } catch (error) {
            return { success: false, error: error.response?.data?.error || error.response?.data?.message || 'Failed to submit program' };
        }
    }

    async update(id, formData) {
        try {
            const response = await api.put(`/services/${id}`, formData);
            return { success: true, program: response.data.service };
        } catch (error) {
            return { success: false, error: error.response?.data?.error || error.response?.data?.message || 'Failed to update program' };
        }
    }

    async delete(id) {
        try {
            await api.delete(`/services/${id}`);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to delete program' };
        }
    }

    async approve(id) {
        try {
            const response = await api.put(`/services/${id}/status`, { status: 'approved' });
            return { success: true, program: response.data.service };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to approve program' };
        }
    }

    async reject(id) {
        try {
            const response = await api.put(`/services/${id}/status`, { status: 'rejected' });
            return { success: true, program: response.data.service };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to reject program' };
        }
    }

    getStats(programs) {
        return {
            total: programs.length,
            totalBookings: programs.reduce((sum, p) => sum + (p.bookings || 0), 0),
        };
    }
}

export default new VendorService();
