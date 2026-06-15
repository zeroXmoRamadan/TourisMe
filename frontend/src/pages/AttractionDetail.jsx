import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, Clock, Ticket, ArrowLeft, Landmark, Plus, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import attractionsService from '../services/attractionsService';
import reviewsService from '../services/reviewsService';
import tripPlannerService from '../services/tripPlannerService';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Alert from '../components/common/Alert';
import ReviewSection from '../components/common/ReviewSection';

gsap.registerPlugin(ScrollTrigger);

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
                alt={`Attraction image ${current + 1}`}
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

const AttractionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [attraction, setAttraction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviewStats, setReviewStats] = useState(null);
    const [alert, setAlert] = useState(null);
    const [addingToTrip, setAddingToTrip] = useState(false);
    const [showTripModal, setShowTripModal] = useState(false);
    const [trips, setTrips] = useState([]);

    const heroRef = useRef(null);
    const contentRef = useRef(null);
    const sidebarRef = useRef(null);
    const pageRef = useRef(null);

    useEffect(() => {
        const fetchAttraction = async () => {
            setLoading(true);
            const result = await attractionsService.getById(id);
            if (result.success) {
                setAttraction(result.attraction);
            }
            setLoading(false);
        };
        fetchAttraction();
    }, [id]);

    useEffect(() => {
        const fetchReviewStats = async () => {
            const result = await reviewsService.getByTarget(id);
            if (result.success) {
                setReviewStats(result.stats);
            }
        };
        fetchReviewStats();
    }, [id]);

    const handleAddToTrip = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setAddingToTrip(true);
        const userTrips = await tripPlannerService.getByUser();
        setTrips(userTrips);
        setShowTripModal(true);
        setAddingToTrip(false);
    };

    const confirmAddToTrip = async (tripId) => {
        setAddingToTrip(true);
        const result = await tripPlannerService.addItem(tripId, user._id, {
            id: attraction._id,
            isAttraction: true
        });
        if (result.success) {
            setAlert({ type: 'success', message: `"${attraction.name}" added to your trip!` });
        } else {
            setAlert({ type: 'error', message: result.error });
        }
        setShowTripModal(false);
        setAddingToTrip(false);
        setTimeout(() => setAlert(null), 4000);
    };

    const createAndAdd = async () => {
        setAddingToTrip(true);
        const result = await tripPlannerService.create(user._id, user.firstName || user.companyName || '', { name: 'My Luxor Trip' });
        if (result.success) {
            await confirmAddToTrip(result.trip.id);
        } else {
            setAddingToTrip(false);
            setAlert({ type: 'error', message: result.error });
        }
    };

    useEffect(() => {
        if (!attraction) return;

        gsap.fromTo(pageRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.8, ease: 'power2.out' }
        );

        gsap.fromTo(heroRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' }
        );

        const contentCards = contentRef.current?.querySelectorAll('.detail-card');
        if (contentCards && contentCards.length > 0) {
            gsap.fromTo(contentCards,
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0,
                    duration: 0.8, stagger: 0.15, delay: 0.4, ease: 'power3.out'
                }
            );
        }

        if (sidebarRef.current) {
            gsap.fromTo(sidebarRef.current,
                { opacity: 0, x: 30 },
                { opacity: 1, x: 0, duration: 0.8, delay: 0.6, ease: 'power3.out' }
            );
        }
    }, [attraction]);

    if (loading) return null;

    if (!attraction) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-900 pt-20">
                <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-dark-700/50 flex items-center justify-center">
                        <Landmark className="w-10 h-10 text-white/30" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4 text-white">Attraction not found</h2>
                    <Button onClick={() => navigate('/attractions')}>Back to Attractions</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-900 pt-20 pb-16">
            {alert && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
                    <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
                </div>
            )}

            {/* Trip Selection Modal */}
            {showTripModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={() => setShowTripModal(false)} />
                    <Card className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-300">
                        <h3 className="text-xl font-bold text-white mb-4">Add to Trip Plan</h3>
                        <p className="text-white/50 text-sm mb-6">Select one of your existing trip plans or create a new one.</p>
                        
                        <div className="space-y-3 max-h-60 overflow-y-auto mb-6 pr-2">
                            {trips.length > 0 ? trips.map(trip => (
                                <button
                                    key={trip.id}
                                    onClick={() => confirmAddToTrip(trip.id)}
                                    disabled={addingToTrip}
                                    className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary-500/50 hover:bg-primary-500/5 transition-all group"
                                >
                                    <p className="text-white font-medium group-hover:text-primary-400 transition-colors">{trip.name}</p>
                                    <p className="text-white/40 text-xs">{trip.items?.length || 0} items • {trip.date || 'No date set'}</p>
                                </button>
                            )) : (
                                <p className="text-center py-4 text-white/30 italic">No trip plans found</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button variant="primary" onClick={createAndAdd} loading={addingToTrip} fullWidth>
                                <Plus className="w-4 h-4 mr-2" />
                                Create New Trip & Add
                            </Button>
                            <Button variant="ghost" onClick={() => setShowTripModal(false)} fullWidth>
                                Cancel
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            <div ref={pageRef} className="container-custom relative z-10">
                {/* ── Back button ── */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Attractions
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ═══════════ LEFT COL ═══════════ */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Category badge + title */}
                        <div ref={heroRef}>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-500/20 text-primary-400 border border-primary-500/30 mb-3">
                                <Landmark className="w-3.5 h-3.5" />
                                {attraction.category}
                            </span>
                            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2 leading-tight">
                                {attraction.name}
                            </h1>
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star
                                                key={s}
                                                className={`w-4 h-4 ${s <= Math.round(reviewStats?.averageRating || attraction.averageRating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-white font-semibold">{ (reviewStats?.averageRating || attraction.averageRating || 0).toFixed(1) }</span>
                                    { (reviewStats?.totalReviews || attraction.totalReviews || 0) > 0 && (
                                        <span className="text-white/40 text-sm">({reviewStats?.totalReviews || attraction.totalReviews} reviews)</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Gallery */}
                        <Gallery images={attraction.images} />

                        {/* Description */}
                        <div ref={contentRef} className="space-y-6">
                            <Card className="detail-card">
                                <h2 className="text-xl font-bold mb-4 text-white">About This Place</h2>
                                <p className="text-white/60 text-lg leading-relaxed">{attraction.description}</p>
                            </Card>

                            {attraction.highlights?.length > 0 && (
                                <Card className="detail-card">
                                    <h2 className="text-xl font-bold mb-6 text-white">Highlights</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {attraction.highlights.map((h, i) => (
                                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                                <Star className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                                                <span className="text-white/80">{h}</span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}

                            {/* Reviews */}
                            <ReviewSection targetType="Attraction" targetId={id} />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div ref={sidebarRef} className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <Card className="relative overflow-visible">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-3xl blur-xl opacity-50" />

                                <div className="relative">
                                    <h3 className="text-xl font-bold mb-6 text-white">Visit Information</h3>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between py-3 border-b border-white/10">
                                            <span className="flex items-center gap-2 text-white/60">
                                                <Clock className="w-5 h-5 text-primary-400" />
                                                Opening Hours
                                            </span>
                                        </div>
                                        <p className="text-white/80 text-sm -mt-2 mb-2">{attraction.openingHours}</p>

                                        <div className="flex justify-between py-3 border-b border-white/10">
                                            <span className="flex items-center gap-2 text-white/60">
                                                <Ticket className="w-5 h-5 text-primary-400" />
                                                Entry Fee
                                            </span>
                                            <span className="font-medium text-white">{attraction.ticketPrice ? `$${attraction.ticketPrice}` : attraction.entryFee}</span>
                                        </div>



                                        <div className="flex justify-between py-3">
                                            <span className="text-white/60">Rating</span>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-5 h-5 fill-primary-400 text-primary-400" />
                                                <span className="font-medium text-white">{ (reviewStats?.averageRating || attraction.averageRating || 0).toFixed(1) }</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Trip Plan CTA */}
                                    <Button
                                        variant="primary"
                                        fullWidth
                                        size="lg"
                                        onClick={handleAddToTrip}
                                        loading={addingToTrip}
                                        className="mb-3"
                                    >
                                        <Plus className="w-5 h-5 mr-2" />
                                        Add to Trip Plan
                                    </Button>
                                    <p className="text-xs text-center text-white/40">
                                        Save this place to your itinerary
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttractionDetail;
