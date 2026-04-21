import { secureStorage } from '../utils/security';

const SERVICES_KEY = 'luxor_individual_services';

const SERVICE_CATEGORIES = [
    { id: 'car_rental', label: 'Car Rental', icon: 'Car', color: 'blue' },
    { id: 'bicycle_rental', label: 'Bicycle Rental', icon: 'Bike', color: 'green' },
    { id: 'restaurant', label: 'Restaurant Booking', icon: 'UtensilsCrossed', color: 'orange' },
    { id: 'temple_visit', label: 'Temple Visit', icon: 'Landmark', color: 'purple' },
];

// Seed data
const SEED_SERVICES = [
    {
        id: 'svc-1', category: 'car_rental', name: 'Luxor Sedan - Full Day', vendorId: 'seed-vendor',
        vendorName: 'Nile Drive Co.', description: 'Comfortable air-conditioned sedan with professional driver for a full day exploring Luxor.',
        price: 85, duration: 'Full Day (8 hours)', location: 'Luxor City', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0e6e?w=600',
        capacity: '4 passengers', rating: 4.7, reviews: 42, status: 'approved', submittedAt: '2026-01-15T10:00:00Z',
    },
    {
        id: 'svc-2', category: 'car_rental', name: 'Luxor SUV - Half Day', vendorId: 'seed-vendor',
        vendorName: 'Nile Drive Co.', description: 'Spacious SUV ideal for families, includes driver and fuel for half-day trips around Luxor.',
        price: 65, duration: 'Half Day (4 hours)', location: 'Luxor City', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600',
        capacity: '6 passengers', rating: 4.5, reviews: 28, status: 'approved', submittedAt: '2026-01-16T10:00:00Z',
    },
    {
        id: 'svc-3', category: 'bicycle_rental', name: 'West Bank Bicycle Tour', vendorId: 'seed-vendor-2',
        vendorName: 'Luxor Bikes', description: 'Quality mountain bike rental with helmet and map for exploring the West Bank at your own pace.',
        price: 15, duration: '6 hours', location: 'West Bank, Luxor', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600',
        capacity: '1 person', rating: 4.8, reviews: 63, status: 'approved', submittedAt: '2026-01-17T10:00:00Z',
    },
    {
        id: 'svc-4', category: 'bicycle_rental', name: 'East Bank City Bike', vendorId: 'seed-vendor-2',
        vendorName: 'Luxor Bikes', description: 'Comfortable city bike perfect for cruising along the Corniche and through Luxor streets.',
        price: 10, duration: '4 hours', location: 'East Bank, Luxor', image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600',
        capacity: '1 person', rating: 4.6, reviews: 35, status: 'approved', submittedAt: '2026-01-18T10:00:00Z',
    },
    {
        id: 'svc-5', category: 'restaurant', name: 'Nile View Dinner Cruise', vendorId: 'seed-vendor-3',
        vendorName: 'Pharaoh Kitchen', description: 'Authentic Egyptian dinner aboard a traditional boat with live music and stunning Nile sunset views.',
        price: 45, duration: '3 hours', location: 'Nile River, Luxor', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600',
        capacity: 'Up to 8 guests', rating: 4.9, reviews: 87, status: 'approved', submittedAt: '2026-01-19T10:00:00Z',
    },
    {
        id: 'svc-6', category: 'restaurant', name: 'Traditional Luxor Breakfast', vendorId: 'seed-vendor-3',
        vendorName: 'Pharaoh Kitchen', description: 'Start your day with a classic Egyptian breakfast - ful medames, falafel, fresh bread and tea.',
        price: 12, duration: '1.5 hours', location: 'East Bank, Luxor', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600',
        capacity: 'Up to 6 guests', rating: 4.7, reviews: 54, status: 'approved', submittedAt: '2026-01-20T10:00:00Z',
    },
    {
        id: 'svc-7', category: 'temple_visit', name: 'Karnak Temple Guided Tour', vendorId: 'seed-vendor-4',
        vendorName: 'Thebes Guides', description: 'Expert-guided 2-hour tour of the Karnak Temple Complex with skip-the-line entry.',
        price: 35, duration: '2 hours', location: 'Karnak, East Bank', image: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=600',
        capacity: 'Up to 10 people', rating: 4.9, reviews: 112, status: 'approved', submittedAt: '2026-01-21T10:00:00Z',
    },
    {
        id: 'svc-8', category: 'temple_visit', name: 'Valley of the Kings Private Tour', vendorId: 'seed-vendor-4',
        vendorName: 'Thebes Guides', description: 'Private guided tour of the Valley of the Kings visiting 3 tombs with detailed historical commentary.',
        price: 55, duration: '3 hours', location: 'West Bank, Luxor', image: 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=600',
        capacity: 'Up to 6 people', rating: 4.8, reviews: 95, status: 'approved', submittedAt: '2026-01-22T10:00:00Z',
    },
];

