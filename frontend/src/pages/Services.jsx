import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { Car, UtensilsCrossed, Landmark, Search, Star, Plus, ChevronRight, Loader2, Filter, X, SlidersHorizontal } from 'lucide-react';
import individualServicesService from '../services/individualServicesService';
import tripPlannerService from '../services/tripPlannerService';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';

// Aligned with API serviceType discriminator values (PascalCase)
const TYPE_ICONS    = { Rental: Car, Restaurant: UtensilsCrossed, TourPackage: Landmark };
const TYPE_GRADIENT = { Rental: 'from-blue-500 to-blue-600', Restaurant: 'from-orange-500 to-orange-600', TourPackage: 'from-purple-500 to-purple-600' };

const SERVICE_TYPES = [
    { id: 'Rental',      label: 'Rentals' },
    { id: 'Restaurant',  label: 'Restaurants' },
    { id: 'TourPackage', label: 'Tour Packages' },
];

const SORT_OPTIONS = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'price',      label: 'Price: Low → High' },
    { value: '-price',     label: 'Price: High → Low' },
    { value: '-averageRating', label: 'Top Rated' },
];

const Services = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [services, setServices]       = useState([]);
    const [loading, setLoading]         = useState(true);
    const [activeType, setActiveType]   = useState('all');
    const [search, setSearch]           = useState(searchParams.get('search') || '');
    const [minPrice, setMinPrice]       = useState('');
    const [maxPrice, setMaxPrice]       = useState('');
    const [sortBy, setSortBy]           = useState('-createdAt');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [alert, setAlert]             = useState(null);
    const [trips, setTrips]             = useState([]);
    const [addToTripModal, setAddToTripModal] = useState(null);

    const headerRef  = useRef(null);
    const contentRef = useRef(null);
    const hasAnimated = useRef(false);

    // Fetch services from API
    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            const data = await individualServicesService.getApproved();
            setServices(data);
            setLoading(false);
        };
        fetchServices();
        if (isAuthenticated && user?._id) setTrips(tripPlannerService.getByUser(user._id));
    }, [isAuthenticated, user]);

    useEffect(() => {
        if (headerRef.current)  gsap.fromTo(headerRef.current,  { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
        if (contentRef.current) gsap.fromTo(contentRef.current, { opacity: 0, y: 30  }, { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'power3.out' });
    }, []);

    // Re-animate cards when filter changes
    useEffect(() => {
        if (!hasAnimated.current || loading) return;
        const cards = contentRef.current?.querySelectorAll('.service-card');
        if (cards?.length) {
            gsap.fromTo(cards,
                { opacity: 0, y: 20, scale: 0.97 },
                { opacity: 1, y: 0, scale: 1, duration: 0.35, stagger: 0.05, ease: 'power2.out' }
            );
        }
    }, [activeType, search, minPrice, maxPrice, sortBy]);

    useEffect(() => {
        if (!loading) hasAnimated.current = true;
    }, [loading]);

    // Client-side filtering + sorting
    const filtered = services
        .filter(s => {
            const matchType   = activeType === 'all' || s.serviceType === activeType;
            const matchSearch = !search ||
                s.name?.toLowerCase().includes(search.toLowerCase()) ||
                s.description?.toLowerCase().includes(search.toLowerCase());
            const matchMin = !minPrice || s.price >= Number(minPrice);
            const matchMax = !maxPrice || s.price <= Number(maxPrice);
            return matchType && matchSearch && matchMin && matchMax;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'price':          return a.price - b.price;
                case '-price':         return b.price - a.price;
                case '-averageRating': return (b.averageRating || 0) - (a.averageRating || 0);
                default:               return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

    const hasActiveFilters = activeType !== 'all' || search || minPrice || maxPrice || sortBy !== '-createdAt';

    const clearFilters = () => {
        setActiveType('all');
        setSearch('');
        setMinPrice('');
        setMaxPrice('');
        setSortBy('-createdAt');
    };

    const getImage    = (s) => s.images?.[0] || s.image || 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=600';
    const getVendor   = (s) => s.ownerId?.companyName || s.ownerId?.name || '';

    // --- Trip helpers ---
    const handleAddToTrip = (service) => {
        if (!isAuthenticated) { navigate('/login'); return; }
        setTrips(tripPlannerService.getByUser(user._id));
        setAddToTripModal(service);
    };

    const confirmAddToTrip = (tripId, service) => {
        const result = tripPlannerService.addItem(tripId, user._id, {
            id: service._id || service.id, name: service.name,
            category: service.serviceType, price: service.price,
            vendorName: getVendor(service), image: getImage(service),
        });
        if (result.success) {
            setAlert({ type: 'success', message: `"${service.name}" added to your trip!` });
            setTrips(tripPlannerService.getByUser(user._id));
        } else {
            setAlert({ type: 'error', message: result.error });
        }
        setAddToTripModal(null);
        setTimeout(() => setAlert(null), 3000);
    };

    const createTripAndAdd = (service) => {
        const result = tripPlannerService.create(user._id, user.firstName || user.companyName || '', { name: 'My Luxor Trip' });
        if (result.success) confirmAddToTrip(result.trip.id, service);
    };

    // ---- Filter sidebar (shared between desktop + mobile drawer) ----
    const FilterPanel = () => (
        <Card className="sticky top-24 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-primary-400" /> Filters
            </h3>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search services..."
                    className="w-full pl-9 pr-4 py-2.5 bg-dark-700/50 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
            </div>

            {/* Service Type */}
            <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Service Type</label>
                <div className="space-y-1.5">
                    <button
                        onClick={() => setActiveType('all')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${activeType === 'all' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                    >
                        All Types ({services.length})
                    </button>
                    {SERVICE_TYPES.map(t => {
                        const Icon = TYPE_ICONS[t.id] || Landmark;
                        const count = services.filter(s => s.serviceType === t.id).length;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setActiveType(t.id)}
                                className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${activeType === t.id ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                            >
                                <Icon className="w-4 h-4 shrink-0" />{t.label} ({count})
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Price Range ($)</label>
                <div className="grid grid-cols-2 gap-2">
                    <input
                        type="number"
                        value={minPrice}
                        onChange={e => setMinPrice(e.target.value)}
                        placeholder="Min"
                        className="w-full px-3 py-2 bg-dark-700/50 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    />
                    <input
                        type="number"
                        value={maxPrice}
                        onChange={e => setMaxPrice(e.target.value)}
                        placeholder="Max"
                        className="w-full px-3 py-2 bg-dark-700/50 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    />
                </div>
            </div>

            {/* Sort */}
            <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Sort By</label>
                <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="w-full px-3 py-2.5 bg-dark-700/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                >
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </div>

            {/* Clear */}
            {hasActiveFilters && (
                <Button variant="outline" fullWidth onClick={clearFilters} className="text-sm">
                    Clear Filters
                </Button>
            )}
        </Card>
    );

    return (
        <div className="min-h-screen bg-dark-900 pt-20 pb-12">
            {/* Hero */}
            <div ref={headerRef} className="relative py-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-dark-900 to-purple-900/30" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
                <div className="container-custom relative z-10">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-4">
                        <Car className="w-4 h-4" /> Build Your Own Trip
                    </span>
                    <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-4">
                        Luxor <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Services</span>
                    </h1>
                    <p className="text-xl text-white/50 max-w-2xl">
                        Browse rentals, restaurants, and tour packages — filter, compare, and add to your custom trip plan
                    </p>
                </div>
            </div>

            <div ref={contentRef} className="container-custom">
                {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} className="mb-6" />}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Mobile filter toggle */}
                    <div className="lg:hidden">
                        <Button
                            variant="glass"
                            fullWidth
                            onClick={() => setIsMobileFilterOpen(true)}
                            className="flex items-center justify-center gap-2"
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            {hasActiveFilters && <span className="w-2 h-2 bg-primary-500 rounded-full" />}
                        </Button>
                    </div>

                    {/* Desktop sidebar */}
                    <div className="hidden lg:block lg:col-span-1">
                        <FilterPanel />
                    </div>

                    {/* Mobile filter drawer */}
                    {isMobileFilterOpen && (
                        <div className="fixed inset-0 z-50 lg:hidden">
                            <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />
                            <div className="fixed right-0 top-0 h-full w-80 bg-dark-800 border-l border-white/10 overflow-y-auto p-6 z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-white">Filters</h3>
                                    <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">
                                        <X className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                                <FilterPanel />
                                <Button variant="primary" fullWidth onClick={() => setIsMobileFilterOpen(false)} className="mt-4">
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Main content */}
                    <div className="lg:col-span-3">
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-white/50">
                                <span className="font-semibold text-primary-400">{filtered.length}</span> service{filtered.length !== 1 ? 's' : ''} found
                            </p>
                            {/* Mobile sort */}
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className="lg:hidden px-3 py-2 bg-dark-700/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none"
                            >
                                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-24">
                                <Loader2 className="w-10 h-10 text-primary-400 animate-spin" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-dark-700/50 flex items-center justify-center">
                                    <Search className="w-10 h-10 text-white/20" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">No services found</h3>
                                <p className="text-white/40 mb-6">Try adjusting your filters or search query</p>
                                {hasActiveFilters && <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>}
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {filtered.map(service => {
                                        const Icon     = TYPE_ICONS[service.serviceType] || Landmark;
                                        const gradient = TYPE_GRADIENT[service.serviceType] || 'from-purple-500 to-purple-600';
                                        const typeLabel = SERVICE_TYPES.find(t => t.id === service.serviceType)?.label || service.serviceType;
                                        const vendor   = getVendor(service);
                                        return (
                                            <div
                                                key={service._id || service.id}
                                                className="service-card group bg-dark-800/60 border border-white/5 rounded-2xl overflow-hidden hover:border-white/15 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-500 hover:-translate-y-1 cursor-pointer"
                                                onClick={() => navigate(`/services/${service._id || service.id}`)}
                                            >
                                                <div className="relative h-48 overflow-hidden">
                                                    <img
                                                        src={getImage(service)}
                                                        alt={service.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=600'; }}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />
                                                    <span className={`absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${gradient} text-white shadow`}>
                                                        <Icon className="w-3 h-3" />{typeLabel}
                                                    </span>
                                                    <div className="absolute bottom-3 left-3">
                                                        <p className="text-2xl font-bold text-white">${service.price}</p>
                                                    </div>
                                                </div>
                                                <div className="p-4 space-y-3">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors line-clamp-1">{service.name}</h3>
                                                        {vendor && <p className="text-xs text-white/40 mt-0.5">{vendor}</p>}
                                                    </div>
                                                    <p className="text-sm text-white/50 line-clamp-2">{service.description}</p>
                                                    <div className="flex items-center gap-1 pt-1">
                                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                        <span className="text-sm font-semibold text-white">{service.averageRating?.toFixed(1) || '—'}</span>
                                                        <span className="text-xs text-white/40">
                                                            ({service.totalReviews ?? '—'} reviews)
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={e => { e.stopPropagation(); handleAddToTrip(service); }}
                                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold hover:from-primary-400 hover:to-primary-500 transition-all duration-300 hover:-translate-y-0.5 shadow-[0_4px_15px_rgba(242,133,109,0.3)]"
                                                    >
                                                        <Plus className="w-4 h-4" />Add to Trip
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* My Trips CTA */}
                                {isAuthenticated && (
                                    <div className="mt-12 p-6 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-500/20 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
                                        <div>
                                            <h3 className="text-xl font-bold text-white">Ready to plan your trip?</h3>
                                            <p className="text-white/50">View your trip plans, add more services, and finalize your itinerary.</p>
                                        </div>
                                        <Button variant="primary" onClick={() => navigate('/trip-planner')} className="flex items-center gap-2 shrink-0">
                                            My Trip Plans <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Add to Trip Modal */}
            {addToTripModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={() => setAddToTripModal(null)} />
                    <Card className="relative z-10 w-full max-w-md">
                        <h3 className="text-xl font-bold text-white mb-2">Add to Trip</h3>
                        <p className="text-white/50 mb-4">
                            Add <span className="text-primary-400 font-medium">"{addToTripModal.name}"</span> to a trip:
                        </p>
                        {trips.filter(t => t.status === 'planning').length > 0 ? (
                            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                                {trips.filter(t => t.status === 'planning').map(trip => (
                                    <button
                                        key={trip.id}
                                        onClick={() => confirmAddToTrip(trip.id, addToTripModal)}
                                        className="w-full flex items-center justify-between p-3 bg-dark-700/50 border border-white/5 rounded-xl hover:bg-white/5 transition-colors text-left"
                                    >
                                        <div>
                                            <p className="text-white font-medium">{trip.name}</p>
                                            <p className="text-xs text-white/40">{trip.items.length} items · ${trip.totalBudget}</p>
                                        </div>
                                        <Plus className="w-5 h-5 text-primary-400 shrink-0" />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-white/40 mb-4">You have no active trip plans yet.</p>
                        )}
                        <button
                            onClick={() => createTripAndAdd(addToTripModal)}
                            className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-white/20 rounded-xl text-white/60 hover:border-primary-400 hover:text-primary-400 transition-colors"
                        >
                            <Plus className="w-4 h-4" />Create New Trip & Add
                        </button>
                        <button onClick={() => setAddToTripModal(null)} className="w-full mt-3 text-center text-sm text-white/40 hover:text-white transition-colors">
                            Cancel
                        </button>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Services;
