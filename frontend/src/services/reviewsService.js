import { secureStorage } from '../utils/security';

const REVIEWS_KEY = 'luxor_reviews';

class ReviewsService {
    getAll() {
        return secureStorage.getItem(REVIEWS_KEY) || [];
    }

    /**
     * Get reviews for a specific target (e.g., a tour package or attraction).
     * @param {string} targetType - e.g. 'tour_packages', 'attractions'
     * @param {string} targetId - The ID of the specific item
     */
    getByTarget(targetType, targetId) {
        return this.getAll().filter(
            r => r.targetType === targetType && r.targetId === targetId
        ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    /**
     * Get average rating and review count for a target.
     */
    getAverageRating(targetType, targetId) {
        const reviews = this.getByTarget(targetType, targetId);
        if (reviews.length === 0) return { average: 0, count: 0 };

        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        return {
            average: Math.round((sum / reviews.length) * 10) / 10,
            count: reviews.length,
        };
    }

    /**
     * Check if a user has already reviewed a specific target.
     */
    getUserReview(targetType, targetId, userId) {
        return this.getAll().find(
            r => r.targetType === targetType &&
                r.targetId === targetId &&
                r.userId === userId
        ) || null;
    }

    /**
     * Create or update a review. One review per user per target.
     */
    create(reviewData) {
        try {
            const reviews = this.getAll();
            const { targetType, targetId, userId } = reviewData;

            // Check if user already reviewed this target
            const existingIndex = reviews.findIndex(
                r => r.targetType === targetType &&
                    r.targetId === targetId &&
                    r.userId === userId
            );

            const review = {
                ...reviewData,
                id: existingIndex >= 0 ? reviews[existingIndex].id : `rev-${Date.now()}`,
                createdAt: existingIndex >= 0 ? reviews[existingIndex].createdAt : new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            if (existingIndex >= 0) {
                reviews[existingIndex] = review;
            } else {
                reviews.push(review);
            }

            secureStorage.setItem(REVIEWS_KEY, reviews);
            return { success: true, review };
        } catch (error) {
            return { success: false, error: 'Failed to save review' };
        }
    }

    /**
     * Delete a review by ID. Used for admin moderation.
     */
    delete(id) {
        try {
            const reviews = this.getAll();
            const filtered = reviews.filter(r => r.id !== id);
            if (filtered.length === reviews.length) {
                return { success: false, error: 'Review not found' };
            }
            secureStorage.setItem(REVIEWS_KEY, filtered);
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Failed to delete review' };
        }
    }

    /**
     * Delete all reviews for a specific target (e.g., when deleting an attraction).
     */
    deleteByTarget(targetType, targetId) {
        const reviews = this.getAll();
        const filtered = reviews.filter(
            r => !(r.targetType === targetType && r.targetId === targetId)
        );
        secureStorage.setItem(REVIEWS_KEY, filtered);
    }
}

export default new ReviewsService();
