import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import {
    Car, UtensilsCrossed, Landmark, Star, MapPin, ArrowLeft, Plus,
    ChevronLeft, ChevronRight, User, Phone, Mail, Clock, Users,
    Utensils, Truck, Package, Loader2, AlertCircle, CheckCircle,
    DollarSign, Calendar
} from 'lucide-react';
import individualServicesService from '../services/individualServicesService';
import tripPlannerService from '../services/tripPlannerService';
import bookingService from '../services/bookingService';
import reviewsService from '../services/reviewsService';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';

/* ─── Static config ─────────────────────────────────── */
const TYPE_CONFIG = {
    Rental: {
        icon: Car,
        label: 'Vehicle Rental',
        gradient: 'from-blue-500 to-blue-700',
        badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        glow: 'shadow-[0_0_60px_rgba(59,130,246,0.15)]',
    },
    Restaurant: {
        icon: UtensilsCrossed,
        label: 'Restaurant',
        gradient: 'from-orange-500 to-orange-700',
        badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        glow: 'shadow-[0_0_60px_rgba(249,115,22,0.15)]',
    },
    TourPackage: {
        icon: Landmark,
        label: 'Tour Package',
        gradient: 'from-purple-500 to-purple-700',
        badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        glow: 'shadow-[0_0_60px_rgba(168,85,247,0.15)]',
    },
};

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=900';

