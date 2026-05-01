import api from '../api/axios';

class TripPlannerService {
    mapTrip(trip) {
        if (!trip) return null;
        
        const mappedItems = (trip.itineraryItems || []).map(item => {
            const target = item.attractionId || item.serviceId;
            return {
                id: item._id, // itinerary item ID
                targetId: target?._id,
                category: target?.category || target?.serviceType || 'unknown',
                serviceName: target?.name || 'Unknown',
                image: target?.images?.[0] || 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=100',
                price: target?.price || target?.ticketPrice || 0,
                duration: target?.openingHours || 'N/A',
                vendor: target?.ownerId?.companyName || target?.ownerId?.name || 'Luxor Local',
            };
        });

        const totalBudget = mappedItems.reduce((sum, item) => sum + (item.price || 0), 0) + (trip.budget || 0);

        return {
            ...trip,
            id: trip._id,
            name: trip.title,
            date: trip.startDate ? new Date(trip.startDate).toISOString().split('T')[0] : '',
            items: mappedItems,
            totalBudget
        };
    }

    async getAll() {
        try {
            const response = await api.get('/trip-plans');
            return response.data.map(this.mapTrip);
        } catch (error) {
            return [];
        }
    }

    async getByUser(userId) {
        // The API returns trips for the authenticated user, so we just return getAll
        return this.getAll();
    }

    async getById(id) {
        try {
            const response = await api.get(`/trip-plans/${id}`);
            return this.mapTrip(response.data);
        } catch (error) {
            return null;
        }
    }

    async create(userId, userName, tripData) {
        try {
            const response = await api.post('/trip-plans', {
                title: tripData.name || 'My Luxor Trip',
                startDate: tripData.date,
                notes: tripData.notes,
            });
            // Map the backend response slightly to match what frontend expects
            const trip = this.mapTrip(response.data.trip);
            return { success: true, trip };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to create trip' };
        }
    }

    async update(id, userId, updates) {
        try {
            const response = await api.put(`/trip-plans/${id}`, updates);
            const trip = this.mapTrip(response.data.trip);
            return { success: true, trip };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to update trip' };
        }
    }

    async addItem(tripId, userId, itemData) {
        try {
            // Check if itemData is an attraction or service. Service has id and category.
            const payload = {
                dayNumber: itemData.dayNumber || 1,
            };
            if (itemData.isAttraction) {
                payload.attractionId = itemData.id;
            } else {
                payload.serviceId = itemData.id;
            }

            const response = await api.post(`/trip-plans/${tripId}/items`, payload);
            const trip = this.mapTrip(response.data.trip);
            return { success: true, trip };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to add item' };
        }
    }

    async removeItem(tripId, userId, itemId) {
        try {
            const response = await api.delete(`/trip-plans/${tripId}/items/${itemId}`);
            const trip = this.mapTrip(response.data.trip);
            return { success: true, trip };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to remove item' };
        }
    }

    async updateStatus(id, userId, status) {
        return this.update(id, userId, { status });
    }

    async delete(id, userId) {
        try {
            await api.delete(`/trip-plans/${id}`);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to delete trip' };
        }
    }

    async getStats() {
        try {
            const response = await api.get('/trip-plans/stats');
            return response.data;
        } catch (error) {
            return {};
        }
    }
}

export default new TripPlannerService();
