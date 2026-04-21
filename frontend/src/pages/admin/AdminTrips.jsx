import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { MapPin, Eye, X, Calendar, DollarSign, Car, Bike, UtensilsCrossed, Landmark, Package, Users, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import tripPlannerService from '../../services/tripPlannerService';
import Card from '../../components/common/Card';

const categoryIcons = { car_rental: Car, bicycle_rental: Bike, restaurant: UtensilsCrossed, temple_visit: Landmark };
const statusStyles = {
    planning: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Planning' },
    confirmed: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Confirmed' },
    completed: { bg: 'bg-purple-500/10', text: 'text-purple-400', label: 'Completed' },
    cancelled: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Cancelled' },
};

const AdminTrips = () => {
    const [trips, setTrips] = useState([]);
    const [stats, setStats] = useState({ total: 0, planning: 0, confirmed: 0, completed: 0, cancelled: 0, totalRevenue: 0 });
    const [filter, setFilter] = useState('all');
    const [viewTrip, setViewTrip] = useState(null);
    const [search, setSearch] = useState('');
    const headerRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        setTrips(tripPlannerService.getAllTrips());
        setStats(tripPlannerService.getStats());
    }, []);

    useEffect(() => {
        gsap.fromTo(headerRef.current, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
        gsap.fromTo(contentRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'power3.out' });
    }, []);

    const filtered = trips.filter(t => {
        const matchStatus = filter === 'all' || t.status === filter;
        const matchSearch = search === '' || t.userName?.toLowerCase().includes(search.toLowerCase()) || t.name?.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    return (
        <div className="min-h-screen bg-dark-900 pt-20 pb-12">
            <div className="container-custom max-w-6xl">
                <div ref={headerRef} className="mb-8">
                    <h1 className="text-4xl font-display font-bold text-white mb-2">
                        Trip <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Monitor</span>
                    </h1>
                    <p className="text-white/50">Track and monitor all tourist trip plans</p>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
                        {[
                            { label: 'Total Trips', value: stats.total, icon: MapPin, color: 'text-primary-400' },
                            { label: 'Planning', value: stats.planning, icon: Clock, color: 'text-blue-400' },
                            { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle, color: 'text-green-400' },
                            { label: 'Completed', value: stats.completed, icon: Package, color: 'text-purple-400' },
                            { label: 'Cancelled', value: stats.cancelled, icon: XCircle, color: 'text-red-400' },
                            { label: 'Revenue', value: `$${stats.totalRevenue}`, icon: DollarSign, color: 'text-yellow-400' },
                        ].map((s, i) => {
                            const Icon = s.icon;
                            return (
                                <Card key={i} className="text-center">
                                    <Icon className={`w-5 h-5 mx-auto mb-1.5 ${s.color}`} />
                                    <p className="text-xl font-bold text-white">{s.value}</p>
                                    <p className="text-xs text-white/40">{s.label}</p>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                <div ref={contentRef}>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by tourist or trip name..." className="w-full pl-4 pr-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300" />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {['all', 'planning', 'confirmed', 'completed', 'cancelled'].map(f => (
                                <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${filter === f ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-dark-700/50 text-white/50 border border-white/5 hover:bg-white/5'}`}>
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Card>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Trip</th>
                                        <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Tourist</th>
                                        <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Items</th>
                                        <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Budget</th>
                                        <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Status</th>
                                        <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Date</th>
                                        <th className="text-right py-4 px-4 text-white/60 font-medium text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(trip => {
                                        const st = statusStyles[trip.status] || statusStyles.planning;
                                        return (
                                            <tr key={trip.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-4">
                                                    <p className="font-semibold text-white text-sm">{trip.name}</p>
                                                    <p className="text-xs text-white/40">Created {new Date(trip.createdAt).toLocaleDateString()}</p>
                                                </td>
                                                <td className="py-4 px-4 text-sm text-white/70">{trip.userName || 'Unknown'}</td>
                                                <td className="py-4 px-4 text-sm text-white/70">{trip.items?.length || 0}</td>
                                                <td className="py-4 px-4 text-sm font-semibold text-primary-400">${trip.totalBudget || 0}</td>
                                                <td className="py-4 px-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${st.bg} ${st.text}`}>{st.label}</span></td>
                                                <td className="py-4 px-4 text-sm text-white/50">{trip.date || 'Not set'}</td>
                                                <td className="py-4 px-4 text-right">
                                                    <button onClick={() => setViewTrip(trip)} className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"><Eye className="w-4 h-4 text-primary-400" /></button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {filtered.length === 0 && (
                                <div className="text-center py-12"><MapPin className="w-12 h-12 text-white/10 mx-auto mb-3" /><p className="text-white/40">No trips found</p></div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* View Trip Modal */}
                {viewTrip && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 pb-8 px-4 overflow-y-auto">
                        <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={() => setViewTrip(null)} />
                        <Card className="relative z-10 w-full max-w-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">{viewTrip.name}</h2>
                                <button onClick={() => setViewTrip(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><X className="w-5 h-5 text-white/60" /></button>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                                <div className="bg-dark-700/50 rounded-xl p-3"><p className="text-white/40">Tourist</p><p className="text-white font-medium">{viewTrip.userName}</p></div>
                                <div className="bg-dark-700/50 rounded-xl p-3"><p className="text-white/40">Date</p><p className="text-white font-medium">{viewTrip.date || 'Not set'}</p></div>
                                <div className="bg-dark-700/50 rounded-xl p-3"><p className="text-white/40">Budget</p><p className="text-primary-400 font-bold text-lg">${viewTrip.totalBudget}</p></div>
                            </div>
                            {viewTrip.notes && <p className="text-white/50 text-sm mb-4 italic bg-dark-700/30 rounded-xl p-3">"{viewTrip.notes}"</p>}
                            <h4 className="text-sm font-medium text-white/60 mb-3">Items ({viewTrip.items?.length || 0})</h4>
                            <div className="space-y-2">
                                {(viewTrip.items || []).map(item => {
                                    const CatIcon = categoryIcons[item.category] || Package;
                                    return (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-dark-700/30 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <img src={item.image} alt={item.serviceName} className="w-10 h-10 rounded-lg object-cover" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=100'; }} />
                                                <div>
                                                    <p className="text-sm font-medium text-white flex items-center gap-2"><CatIcon className="w-3 h-3 text-white/40" />{item.serviceName}</p>
                                                    <p className="text-xs text-white/40">{item.vendor}</p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-semibold text-primary-400">${item.price}</span>
                                        </div>
                                    );
                                })}
                                {(!viewTrip.items || viewTrip.items.length === 0) && <p className="text-center text-white/30 py-4">No items in this trip</p>}
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTrips;
