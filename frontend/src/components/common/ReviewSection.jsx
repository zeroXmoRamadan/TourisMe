import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import reviewsService from '../../services/reviewsService';
import StarRating from './StarRating';
import Button from './Button';
import Card from './Card';

const ReviewSection = ({ targetType, targetId }) => {
    const { user, isAuthenticated, isAdmin } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [ratingStats, setRatingStats] = useState({ average: 0, count: 0 });
    const [newRating, setNewRating] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [myReview, setMyReview] = useState(null);

    const loadReviews = async () => {
        setIsLoading(true);
        const result = await reviewsService.getByTarget(targetId);
        if (result.success) {
            setReviews(result.reviews || []);
            setRatingStats({
                average: result.stats?.averageRating || 0,
                count: result.stats?.totalReviews || 0
            });
        }

        // Check if user has existing review
        if (isAuthenticated) {
            const check = await reviewsService.checkUserReview(targetId);
            if (check.hasReviewed && check.review) {
                setMyReview(check.review);
                setNewRating(check.review.rating);
                setNewComment(check.review.comment || '');
            }
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadReviews();
    }, [targetId, isAuthenticated]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newRating || !newComment.trim()) return;

        setIsSubmitting(true);
        let result;
        if (myReview) {
            result = await reviewsService.update(myReview._id, {
                rating: newRating,
                comment: newComment.trim()
            });
        } else {
            result = await reviewsService.create({
                targetId,
                targetModel: targetType, // This should be 'Attraction' or 'Service'
                rating: newRating,
                comment: newComment.trim(),
            });
        }

        if (result.success) {
            await loadReviews();
            setShowForm(false);
        } else {
            alert(result.error || 'Failed to submit review');
        }

        setIsSubmitting(false);
    };

    const handleDelete = async (reviewId) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            const result = await reviewsService.delete(reviewId);
            if (result.success) {
                await loadReviews();
                if (myReview?._id === reviewId) {
                    setMyReview(null);
                    setNewRating(0);
                    setNewComment('');
                }
            } else {
                alert(result.error || 'Failed to delete review');
            }
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <Card className="detail-card">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-primary-400" />
                    Reviews & Ratings
                </h2>
                {ratingStats.count > 0 && (
                    <div className="flex items-center gap-3">
                        <StarRating rating={ratingStats.average} size="md" />
                        <span className="text-xl font-bold text-white">{ratingStats.average}</span>
                        <span className="text-white/40">({ratingStats.count} review{ratingStats.count !== 1 ? 's' : ''})</span>
                    </div>
                )}
            </div>

            {/* Write Review Button / Form */}
            {isAuthenticated && (
                <div className="mb-8">
                    {!showForm ? (
                        <Button
                            variant="outline"
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2"
                        >
                            <MessageSquare className="w-4 h-4" />
                            {myReview ? 'Edit Your Review' : 'Write a Review'}
                        </Button>
                    ) : (
                        <div className="bg-dark-700/50 border border-white/10 rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">
                                {myReview ? 'Update Your Review' : 'Write a Review'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        Your Rating
                                    </label>
                                    <StarRating
                                        rating={newRating}
                                        size="xl"
                                        interactive
                                        onChange={setNewRating}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        Your Review
                                    </label>
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-300"
                                        placeholder="Share your experience..."
                                        required
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        loading={isSubmitting}
                                        disabled={!newRating || !newComment.trim()}
                                        className="flex items-center gap-2"
                                    >
                                        <Send className="w-4 h-4" />
                                        {myReview ? 'Update Review' : 'Submit Review'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setShowForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {!isAuthenticated && (
                <div className="mb-8 bg-dark-700/30 border border-white/5 rounded-xl p-4 text-center">
                    <p className="text-white/50">
                        <a href="/login" className="text-primary-400 hover:text-primary-300 transition-colors">Sign in</a> to leave a review
                    </p>
                </div>
            )}

            {/* Reviews List */}
            {isLoading ? (
                <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-white/40">Loading reviews...</p>
                </div>
            ) : reviews.length > 0 ? (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div
                            key={review._id}
                            className="bg-dark-700/30 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all duration-300"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                        {review.touristId?.firstName ? 
                                            `${review.touristId.firstName[0]}${review.touristId.lastName?.[0] || ''}`.toUpperCase() :
                                            (review.userName || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">
                                            {review.touristId?.firstName ? `${review.touristId.firstName} ${review.touristId.lastName || ''}` : review.userName}
                                        </p>
                                        <p className="text-xs text-white/40">
                                            {formatDate(review.updatedAt || review.createdAt)}
                                            {review.updatedAt && review.updatedAt !== review.createdAt && ' (edited)'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <StarRating rating={review.rating} size="sm" />
                                    {/* Admin can delete any review, user can delete own review */}
                                    {(isAdmin || (user && (user._id === review.touristId?._id || user._id === review.touristId))) && (
                                        <button
                                            onClick={() => handleDelete(review._id)}
                                            className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors group"
                                            title="Delete review"
                                        >
                                            <Trash2 className="w-4 h-4 text-white/30 group-hover:text-red-400 transition-colors" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="text-white/70 leading-relaxed">{review.comment}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-white/10 mx-auto mb-3" />
                    <p className="text-white/40">No reviews yet. Be the first to share your experience!</p>
                </div>
            )}
        </Card>
    );
};

export default ReviewSection;
