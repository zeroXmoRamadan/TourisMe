import api from '../api/axios';

class BookingService {
    /**
     * Create a new booking (Tourist only)
     * @param {{ serviceId: string, serviceDate: string, numberOfPeople: number, specialRequests?: string }} data
     */
    async create(data) {
        try {
            const response = await api.post('/bookings', data);
            return { success: true, booking: response.data.booking };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to create booking',
            };
        }
    }

    /** Get all bookings for the currently logged-in user (filtered server-side by role) */
    async getMyBookings(params = {}) {
        try {
            const response = await api.get('/bookings', { params });
            return { success: true, ...response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to fetch bookings' };
        }
    }

    /** Get a single booking by ID */
    async getById(id) {
        try {
            const response = await api.get(`/bookings/${id}`);
            return { success: true, booking: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Booking not found' };
        }
    }

    /** Cancel a booking (Tourist: only cancel allowed) */
    async cancel(id) {
        try {
            const response = await api.put(`/bookings/${id}/status`, { status: 'Cancelled' });
            return { success: true, booking: response.data.booking };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to cancel booking' };
        }
    }

    /** Update booking details (date / people / notes) */
    async update(id, data) {
        try {
            const response = await api.put(`/bookings/${id}`, data);
            return { success: true, booking: response.data.booking };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to update booking' };
        }
    }

    /** Update booking status (Vendor: Confirmed / Cancelled / Completed) */
    async updateStatus(id, status) {
        try {
            const response = await api.put(`/bookings/${id}/status`, { status });
            return { success: true, booking: response.data.booking };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to update booking status' };
        }
    }
}

export default new BookingService();
