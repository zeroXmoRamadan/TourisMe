import api from '../api/axios';

class AttractionsService {
    async getAll(params = {}) {
        try {
            const response = await api.get('/attractions', { params });
            return { 
                success: true, 
                attractions: response.data.attractions || [],
                totalAttractions: response.data.totalAttractions || 0
            };
        } catch (error) {
            console.error('Error fetching attractions:', error);
            return { success: false, error: error.response?.data?.message || 'Failed to fetch attractions' };
        }
    }

    async getById(id) {
        try {
            const response = await api.get(`/attractions/${id}`);
            return { 
                success: true, 
                attraction: response.data.attraction || response.data 
            };
        } catch (error) {
            console.error('Error fetching attraction details:', error);
            return { success: false, error: error.response?.data?.message || 'Failed to fetch attraction details' };
        }
    }

    async filter({ category, searchQuery } = {}) {
        const params = {};
        if (category) params.category = category;
        if (searchQuery) params.search = searchQuery;
        
        return this.getAll(params);
    }

    async getCategories() {
        try {
            const result = await this.getAll({ limit: 100 });
            if (result.success) {
                const cats = result.attractions.map(a => a.category);
                return [...new Set(cats.filter(Boolean))];
            }
            return [];
        } catch (error) {
            return [];
        }
    }
}

export default new AttractionsService();
