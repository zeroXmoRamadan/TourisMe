import { attractionsSeedData } from '../data/attractionsData';
import { secureStorage } from '../utils/security';

const ATTRACTIONS_KEY = 'luxor_attractions';

class AttractionsService {
    constructor() {
        this._ensureSeeded();
    }

    _ensureSeeded() {
        try {
            const existing = secureStorage.getItem(ATTRACTIONS_KEY);
            if (!existing || !Array.isArray(existing) || existing.length === 0) {
                secureStorage.setItem(ATTRACTIONS_KEY, attractionsSeedData);
            }
        } catch (e) {
            // If reading/writing fails, clear and retry
            secureStorage.removeItem(ATTRACTIONS_KEY);
            secureStorage.setItem(ATTRACTIONS_KEY, attractionsSeedData);
        }
    }

    getAll() {
        return secureStorage.getItem(ATTRACTIONS_KEY) || [];
    }

    getById(id) {
        const attractions = this.getAll();
        return attractions.find(a => a.id === id) || null;
    }

    create(data) {
        try {
            const attractions = this.getAll();
            const newAttraction = {
                ...data,
                id: `attr-${Date.now()}`,
                rating: 0,
                reviewCount: 0,
                tripPlanReady: true,
                createdAt: new Date().toISOString(),
            };
            attractions.push(newAttraction);
            secureStorage.setItem(ATTRACTIONS_KEY, attractions);
            return { success: true, attraction: newAttraction };
        } catch (error) {
            return { success: false, error: 'Failed to create attraction' };
        }
    }

    update(id, data) {
        try {
            const attractions = this.getAll();
            const index = attractions.findIndex(a => a.id === id);
            if (index === -1) {
                return { success: false, error: 'Attraction not found' };
            }
            attractions[index] = {
                ...attractions[index],
                ...data,
                id, // Prevent id overwrite
                updatedAt: new Date().toISOString(),
            };
            secureStorage.setItem(ATTRACTIONS_KEY, attractions);
            return { success: true, attraction: attractions[index] };
        } catch (error) {
            return { success: false, error: 'Failed to update attraction' };
        }
    }

    delete(id) {
        try {
            const attractions = this.getAll();
            const filtered = attractions.filter(a => a.id !== id);
            if (filtered.length === attractions.length) {
                return { success: false, error: 'Attraction not found' };
            }
            secureStorage.setItem(ATTRACTIONS_KEY, filtered);
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Failed to delete attraction' };
        }
    }

    search(query) {
        const attractions = this.getAll();
        const q = query.toLowerCase();
        return attractions.filter(a =>
            a.name.toLowerCase().includes(q) ||
            a.description.toLowerCase().includes(q) ||
            a.location.toLowerCase().includes(q)
        );
    }

    filterByCategory(category) {
        if (!category) return this.getAll();
        return this.getAll().filter(a => a.category === category);
    }

    filter({ category, searchQuery } = {}) {
        let results = this.getAll();
        if (category) {
            results = results.filter(a => a.category === category);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            results = results.filter(a =>
                a.name.toLowerCase().includes(q) ||
                a.description.toLowerCase().includes(q) ||
                a.location.toLowerCase().includes(q)
            );
        }
        return results;
    }

    getCategories() {
        const attractions = this.getAll();
        return [...new Set(attractions.map(a => a.category))];
    }

    updateRating(id, avgRating, reviewCount) {
        const attractions = this.getAll();
        const index = attractions.findIndex(a => a.id === id);
        if (index !== -1) {
            attractions[index].rating = avgRating;
            attractions[index].reviewCount = reviewCount;
            secureStorage.setItem(ATTRACTIONS_KEY, attractions);
        }
    }
}

export default new AttractionsService();
