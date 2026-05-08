import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Search, Star, MapPin, Filter, X, Landmark } from 'lucide-react';
import attractionsService from '../services/attractionsService';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import StarRating from '../components/common/StarRating';

const Attractions = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [attractions, setAttractions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const headerRef = useRef(null);
    const filtersRef = useRef(null);
    const cardsContainerRef = useRef(null);
    const hasInitiallyAnimated = useRef(false);

    useEffect(() => {
        const fetchCategories = async () => {
            const cats = await attractionsService.getCategories();
            setCategories(cats);
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchAttractions = async () => {
            setLoading(true);
            const result = await attractionsService.filter({
                category: selectedCategory,
                searchQuery,
            });
            if (result.success) {
                setAttractions(result.attractions);
            }
            setLoading(false);

            if (hasInitiallyAnimated.current && cardsContainerRef.current) {
                const cards = cardsContainerRef.current.querySelectorAll('.attraction-card');
                if (cards.length > 0) {
                    gsap.fromTo(cards,
                        { opacity: 0, y: 20, scale: 0.98 },
                        { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out' }
                    );
                }
            }
        };
        fetchAttractions();
    }, [selectedCategory, searchQuery]);

    useEffect(() => {
        gsap.fromTo(headerRef.current,
            { opacity: 0, y: -40 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        );

        gsap.fromTo(filtersRef.current,
            { opacity: 0, x: -50 },
            { opacity: 1, x: 0, duration: 0.7, delay: 0.2, ease: 'power3.out' }
        );

        if (cardsContainerRef.current) {
            const cards = cardsContainerRef.current.querySelectorAll('.attraction-card');
            if (cards.length > 0) {
                gsap.fromTo(cards,
                    { opacity: 0, y: 60, scale: 0.95 },
                    {
                        opacity: 1, y: 0, scale: 1, duration: 0.6,
                        stagger: 0.1, delay: 0.4, ease: 'power3.out',
                        onComplete: () => { hasInitiallyAnimated.current = true; }
                    }
                );
            } else {
                hasInitiallyAnimated.current = true;
            }
        }
    }, []);

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('');
    };

    const hasActiveFilters = searchQuery || selectedCategory;

    return (
        <div className="min-h-screen bg-dark-900 pt-20">
            {/* Header */}
            <section ref={headerRef} className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-dark-800 via-dark-900 to-dark-800" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px]" />

                <div className="container-custom relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
                        <Landmark className="w-4 h-4 text-primary-400" />
                        <span className="text-sm text-white/80">Famous Places in Luxor</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 text-white">
                        Luxor <span className="bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent">Attractions</span>
                    </h1>
                    <p className="text-xl text-white/50 mb-6 max-w-2xl">
                        Discover the most iconic temples, tombs, and monuments of ancient Thebes
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="section-padding">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Mobile Filter Toggle */}
                        <div className="lg:hidden">
                            <Button variant="glass" fullWidth onClick={() => setIsMobileFilterOpen(true)} className="flex items-center justify-center gap-2">
                                <Filter className="w-5 h-5" />
                                Filters
                                {hasActiveFilters && <span className="w-2 h-2 bg-primary-500 rounded-full" />}
                            </Button>
                        </div>

                        {/* Filters Sidebar */}
                        <div
                            ref={filtersRef}
                            className={`lg:col-span-1 ${isMobileFilterOpen ? 'fixed inset-0 z-50 bg-dark-900/95 backdrop-blur-xl p-6 overflow-y-auto' : 'hidden lg:block'}`}
                        >
                            {isMobileFilterOpen && (
                                <div className="flex justify-between items-center mb-6 lg:hidden">
                                    <h3 className="text-xl font-bold text-white">Filters</h3>
                                    <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                        <X className="w-6 h-6 text-white" />
                                    </button>
                                </div>
                            )}

                            <Card className="sticky top-24">
                                <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                                    <Filter className="w-5 h-5 text-primary-400" />
                                    Filters
                                </h3>
                                <div className="space-y-6">
                                    <Input
                                        placeholder="Search attractions..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        icon={Search}
                                    />

                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-white/80">Category</label>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="w-full px-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-300"
                                        >
                                            <option value="">All Categories</option>
                                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                    </div>

                                    {hasActiveFilters && (
                                        <Button variant="outline" fullWidth onClick={clearFilters}>
                                            Clear Filters
                                        </Button>
                                    )}

                                    {isMobileFilterOpen && (
                                        <Button variant="primary" fullWidth onClick={() => setIsMobileFilterOpen(false)} className="lg:hidden">
                                            Apply Filters
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        </div>

                        {/* Attractions Grid */}
                        <div className="lg:col-span-3">
                            <div className="flex items-center justify-between mb-6">
                                <p className="text-white/50">
                                    {loading ? 'Searching...' : (
                                        <>
                                            <span className="font-semibold text-primary-400">{attractions.length}</span> attraction(s) found
                                        </>
                                    )}
                                </p>
                            </div>

                            <div ref={cardsContainerRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
                                {loading ? (
                                    <div className="col-span-full flex items-center justify-center">
                                        <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
                                    </div>
                                ) : (
                                    attractions.map((attraction) => (
                                        <div key={attraction._id} className="attraction-card h-full">
                                            <Card
                                                hover
                                                padding={false}
                                                onClick={() => navigate(`/attractions/${attraction._id}`)}
                                                className="cursor-pointer h-full flex flex-col"
                                            >
                                                <div className="relative h-56 overflow-hidden">
                                                    <img
                                                        src={attraction.images?.[0] || attraction.image}
                                                        alt={attraction.name}
                                                        className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent" />
                                                    <div className="absolute top-4 right-4">
                                                        <span className="px-3 py-1 bg-dark-700/80 backdrop-blur-sm border border-white/10 rounded-full text-sm font-medium text-primary-400">
                                                            {attraction.category}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-5 flex-1 flex flex-col">
                                                    <h3 className="text-xl font-bold mb-2 text-white">{attraction.name}</h3>
                                                    <p className="text-white/50 mb-4 line-clamp-2 flex-1">{attraction.description}</p>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-4 h-4 fill-primary-400 text-primary-400" />
                                                            <span className="font-semibold text-white/80">{attraction.averageRating || attraction.rating || 0}</span>
                                                            {(attraction.totalReviews || attraction.reviewCount) > 0 && (
                                                                <span className="text-white/40 text-sm">({attraction.totalReviews || attraction.reviewCount})</span>
                                                            )}
                                                        </div>
                                                        <span className="text-sm text-white/50 flex items-center gap-1">
                                                            <MapPin className="w-4 h-4" />
                                                            {typeof attraction.location === 'string' 
                                                                ? attraction.location 
                                                                : attraction.location?.address || 'Luxor, Egypt'
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                                        <span className="text-sm text-white/40">{attraction.ticketPrice ? `$${attraction.ticketPrice}` : attraction.entryFee}</span>
                                                        <span className="text-primary-400 font-semibold text-sm">
                                                            View Details →
                                                        </span>
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                    ))
                                )}
                            </div>

                            {!loading && attractions.length === 0 && (
                                <div className="text-center py-16">
                                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-dark-700/50 flex items-center justify-center">
                                        <Search className="w-10 h-10 text-white/30" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">No attractions found</h3>
                                    <p className="text-white/50 mb-6">Try adjusting your filters or search query</p>
                                    <Button variant="outline" onClick={clearFilters}>
                                        Clear Filters
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Attractions;