class IndividualServicesService {
    constructor() {
        this._seed();
    }

    _seed() {
        try {
            const existing = secureStorage.getItem(SERVICES_KEY);
            if (existing && Array.isArray(existing) && existing.length > 0) return;
            secureStorage.setItem(SERVICES_KEY, SEED_SERVICES);
        } catch {
            secureStorage.setItem(SERVICES_KEY, SEED_SERVICES);
        }
    }

    getAll() {
        try {
            const data = secureStorage.getItem(SERVICES_KEY);
            return Array.isArray(data) ? data : [];
        } catch { return []; }
    }

    getApproved() { return this.getAll().filter(s => s.status === 'approved'); }
    getPending() { return this.getAll().filter(s => s.status === 'pending'); }
    getByVendor(vendorId) { return this.getAll().filter(s => s.vendorId === vendorId); }
    getById(id) { return this.getAll().find(s => s.id === id) || null; }
    getByCategory(category) { return this.getApproved().filter(s => s.category === category); }
    getCategories() { return SERVICE_CATEGORIES; }

    submit(data, vendor) {
        try {
            const services = this.getAll();
            const newService = {
                ...data,
                id: `svc-${Date.now()}`,
                vendorId: vendor.id,
                vendorName: vendor.companyName || `${vendor.firstName} ${vendor.lastName}`,
                status: 'pending',
                rating: 0, reviews: 0,
                submittedAt: new Date().toISOString(),
            };
            services.push(newService);
            secureStorage.setItem(SERVICES_KEY, services);
            return { success: true, service: newService };
        } catch { return { success: false, error: 'Failed to submit service' }; }
    }

    update(id, data, vendorId) {
        try {
            const services = this.getAll();
            const idx = services.findIndex(s => s.id === id && s.vendorId === vendorId);
            if (idx === -1) return { success: false, error: 'Service not found' };
            services[idx] = { ...services[idx], ...data, id, vendorId, updatedAt: new Date().toISOString() };
            secureStorage.setItem(SERVICES_KEY, services);
            return { success: true, service: services[idx] };
        } catch { return { success: false, error: 'Failed to update service' }; }
    }

    delete(id, vendorId) {
        try {
            const services = this.getAll();
            const filtered = services.filter(s => !(s.id === id && s.vendorId === vendorId));
            if (filtered.length === services.length) return { success: false, error: 'Service not found' };
            secureStorage.setItem(SERVICES_KEY, filtered);
            return { success: true };
        } catch { return { success: false, error: 'Failed to delete service' }; }
    }

    approve(id, adminId) {
        const services = this.getAll();
        const idx = services.findIndex(s => s.id === id);
        if (idx === -1) return { success: false, error: 'Service not found' };
        services[idx].status = 'approved';
        services[idx].reviewedAt = new Date().toISOString();
        services[idx].reviewedBy = adminId;
        secureStorage.setItem(SERVICES_KEY, services);
        return { success: true };
    }

    reject(id, adminId) {
        const services = this.getAll();
        const idx = services.findIndex(s => s.id === id);
        if (idx === -1) return { success: false, error: 'Service not found' };
        services[idx].status = 'rejected';
        services[idx].reviewedAt = new Date().toISOString();
        services[idx].reviewedBy = adminId;
        secureStorage.setItem(SERVICES_KEY, services);
        return { success: true };
    }
}

export default new IndividualServicesService();