/* ─── Image Gallery ──────────────────────────────────── */
const Gallery = ({ images }) => {
    const [current, setCurrent] = useState(0);
    const imgs = images?.length ? images : [FALLBACK_IMG];

    const prev = () => setCurrent(i => (i - 1 + imgs.length) % imgs.length);
    const next = () => setCurrent(i => (i + 1) % imgs.length);

    return (
        <div className="relative rounded-2xl overflow-hidden bg-dark-800 aspect-video w-full">
            <img
                key={current}
                src={imgs[current]}
                alt={`Service image ${current + 1}`}
                className="w-full h-full object-cover transition-opacity duration-300"
                onError={e => { e.target.src = FALLBACK_IMG; }}
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 via-transparent to-transparent pointer-events-none" />

            {imgs.length > 1 && (
                <>
                    <button
                        onClick={prev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-dark-900/70 backdrop-blur-sm border border-white/10 rounded-full hover:bg-dark-700/80 transition-all"
                    >
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-dark-900/70 backdrop-blur-sm border border-white/10 rounded-full hover:bg-dark-700/80 transition-all"
                    >
                        <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                    {/* Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {imgs.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white w-5' : 'bg-white/40'}`}
                            />
                        ))}
                    </div>
                    {/* Counter */}
                    <span className="absolute top-4 right-4 px-2.5 py-1 bg-dark-900/70 backdrop-blur-sm border border-white/10 rounded-full text-xs text-white/70">
                        {current + 1} / {imgs.length}
                    </span>
                </>
            )}

            {/* Thumbnails */}
            {imgs.length > 1 && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 hidden md:flex gap-2 mt-3">
                    {imgs.slice(0, 5).map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${i === current ? 'border-white' : 'border-white/20 opacity-60 hover:opacity-90'}`}
                        >
                            <img src={img} alt="" className="w-full h-full object-cover" onError={e => { e.target.src = FALLBACK_IMG; }} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ─── Star Rating Display ───────────────────────────── */
const StarRating = ({ rating, count }) => (
    <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
                <Star
                    key={s}
                    className={`w-4 h-4 ${s <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`}
                />
            ))}
        </div>
        <span className="text-white font-semibold">{rating?.toFixed(1) || '—'}</span>
        {count !== undefined && <span className="text-white/40 text-sm">({count} reviews)</span>}
    </div>
);

/* ─── Type-specific detail blocks ──────────────────── */
const RestaurantDetails = ({ service }) => (
    <>
        {service.cuisineType && (
            <div className="flex items-center gap-3 py-3 border-b border-white/5">
                <Utensils className="w-5 h-5 text-orange-400 shrink-0" />
                <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider">Cuisine</p>
                    <p className="text-white font-medium">{service.cuisineType}</p>
                </div>
            </div>
        )}
        {service.tableCapacity && (
            <div className="flex items-center gap-3 py-3 border-b border-white/5">
                <Users className="w-5 h-5 text-orange-400 shrink-0" />
                <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider">Table Capacity</p>
                    <p className="text-white font-medium">{service.tableCapacity} seats</p>
                </div>
            </div>
        )}
        {service.menu?.length > 0 && (
            <div className="pt-4">
                <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Menu Highlights</h4>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {service.menu.map((item, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg">
                            <div className="flex items-center gap-2">
                                {item.photo && <img src={item.photo} alt={item.itemName} className="w-8 h-8 rounded object-cover" onError={e => { e.target.style.display = 'none'; }} />}
                                <span className="text-white/80 text-sm">{item.itemName}</span>
                            </div>
                            <span className="text-primary-400 font-semibold text-sm">${item.price}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </>
);

const RentalDetails = ({ service }) => (
    <>
        {service.vehicleType && (
            <div className="flex items-center gap-3 py-3 border-b border-white/5">
                <Truck className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider">Vehicle Type</p>
                    <p className="text-white font-medium">{service.vehicleType}</p>
                </div>
            </div>
        )}
        {service.capacity && (
            <div className="flex items-center gap-3 py-3 border-b border-white/5">
                <Users className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider">Capacity</p>
                    <p className="text-white font-medium">{service.capacity} persons</p>
                </div>
            </div>
        )}
        {service.conditions && (
            <div className="py-3">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Rental Conditions</p>
                <p className="text-white/70 text-sm leading-relaxed">{service.conditions}</p>
            </div>
        )}
    </>
);

const TourPackageDetails = ({ service }) => (
    <>
        {service.durationDays && (
            <div className="flex items-center gap-3 py-3 border-b border-white/5">
                <Calendar className="w-5 h-5 text-purple-400 shrink-0" />
                <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider">Duration</p>
                    <p className="text-white font-medium">{service.durationDays} day{service.durationDays > 1 ? 's' : ''}</p>
                </div>
            </div>
        )}
        {service.itinerary && (
            <div className="py-3 border-b border-white/5">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Itinerary</p>
                <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">{service.itinerary}</p>
            </div>
        )}
        {service.includedItems?.length > 0 && (
            <div className="pt-3">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-2">What's Included</p>
                <ul className="space-y-1.5">
                    {service.includedItems.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-white/70">
                            <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        )}
    </>
);

/* ─── Main Page ─────────────────────────────────────── */
const ServiceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [alert, setAlert] = useState(null);
    const [trips, setTrips] = useState([]);
    const [showTripModal, setShowTripModal] = useState(false);
    const [adding, setAdding] = useState(false);

    // Booking form state
    const [bookDate, setBookDate] = useState('');
    const [bookPeople, setBookPeople] = useState(1);
    const [bookNotes, setBookNotes] = useState('');
    const [bookLoading, setBookLoading] = useState(false);
    const [bookingDone, setBookingDone] = useState(null);

    // Review state
    const [reviews, setReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState(null);
    const [myReview, setMyReview] = useState(null);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewHover, setReviewHover] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewsLoading, setReviewsLoading] = useState(true); // holds created booking on success

    const pageRef = useRef(null);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const result = await individualServicesService.getById(id);
            if (result.success) {
                setService(result.service);
            } else {
                setError(result.error || 'Service not found');
            }
            setLoading(false);
        };
        fetch();
    }, [id]);

    // Fetch reviews for this service
    useEffect(() => {
        if (!service) return;
        const fetchReviews = async () => {
            setReviewsLoading(true);
            const result = await reviewsService.getByTarget(service._id, { limit: 50 });
            if (result.success) {
                setReviews(result.reviews || []);
                setReviewStats(result.stats || null);
            }
            // Check if logged-in user has already reviewed
            if (isAuthenticated) {
                const check = await reviewsService.checkUserReview(service._id);
                if (check.hasReviewed && check.review) {
                    setMyReview(check.review);
                    setReviewRating(check.review.rating);
                    setReviewComment(check.review.comment || '');
                }
            }
            setReviewsLoading(false);
        };
        fetchReviews();
    }, [service, isAuthenticated]);

    useEffect(() => {
        if (!loading && service && pageRef.current) {
            gsap.fromTo(pageRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
            );
        }
    }, [loading, service]);

    const handleAddToTrip = async () => {
        if (!isAuthenticated) { navigate('/login'); return; }
        const userTrips = await tripPlannerService.getByUser(user._id);
        setTrips(userTrips);
        setShowTripModal(true);
    };

    const confirmAdd = async (tripId) => {
        setAdding(true);
        const result = await tripPlannerService.addItem(tripId, user._id, {
            id: service._id,
            isAttraction: false
        });
        setAdding(false);
        if (result.success) {
            setAlert({ type: 'success', message: `"${service.name}" added to your trip!` });
        } else {
            setAlert({ type: 'error', message: result.error });
        }
        setShowTripModal(false);
        setTimeout(() => setAlert(null), 4000);
    };

    const createAndAdd = async () => {
        setAdding(true);
        const result = await tripPlannerService.create(user._id, user.firstName || user.companyName || '', { name: 'My Luxor Trip' });
        if (result.success) {
            await confirmAdd(result.trip.id);
        } else {
            setAdding(false);
            setAlert({ type: 'error', message: result.error });
        }
    };

    // Booking submission
    const handleBook = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) { navigate('/login'); return; }
        if (!bookDate) { setAlert({ type: 'error', message: 'Please select a service date.' }); return; }
        setBookLoading(true);
        const result = await bookingService.create({
            serviceId: service._id,
            serviceDate: bookDate,
            numberOfPeople: bookPeople,
            specialRequests: bookNotes || undefined,
        });
        setBookLoading(false);
        if (result.success) {
            setBookingDone(result.booking);
            setAlert({ type: 'success', message: 'Booking confirmed! Check your bookings for details.' });
        } else {
            setAlert({ type: 'error', message: result.error });
        }
        setTimeout(() => setAlert(null), 5000);
    };

    // Tomorrow as minimum date
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 1);
    const minDateStr = minDate.toISOString().split('T')[0];
    const totalPrice = service ? (service.price * bookPeople).toFixed(2) : '—';

    // Review submit / update
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) { navigate('/login'); return; }
        if (!reviewRating) { setAlert({ type: 'error', message: 'Please select a star rating.' }); setTimeout(() => setAlert(null), 3000); return; }
        setReviewLoading(true);
        let result;
        if (myReview) {
            result = await reviewsService.update(myReview._id, { rating: reviewRating, comment: reviewComment });
        } else {
            result = await reviewsService.create({ targetId: service._id, targetModel: 'Service', rating: reviewRating, comment: reviewComment });
        }
        setReviewLoading(false);
        if (result.success) {
            setAlert({ type: 'success', message: myReview ? 'Review updated!' : 'Review submitted!' });
            setMyReview(result.review);
            // Refresh reviews list
            const fresh = await reviewsService.getByTarget(service._id, { limit: 50 });
            if (fresh.success) { setReviews(fresh.reviews || []); setReviewStats(fresh.stats || null); }
        } else {
            setAlert({ type: 'error', message: result.error });
        }
        setTimeout(() => setAlert(null), 4000);
    };

    /* ── Derived config ── */
    const typeKey = service?.serviceType;
    const cfg = TYPE_CONFIG[typeKey] || TYPE_CONFIG.TourPackage;
    const TypeIcon = cfg.icon;
    const vendor = service?.ownerId;

    /* ── Loading ── */
    if (loading) return (
        <div className="min-h-screen bg-dark-900 pt-24 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary-400 animate-spin" />
        </div>
    );

    /* ── Error ── */
    if (error) return (
        <div className="min-h-screen bg-dark-900 pt-24 flex flex-col items-center justify-center gap-6 text-center px-4">
            <AlertCircle className="w-16 h-16 text-red-400" />
            <h2 className="text-2xl font-bold text-white">Service Not Found</h2>
            <p className="text-white/50 max-w-md">{error}</p>
            <Button variant="primary" onClick={() => navigate('/services')}>Back to Services</Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-dark-900 pt-20 pb-16">
            {/* ── Ambient hero gradient ── */}
            <div className={`fixed inset-0 pointer-events-none opacity-30 bg-gradient-to-br ${cfg.gradient} blur-[200px]`} style={{ zIndex: 0 }} />

            <div ref={pageRef} className="container-custom relative z-10">
                {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} className="mb-6" />}

                {/* ── Back button ── */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Services
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ═══════════ LEFT COL ═══════════ */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Type badge + title */}
                        <div>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.badge} mb-3`}>
                                <TypeIcon className="w-3.5 h-3.5" />
                                {cfg.label}
                            </span>
                            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2 leading-tight">
                                {service.name}
                            </h1>
                            <StarRating rating={service.averageRating} count={service.totalReviews} />
                        </div>

                        {/* Gallery */}
                        <Gallery images={service.images} />

                        {/* Description */}
                        {service.description && (
                            <Card className="space-y-2">
                                <h2 className="text-lg font-bold text-white">About this Service</h2>
                                <p className="text-white/60 leading-relaxed">{service.description}</p>
                            </Card>
                        )}

                        {/* Type-specific details */}
                        <Card>
                            <h2 className="text-lg font-bold text-white mb-4">Details</h2>
                            {typeKey === 'Restaurant' && <RestaurantDetails service={service} />}
                            {typeKey === 'Rental' && <RentalDetails service={service} />}
                            {typeKey === 'TourPackage' && <TourPackageDetails service={service} />}
                        </Card>

                        {/* ═══════════ REVIEWS SECTION ═══════════ */}
                        <Card>
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                Reviews {reviewStats ? `(${reviewStats.totalReviews})` : ''}
                            </h2>

                            {/* Write / Edit review form */}
                            {isAuthenticated && user?.role === 'Tourist' && (
                                <form onSubmit={handleReviewSubmit} className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                                    <p className="text-sm font-medium text-white/70 mb-2">
                                        {myReview ? 'Update your review' : 'Write a review'}
                                    </p>
                                    {/* Star picker */}
                                    <div className="flex items-center gap-1 mb-3">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setReviewRating(s)}
                                                onMouseEnter={() => setReviewHover(s)}
                                                onMouseLeave={() => setReviewHover(0)}
                                                className="p-0.5 transition-transform hover:scale-125"
                                            >
                                                <Star
                                                    className={`w-7 h-7 transition-colors ${s <= (reviewHover || reviewRating)
                                                            ? 'text-yellow-400 fill-yellow-400'
                                                            : 'text-white/20'
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                        {reviewRating > 0 && (
                                            <span className="ml-2 text-sm text-white/50">
                                                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewRating]}
                                            </span>
                                        )}
                                    </div>
                                    <textarea
                                        value={reviewComment}
                                        onChange={e => setReviewComment(e.target.value)}
                                        rows={3}
                                        placeholder="Share your experience…"
                                        className="w-full px-3 py-2.5 bg-dark-700/60 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-500/40 resize-none mb-3"
                                    />
                                    <button
                                        type="submit"
                                        disabled={reviewLoading || !reviewRating}
                                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-semibold hover:from-yellow-400 hover:to-orange-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {reviewLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                        {myReview ? 'Update Review' : 'Submit Review'}
                                    </button>
                                </form>
                            )}

                            {!isAuthenticated && (
                                <p className="text-sm text-white/40 mb-6">
                                    <button onClick={() => navigate('/login')} className="text-primary-400 hover:underline">Log in</button> to leave a review.
                                </p>
                            )}

                            {/* Reviews list */}
                            {reviewsLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
                                </div>
                            ) : reviews.length === 0 ? (
                                <p className="text-white/40 text-sm py-4">No reviews yet. Be the first to share your experience!</p>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map(r => (
                                        <div key={r._id} className="flex gap-4 py-4 border-b border-white/5 last:border-0">
                                            <div className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-base">
                                                {(r.touristId?.firstName || '?')[0].toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-white font-semibold text-base truncate">{r.touristId ? `${r.touristId.firstName} ${r.touristId.lastName}` : 'Tourist'}</p>
                                                    <span className="text-sm text-white/30 shrink-0">{new Date(r.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-0.5 my-1.5">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <Star key={s} className={`w-4.5 h-4.5 ${s <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/15'}`} />
                                                    ))}
                                                </div>
                                                {r.comment && <p className="text-white/60 text-base leading-relaxed">{r.comment}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* ═══════════ RIGHT SIDEBAR ═══════════ */}
                    <div className="space-y-5">

                        {/* Price + CTA card */}
                        <Card className={`${cfg.glow}`}>
                            <div className="flex items-end justify-between mb-5">
                                <div>
                                    <p className="text-white/40 text-sm">Price</p>
                                    <p className="text-4xl font-bold text-white">${service.price}</p>
                                    {typeKey === 'Rental' && <p className="text-white/40 text-xs mt-1">per day</p>}
                                    {typeKey === 'Restaurant' && <p className="text-white/40 text-xs mt-1">per person (avg.)</p>}
                                    {typeKey === 'TourPackage' && service.durationDays && (
                                        <p className="text-white/40 text-xs mt-1">for {service.durationDays} day{service.durationDays > 1 ? 's' : ''}</p>
                                    )}
                                </div>
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shadow-lg`}>
                                    <TypeIcon className="w-7 h-7 text-white" />
                                </div>
                            </div>

                            <Button
                                variant="primary"
                                fullWidth
                                onClick={handleAddToTrip}
                                className="flex items-center justify-center gap-2 mb-3"
                            >
                                <Plus className="w-4 h-4" />
                                Add to Trip
                            </Button>

                            {!isAuthenticated && (
                                <p className="text-center text-xs text-white/40">
                                    <button onClick={() => navigate('/login')} className="text-primary-400 hover:underline">Log in</button> to save this to your trip
                                </p>
                            )}
                        </Card>

                        {/* ── Book Now card ── */}
                        <Card className="border border-green-500/20 bg-green-500/5">
                            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-green-400" />
                                Book This Service
                            </h3>
                            <p className="text-xs text-white/40 mb-4">Instant booking — no credit card required upfront</p>

                            {bookingDone ? (
                                <div className="text-center py-4">
                                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                                    <p className="text-white font-semibold mb-1">Booking Submitted!</p>
                                    <p className="text-white/50 text-sm mb-4">Status: <span className="text-yellow-400 font-medium">Pending</span></p>
                                    <button
                                        onClick={() => navigate('/my-bookings')}
                                        className="text-sm text-primary-400 hover:underline"
                                    >
                                        View My Bookings →
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleBook} className="space-y-4">
                                    {/* Date */}
                                    <div>
                                        <label className="block text-xs text-white/50 mb-1">Service Date <span className="text-red-400">*</span></label>
                                        <input
                                            type="date"
                                            min={minDateStr}
                                            value={bookDate}
                                            onChange={e => setBookDate(e.target.value)}
                                            required
                                            className="w-full px-3 py-2.5 bg-dark-700/60 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/40 [color-scheme:dark]"
                                        />
                                    </div>

                                    {/* Number of people */}
                                    <div>
                                        <label className="block text-xs text-white/50 mb-1">Number of People</label>
                                        <div className="flex items-center gap-3">
                                            <button type="button" onClick={() => setBookPeople(p => Math.max(1, p - 1))}
                                                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-colors flex items-center justify-center text-lg">
                                                −
                                            </button>
                                            <span className="flex-1 text-center text-white font-semibold text-lg">{bookPeople}</span>
                                            <button type="button" onClick={() => setBookPeople(p => p + 1)}
                                                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-colors flex items-center justify-center text-lg">
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    {/* Special requests */}
                                    <div>
                                        <label className="block text-xs text-white/50 mb-1">Special Requests</label>
                                        <textarea
                                            value={bookNotes}
                                            onChange={e => setBookNotes(e.target.value)}
                                            rows={3}
                                            placeholder="Any dietary needs, accessibility requirements…"
                                            className="w-full px-3 py-2.5 bg-dark-700/60 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/40 resize-none"
                                        />
                                    </div>

                                    {/* Live price preview */}
                                    <div className="flex items-center justify-between px-3 py-2.5 bg-white/5 rounded-xl border border-white/5">
                                        <span className="text-white/60 text-sm">${service.price} × {bookPeople} person{bookPeople > 1 ? 's' : ''}</span>
                                        <span className="text-white font-bold text-lg">${totalPrice}</span>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={bookLoading || !isAuthenticated}
                                        className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-400 hover:to-emerald-500 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(34,197,94,0.3)]"
                                    >
                                        {bookLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                                        {bookLoading ? 'Booking…' : 'Confirm Booking'}
                                    </button>

                                    {!isAuthenticated && (
                                        <p className="text-center text-xs text-white/40">
                                            <button type="button" onClick={() => navigate('/login')} className="text-primary-400 hover:underline">Log in</button> to book
                                        </p>
                                    )}
                                </form>
                            )}
                        </Card>

                        {/* Vendor card */}
                        {vendor && (
                            <Card>
                                <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Provided by</h3>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow">
                                        {(vendor.companyName || vendor.name || '?')[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">{vendor.companyName || vendor.name}</p>
                                        <p className="text-xs text-white/40">Verified Business</p>
                                    </div>
                                </div>
                                {vendor.email && (
                                    <a href={`mailto:${vendor.email}`} className="flex items-center gap-2 text-sm text-white/60 hover:text-primary-400 transition-colors py-2 border-b border-white/5">
                                        <Mail className="w-4 h-4 text-primary-400" />
                                        {vendor.email}
                                    </a>
                                )}
                                {vendor.phone && (
                                    <a href={`tel:${vendor.phone}`} className="flex items-center gap-2 text-sm text-white/60 hover:text-primary-400 transition-colors py-2">
                                        <Phone className="w-4 h-4 text-primary-400" />
                                        {vendor.phone}
                                    </a>
                                )}
                            </Card>
                        )}

                        {/* Quick facts */}
                        <Card>
                            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Quick Facts</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                                    <span className="text-white/50">Type</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.badge}`}>{cfg.label}</span>
                                </div>
                                <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                                    <span className="text-white/50">Rating</span>
                                    <span className="text-white font-medium">{service.averageRating?.toFixed(1) || 'No rating yet'}</span>
                                </div>
                                {service.totalReviews !== undefined && (
                                    <div className="flex items-center justify-between py-1.5">
                                        <span className="text-white/50">Reviews</span>
                                        <span className="text-white font-medium">{service.totalReviews}</span>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* ── Add to Trip Modal ── */}
            {showTripModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={() => setShowTripModal(false)} />
                    <Card className="relative z-10 w-full max-w-md">
                        <h3 className="text-xl font-bold text-white mb-2">Add to Trip</h3>
                        <p className="text-white/50 mb-5">
                            Add <span className="text-primary-400 font-medium">"{service.name}"</span> to one of your trips:
                        </p>

                        {trips.filter(t => t.status === 'Draft' || t.status === 'planning').length > 0 ? (
                            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
                                {trips.filter(t => t.status === 'Draft' || t.status === 'planning').map(trip => (
                                    <button
                                        key={trip.id}
                                        onClick={() => confirmAdd(trip.id)}
                                        disabled={adding}
                                        className="w-full flex items-center justify-between p-3 bg-dark-700/50 border border-white/5 rounded-xl hover:bg-white/5 transition-colors text-left"
                                    >
                                        <div>
                                            <p className="text-white font-medium">{trip.name}</p>
                                            <p className="text-xs text-white/40">{trip.items?.length || 0} items</p>
                                        </div>
                                        <Plus className="w-5 h-5 text-primary-400 shrink-0" />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-white/40 mb-4">You have no active trip plans yet.</p>
                        )}

                        <button
                            onClick={createAndAdd}
                            disabled={adding}
                            className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-white/20 rounded-xl text-white/60 hover:border-primary-400 hover:text-primary-400 transition-colors mb-3"
                        >
                            <Plus className="w-4 h-4" />Create New Trip & Add
                        </button>
                        <button onClick={() => setShowTripModal(false)} className="w-full text-center text-sm text-white/40 hover:text-white transition-colors">
                            Cancel
                        </button>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ServiceDetail;
