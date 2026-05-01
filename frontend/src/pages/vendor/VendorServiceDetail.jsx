import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, MapPin, DollarSign, Package, User, CalendarDays } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import individualServicesService from '../../services/individualServicesService';
import reviewsService from '../../services/reviewsService';

const VendorServiceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [service, setService] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const serviceRes = await individualServicesService.getById(id);
                if (serviceRes.success) {
                    setService(serviceRes.service);
                } else {
                    setError(serviceRes.error);
                }

                const reviewsRes = await reviewsService.getByTarget(id);
                if (reviewsRes.success) {
                    setReviews(reviewsRes.reviews || []);
                    setStats(reviewsRes.stats || { averageRating: 0, totalReviews: 0 });
                }
            } catch (err) {
                setError('Failed to load service details.');
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-900 pt-24 pb-12 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-primary-500/30 border-t-primary-500 animate-spin" />
            </div>
        );
    }

    if (error || !service) {
        return (
            <div className="min-h-screen bg-dark-900 pt-24 pb-12 px-4 text-center">
                <Alert type="error" message={error || 'Service not found'} />
                <Button variant="ghost" onClick={() => navigate('/vendor/dashboard')} className="mt-4">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Button>
            </div>
        );
    }

    // Determine the type for rendering
    const isProgram = service.serviceType === 'TourPackage';

    return (
        <div className="min-h-screen bg-dark-900 pt-24 pb-16">
            <div className="container-custom max-w-5xl">
                {/* Header Actions */}
                <div className="flex items-center justify-between mb-6">
                    <Button variant="ghost" onClick={() => navigate('/vendor/dashboard')} className="text-white/60 hover:text-white">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                    </Button>
                    <button
                        onClick={() => navigate(`/vendor/bookings?serviceId=${id}`)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary-500/10 text-primary-400 border border-primary-500/20 hover:bg-primary-500/20 transition-all"
                    >
                        <CalendarDays className="w-4 h-4" /> View Bookings
                    </button>
                </div>

                {/* Service Details Card */}
                <Card className="mb-8 overflow-hidden p-0">
                    <div className="h-64 md:h-80 w-full relative">
                        <img
                            src={service.images?.[0] || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0e6e?w=1200'}
                            alt={service.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/50 to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6">
                            <div className="flex flex-wrap items-end justify-between gap-4">
                                <div>
                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary-500/20 text-primary-400 mb-3 border border-primary-500/30">
                                        {isProgram ? 'Tour Program' : service.serviceType}
                                    </span>
                                    <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                                        {service.name}
                                    </h1>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-white">${service.price}</div>
                                    <div className="text-white/60 text-sm">{isProgram ? 'per person' : 'per booking'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 md:p-8">
                        {/* Quick Stats Banner */}
                        <div className="flex flex-wrap items-center gap-6 pb-6 mb-6 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
                                <span className="text-lg font-bold text-white">{stats.averageRating ? stats.averageRating.toFixed(1) : 'New'}</span>
                                <span className="text-white/50 text-sm">({stats.totalReviews} reviews)</span>
                            </div>
                            {isProgram && service.durationDays && (
                                <div className="flex items-center gap-2 text-white/80">
                                    <Clock className="w-5 h-5 text-primary-400" />
                                    <span>{service.durationDays} Days</span>
                                </div>
                            )}
                            {service.location && (
                                <div className="flex items-center gap-2 text-white/80">
                                    <MapPin className="w-5 h-5 text-secondary-400" />
                                    <span>{service.location}</span>
                                </div>
                            )}
                        </div>

                        <div className="prose prose-invert max-w-none">
                            <h3 className="text-xl font-bold text-white mb-3">About this {isProgram ? 'program' : 'service'}</h3>
                            <p className="text-white/70 leading-relaxed mb-6">
                                {service.description || 'No description provided.'}
                            </p>

                            {isProgram && service.itinerary && (
                                <>
                                    <h3 className="text-xl font-bold text-white mb-3 mt-8">Itinerary</h3>
                                    <div className="bg-dark-700/30 rounded-xl p-5 border border-white/5 whitespace-pre-line text-white/80">
                                        {service.itinerary}
                                    </div>
                                </>
                            )}

                            {isProgram && service.includedItems && service.includedItems.length > 0 && (
                                <>
                                    <h3 className="text-xl font-bold text-white mb-3 mt-8">What's Included</h3>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {service.includedItems.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-white/70">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Reviews Section */}
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Star className="w-6 h-6 text-yellow-400" fill="currentColor" />
                    Reviews & Ratings
                </h2>

                {reviews.length === 0 ? (
                    <Card className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-dark-700/50 flex items-center justify-center mx-auto mb-4">
                            <Star className="w-8 h-8 text-white/20" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No Reviews Yet</h3>
                        <p className="text-white/50">When tourists review this {isProgram ? 'program' : 'service'}, their feedback will appear here.</p>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {reviews.map(review => (
                            <Card key={review._id} className="p-6 border-l-4 border-l-primary-500">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                                            <User className="w-5 h-5 text-white/70" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">
                                                {review.touristId ? `${review.touristId.firstName} ${review.touristId.lastName}` : 'Tourist'}
                                            </div>
                                            <div className="text-xs text-white/40">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center bg-yellow-500/10 px-2 py-1 rounded-lg">
                                        <Star className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" />
                                        <span className="font-bold text-yellow-400 text-sm">{review.rating.toFixed(1)}</span>
                                    </div>
                                </div>
                                <p className="text-white/80 leading-relaxed">
                                    "{review.comment}"
                                </p>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorServiceDetail;
