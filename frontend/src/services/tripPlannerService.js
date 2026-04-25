import { secureStorage } from '../utils/security';

const TRIPS_KEY = 'luxor_trip_plans';

class TripPlannerService {
    getAll() {
        try {
            const data = secureStorage.getItem(TRIPS_KEY);
            return Array.isArray(data) ? data : [];
        } catch { return []; }
    }

    getByUser(userId) { return this.getAll().filter(t => t.userId === userId); }
    getById(id) { return this.getAll().find(t => t.id === id) || null; }

    create(userId, userName, tripData) {
        try {
            const trips = this.getAll();
            const newTrip = {
                id: `trip-${Date.now()}`,
                userId,
                userName,
                name: tripData.name || 'My Luxor Trip',
                date: tripData.date || new Date().toISOString().split('T')[0],
                notes: tripData.notes || '',
                items: [], // { serviceId, serviceName, category, price, time, vendor }
                status: 'planning', // planning | confirmed | completed | cancelled
                totalBudget: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            trips.push(newTrip);
            secureStorage.setItem(TRIPS_KEY, trips);
            return { success: true, trip: newTrip };
        } catch { return { success: false, error: 'Failed to create trip' }; }
    }

    update(id, userId, updates) {
        try {
            const trips = this.getAll();
            const idx = trips.findIndex(t => t.id === id && t.userId === userId);
            if (idx === -1) return { success: false, error: 'Trip not found' };
            trips[idx] = { ...trips[idx], ...updates, updatedAt: new Date().toISOString() };
            secureStorage.setItem(TRIPS_KEY, trips);
            return { success: true, trip: trips[idx] };
        } catch { return { success: false, error: 'Failed to update trip' }; }
    }

    addItem(tripId, userId, service) {
        try {
            const trips = this.getAll();
            const idx = trips.findIndex(t => t.id === tripId && t.userId === userId);
            if (idx === -1) return { success: false, error: 'Trip not found' };

            const item = {
                id: `item-${Date.now()}`,
                serviceId: service.id,
                serviceName: service.name,
                category: service.category,
                price: service.price,
                duration: service.duration,
                vendor: service.vendorName,
                image: service.image,
                addedAt: new Date().toISOString(),
            };

            trips[idx].items.push(item);
            trips[idx].totalBudget = trips[idx].items.reduce((sum, i) => sum + (i.price || 0), 0);
            trips[idx].updatedAt = new Date().toISOString();
            secureStorage.setItem(TRIPS_KEY, trips);
            return { success: true, trip: trips[idx] };
        } catch { return { success: false, error: 'Failed to add item' }; }
    }

    removeItem(tripId, userId, itemId) {
        try {
            const trips = this.getAll();
            const idx = trips.findIndex(t => t.id === tripId && t.userId === userId);
            if (idx === -1) return { success: false, error: 'Trip not found' };

            trips[idx].items = trips[idx].items.filter(i => i.id !== itemId);
            trips[idx].totalBudget = trips[idx].items.reduce((sum, i) => sum + (i.price || 0), 0);
            trips[idx].updatedAt = new Date().toISOString();
            secureStorage.setItem(TRIPS_KEY, trips);
            return { success: true, trip: trips[idx] };
        } catch { return { success: false, error: 'Failed to remove item' }; }
    }

    updateStatus(id, userId, status) {
        return this.update(id, userId, { status });
    }

    delete(id, userId) {
        try {
            const trips = this.getAll();
            const filtered = trips.filter(t => !(t.id === id && t.userId === userId));
            if (filtered.length === trips.length) return { success: false, error: 'Trip not found' };
            secureStorage.setItem(TRIPS_KEY, filtered);
            return { success: true };
        } catch { return { success: false, error: 'Failed to delete trip' }; }
    }

    // Admin: get all trips across all users
    getAllTrips() { return this.getAll(); }

    getStats() {
        const trips = this.getAll();
        return {
            total: trips.length,
            planning: trips.filter(t => t.status === 'planning').length,
            confirmed: trips.filter(t => t.status === 'confirmed').length,
            completed: trips.filter(t => t.status === 'completed').length,
            cancelled: trips.filter(t => t.status === 'cancelled').length,
            totalRevenue: trips.filter(t => t.status !== 'cancelled').reduce((s, t) => s + (t.totalBudget || 0), 0),
        };
    }
}

export default new TripPlannerService();
