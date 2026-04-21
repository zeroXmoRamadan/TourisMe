import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Car, Bike, UtensilsCrossed, Landmark, Search, Star, MapPin, Clock, Plus, ChevronRight } from 'lucide-react';
import individualServicesService from '../services/individualServicesService';
import tripPlannerService from '../services/tripPlannerService';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';

const categoryIcons = { car_rental: Car, bicycle_rental: Bike, restaurant: UtensilsCrossed, temple_visit: Landmark };
const categoryColors = { car_rental: 'blue', bicycle_rental: 'green', restaurant: 'orange', temple_visit: 'purple' };

const Services = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [search, setSearch] = useState('');
    const [alert, setAlert] = useState(null);
    const [trips, setTrips] = useState([]);
    const [addToTripModal, setAddToTripModal] = useState(null);
    const headerRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        setServices(individualServicesService.getApproved());
        if (isAuthenticated) setTrips(tripPlannerService.getByUser(user.id));
    }, []);

    useEffect(() => {
        gsap.fromTo(headerRef.current, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
        gsap.fromTo(contentRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'power3.out' });
    }, []);

    const categories = individualServicesService.getCategories();

    const filtered = services.filter(s => {
        const matchCat = activeCategory === 'all' || s.category === activeCategory;
        const matchSearch = search === '' || s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    const handleAddToTrip = (service) => {
        if (!isAuthenticated) { navigate('/login'); return; }
        const userTrips = tripPlannerService.getByUser(user.id);
        setTrips(userTrips);
        setAddToTripModal(service);
    };

    const confirmAddToTrip = (tripId, service) => {
        const result = tripPlannerService.addItem(tripId, user.id, service);
        if (result.success) {
            setAlert({ type: 'success', message: `"${service.name}" added to your trip!` });
            setTrips(tripPlannerService.getByUser(user.id));
        } else {
            setAlert({ type: 'error', message: result.error });
        }
        setAddToTripModal(null);
        setTimeout(() => setAlert(null), 3000);
    };

    const createTripAndAdd = (service) => {
        const result = tripPlannerService.create(user.id, `${user.firstName} ${user.lastName}`, { name: 'My Luxor Trip' });
        if (result.success) {
            confirmAddToTrip(result.trip.id, service);
        }
    };

    const getCategoryIcon = (cat) => categoryIcons[cat] || Landmark;
    const getCategoryColor = (cat) => {
        const c = categoryColors[cat] || 'primary';
        return { blue: 'from-blue-500 to-blue-600', green: 'from-emerald-500 to-emerald-600', orange: 'from-orange-500 to-orange-600', purple: 'from-purple-500 to-purple-600', primary: 'from-primary-500 to-primary-600' }[c];
    };

    return (
        <div className="min-h-screen bg-dark-900 pt-20 pb-12">
            {/* Hero */}
            <div ref={headerRef} className="relative py-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-dark-900 to-purple-900/30" />
                <div className="container-custom relative z-10">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-4">
                        <Car className="w-4 h-4" /> Build Your Own Trip
                    </span>
                    <h1 className="text-5xl font-display font-bold text-white mb-4">
                        Luxor <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Services</span>
                    </h1>
                    <p className="text-xl text-white/50 max-w-2xl">Pick individual services to build your perfect custom trip - car rentals, bikes, restaurants, and guided temple visits</p>
                </div>
            </div>

            <div ref={contentRef} className="container-custom">
                {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} className="mb-6" />}

                {/* Category Tabs */}
                <div className="flex flex-wrap gap-3 mb-8">
                    <button onClick={() => setActiveCategory('all')} className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${activeCategory === 'all' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-dark-700/50 text-white/50 border border-white/5 hover:bg-white/5'}`}>
                        All Services ({services.length})
                    </button>
                    {categories.map(cat => {
                        const Icon = categoryIcons[cat.id];
                        const count = services.filter(s => s.category === cat.id).length;
                        return (
                            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${activeCategory === cat.id ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-dark-700/50 text-white/50 border border-white/5 hover:bg-white/5'}`}>
                                <Icon className="w-4 h-4" />{cat.label} ({count})
                            </button>
                        );
                    })}
                </div>

                {/* Search */}
                <div className="relative mb-8 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 z-10" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services..." className="w-full pl-10 pr-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300" />
                </div>

                {/* Service Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filtered.map(service => {
                        const CatIcon = getCategoryIcon(service.category);
                        const catLabel = categories.find(c => c.id === service.category)?.label || service.category;
                        return (
                            <div key={service.id} className="group bg-dark-800/60 border border-white/5 rounded-2xl overflow-hidden hover:border-white/15 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-500 hover:-translate-y-1">
                                <div className="relative h-44 overflow-hidden">
                                    <img src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=600'; }} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />
                                    <span className={`absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColor(service.category)} text-white`}>
                                        <CatIcon className="w-3 h-3" />{catLabel}
                                    </span>
                                    <div className="absolute bottom-3 left-3">
                                        <p className="text-2xl font-bold text-white">${service.price}</p>
                                    </div>
                                </div>
                                <div className="p-4 space-y-3">
                                    <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors line-clamp-1">{service.name}</h3>
                                    <p className="text-sm text-white/50 line-clamp-2">{service.description}</p>
                                    <div className="flex items-center gap-4 text-xs text-white/40">
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{service.duration}</span>
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{service.location}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            <span className="text-sm font-semibold text-white">{service.rating}</span>
                                            <span className="text-xs text-white/40">({service.reviews})</span>
                                        </div>
                                        <span className="text-xs text-white/30">{service.vendorName}</span>
                                    </div>
                                    <button onClick={() => handleAddToTrip(service)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold hover:from-primary-400 hover:to-primary-500 transition-all duration-300 hover:-translate-y-0.5 shadow-[0_4px_15px_rgba(242,133,109,0.3)]">
                                        <Plus className="w-4 h-4" />Add to Trip
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-16"><Car className="w-16 h-16 text-white/10 mx-auto mb-4" /><p className="text-xl text-white/30">No services found</p></div>
                )}

                {/* My Trips CTA */}
                {isAuthenticated && (
                    <div className="mt-12 p-6 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-500/20 rounded-2xl flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-white">Ready to plan your trip?</h3>
                            <p className="text-white/50">View your trip plans, add more services, and finalize your itinerary.</p>
                        </div>
                        <Button variant="primary" onClick={() => navigate('/trip-planner')} className="flex items-center gap-2 shrink-0">
                            My Trip Plans <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Add to Trip Modal */}
            {addToTripModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={() => setAddToTripModal(null)} />
                    <Card className="relative z-10 w-full max-w-md">
                        <h3 className="text-xl font-bold text-white mb-4">Add to Trip</h3>
                        <p className="text-white/50 mb-4">Add <span className="text-primary-400 font-medium">"{addToTripModal.name}"</span> to one of your trips:</p>
                        {trips.length > 0 ? (
                            <div className="space-y-2 mb-4">
                                {trips.filter(t => t.status === 'planning').map(trip => (
                                    <button key={trip.id} onClick={() => confirmAddToTrip(trip.id, addToTripModal)} className="w-full flex items-center justify-between p-3 bg-dark-700/50 border border-white/5 rounded-xl hover:bg-white/5 transition-colors text-left">
                                        <div><p className="text-white font-medium">{trip.name}</p><p className="text-xs text-white/40">{trip.items.length} items - ${trip.totalBudget}</p></div>
                                        <Plus className="w-5 h-5 text-primary-400" />
                                    </button>
                                ))}
                            </div>
                        ) : null}
                        <button onClick={() => createTripAndAdd(addToTripModal)} className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-white/20 rounded-xl text-white/60 hover:border-primary-400 hover:text-primary-400 transition-colors">
                            <Plus className="w-4 h-4" />Create New Trip & Add
                        </button>
                        <button onClick={() => setAddToTripModal(null)} className="w-full mt-3 text-center text-sm text-white/40 hover:text-white transition-colors">Cancel</button>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Services;
