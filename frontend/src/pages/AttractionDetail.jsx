import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, MapPin, Clock, Ticket, ArrowLeft, Landmark, Plus } from 'lucide-react';
import attractionsService from '../services/attractionsService';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import ReviewSection from '../components/common/ReviewSection';

gsap.registerPlugin(ScrollTrigger);

const AttractionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [attraction, setAttraction] = useState(null);
    const [loading, setLoading] = useState(true);

    const heroRef = useRef(null);
    const contentRef = useRef(null);
    const sidebarRef = useRef(null);

    useEffect(() => {
        const data = attractionsService.getById(id);
        setAttraction(data);
        setLoading(false);
    }, [id]);

    useEffect(() => {
        if (!attraction) return;

        gsap.killTweensOf([heroRef.current, contentRef.current, sidebarRef.current]);

        gsap.fromTo(heroRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 1, ease: 'power2.out' }
        );

        const contentCards = contentRef.current?.querySelectorAll('.detail-card');
        if (contentCards && contentCards.length > 0) {
            gsap.fromTo(contentCards,
                { opacity: 0, y: 50, scale: 0.98 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: 0.7, stagger: 0.12, ease: 'power3.out',
                    scrollTrigger: {
                        trigger: contentRef.current,
                        start: 'top 75%',
                        once: true
                    }
                }
            );
        }

        gsap.fromTo(sidebarRef.current,
            { opacity: 0, x: 60 },
            { opacity: 1, x: 0, duration: 0.9, delay: 0.3, ease: 'back.out(1.2)' }
        );

        return () => {
            gsap.killTweensOf([heroRef.current, contentRef.current, sidebarRef.current]);
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
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
        <div className="min-h-screen bg-dark-900 pt-20">
            {/* Hero */}
            <div ref={heroRef} className="relative h-[500px] overflow-hidden">
                <img src={attraction.image} alt={attraction.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/60 to-dark-900/30" />

                <Button
                    variant="glass"
                    className="absolute top-8 left-8 z-10"
                    onClick={() => navigate('/attractions')}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                <div className="absolute top-8 right-8">
                    <span className="px-4 py-2 bg-dark-700/80 backdrop-blur-sm border border-white/10 rounded-xl text-sm font-semibold text-primary-400">
                        {attraction.category}
                    </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="container-custom">
                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-3 text-white">{attraction.name}</h1>
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2 text-white/70">
                                <MapPin className="w-5 h-5 text-primary-400" />
                                <span>{attraction.location}</span>
                            </div>
                            <span className="text-white/30">•</span>
                            <div className="flex items-center gap-1 text-white/70">
                                <Star className="w-5 h-5 fill-primary-400 text-primary-400" />
                                <span>{attraction.rating}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container-custom py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main */}
                    <div ref={contentRef} className="lg:col-span-2 space-y-8">
                        <Card className="detail-card">
                            <h2 className="text-3xl font-bold mb-4 text-white">About This Place</h2>
                            <p className="text-white/60 text-lg leading-relaxed">{attraction.description}</p>
                        </Card>

                        <Card className="detail-card">
                            <h2 className="text-2xl font-bold mb-6 text-white">Highlights</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {attraction.highlights.map((h, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                        <Star className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-white/80">{h}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Reviews */}
                        <ReviewSection targetType="attractions" targetId={id} />
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
                                            <span className="font-medium text-white">{attraction.entryFee}</span>
                                        </div>

                                        <div className="flex justify-between py-3 border-b border-white/10">
                                            <span className="flex items-center gap-2 text-white/60">
                                                <MapPin className="w-5 h-5 text-primary-400" />
                                                Location
                                            </span>
                                            <span className="font-medium text-white text-sm text-right">{attraction.location}</span>
                                        </div>

                                        <div className="flex justify-between py-3">
                                            <span className="text-white/60">Rating</span>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-5 h-5 fill-primary-400 text-primary-400" />
                                                <span className="font-medium text-white">{attraction.rating}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Trip Plan Placeholder */}
                                    <Button
                                        variant="primary"
                                        fullWidth
                                        size="lg"
                                        disabled
                                        className="mb-3 opacity-60 cursor-not-allowed"
                                        title="Trip Plans feature coming soon!"
                                    >
                                        <Plus className="w-5 h-5 mr-2" />
                                        Add to Trip Plan
                                    </Button>
                                    <p className="text-xs text-center text-white/40">
                                        Trip Plans feature coming soon
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
