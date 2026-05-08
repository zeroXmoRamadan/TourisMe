import api from '../api/axios';

const SERVICE_CATEGORIES = [
    { id: 'Rental', label: 'Vehicle/Equipment Rental', icon: 'Car', color: 'blue' },
    { id: 'Restaurant', label: 'Restaurant', icon: 'UtensilsCrossed', color: 'orange' },
];

class IndividualServicesService {
    getCategories() { return SERVICE_CATEGORIES; }

    async getAll(params = {}) {
        try {
            const response = await api.get('/services', { params });
            const services = response.data.services || response.data || [];
            // Filter out TourPackages as this service is for individual services
            return services.filter(s => s.serviceType !== 'TourPackage');
        } catch (error) {
            console.error('Error fetching services:', error);
            return [];
        }
    }

    async getApproved() {
        try {
            const response = await api.get('/services');
            return response.data.services || response.data || [];
        } catch (error) {
            console.error('Error fetching services:', error);
            return [];
        }
    }

    async getById(id) {
        try {
            const response = await api.get(`/services/${id}`);
            return { success: true, service: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Service not found' };
        }
    }


    async getByVendor() {
        try {
            const response = await api.get('/services/owner/my-services');
            return response.data.services.filter(s => s.serviceType !== 'TourPackage');
        } catch (error) {
            console.error('Error fetching services:', error);
            return [];
        }
    }

    async submit(formData) {
        try {
            const response = await api.post('/services', formData);
            return { success: true, service: response.data.service };
        } catch (error) {
            return { success: false, error: error.response?.data?.error || error.response?.data?.message || 'Failed to submit service' };
        }
    }

    async update(id, formData) {
        try {
            const response = await api.put(`/services/${id}`, formData);
            return { success: true, service: response.data.service };
        } catch (error) {
            return { success: false, error: error.response?.data?.error || error.response?.data?.message || 'Failed to update service' };
        }
    }

    async delete(id) {
        try {
            await api.delete(`/services/${id}`);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to delete service' };
        }
    }

    async approve(id) {
        try {
            const response = await api.put(`/services/${id}/status`, { status: 'approved' });
            return { success: true, service: response.data.service };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to approve service' };
        }
    }

    async reject(id) {
        try {
            const response = await api.put(`/services/${id}/status`, { status: 'rejected' });
            return { success: true, service: response.data.service };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to reject service' };
        }
    }
}

export default new IndividualServicesService();
