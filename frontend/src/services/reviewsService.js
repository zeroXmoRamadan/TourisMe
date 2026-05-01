import api from '../api/axios';

class ReviewsService {
    /** Get reviews for a target (service or attraction) */
    async getByTarget(targetId, params = {}) {
        try {
            const response = await api.get(`/reviews/target/${targetId}`, { params });
            return { success: true, ...response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to fetch reviews' };
        }
    }

    /** Check if the logged-in user already reviewed this target */
    async checkUserReview(targetId) {
        try {
            const response = await api.get(`/reviews/check/${targetId}`);
            return response.data; // { hasReviewed, review }
        } catch (error) {
            return { hasReviewed: false, review: null };
        }
    }

    /** Create a new review */
    async create({ targetId, targetModel, rating, comment }) {
        try {
            const response = await api.post('/reviews', { targetId, targetModel, rating, comment });
            return { success: true, review: response.data.review, stats: response.data.stats };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to submit review' };
        }
    }

    /** Update an existing review */
    async update(reviewId, { rating, comment }) {
        try {
            const response = await api.put(`/reviews/${reviewId}`, { rating, comment });
            return { success: true, review: response.data.review, stats: response.data.stats };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to update review' };
        }
    }

    /** Delete a review */
    async delete(reviewId) {
        try {
            const response = await api.delete(`/reviews/${reviewId}`);
            return { success: true, stats: response.data.stats };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to delete review' };
        }
    }
}

export default new ReviewsService();
