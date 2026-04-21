import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Package, CheckCircle, XCircle, Clock, Eye, X, Car, Bike, UtensilsCrossed, Landmark, Star, MapPin, DollarSign } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import individualServicesService from '../../services/individualServicesService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const categoryIcons = { car_rental: Car, bicycle_rental: Bike, restaurant: UtensilsCrossed, temple_visit: Landmark };

const AdminServices = () => {
    const { user } = useAuth();
    const [services, setServices] = useState([]);
    const [filter, setFilter] = useState('pending');
    const [alert, setAlert] = useState(null);
    const [viewService, setViewService] = useState(null);
    const headerRef = useRef(null);
    const contentRef = useRef(null);

    const load = () => setServices(individualServicesService.getAll());
    useEffect(() => { load(); }, []);

    useEffect(() => {
        gsap.fromTo(headerRef.current, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
        gsap.fromTo(contentRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'power3.out' });
    }, []);

    const flash = (type, message) => { setAlert({ type, message }); setTimeout(() => setAlert(null), 3000); };

    const handleApprove = (id) => {
        individualServicesService.approve(id, user.id);
        flash('success', 'Service approved!'); load(); setViewService(null);
    };
    const handleReject = (id) => {
        individualServicesService.reject(id, user.id);
        flash('success', 'Service rejected'); load(); setViewService(null);
    };

    const filtered = filter === 'all' ? services : services.filter(s => s.status === filter);
    const counts = {
        all: services.length,
        pending: services.filter(s => s.status === 'pending').length,
        approved: services.filter(s => s.status === 'approved').length,
        rejected: services.filter(s => s.status === 'rejected').length,
    };

    const categories = individualServicesService.getCategories();
    const getCatLabel = (id) => categories.find(c => c.id === id)?.label || id;

    return (
        <div className="min-h-screen bg-dark-900 pt-20 pb-12">
            <div className="container-custom max-w-6xl">
                <div ref={headerRef} className="mb-8">
                    <h1 className="text-4xl font-display font-bold text-white mb-2">
                        Service <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Approvals</span>
                    </h1>
                    <p className="text-white/50">Review and approve vendor-submitted individual services</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        {[
                            { label: 'Total', value: counts.all, icon: Package, color: 'text-primary-400' },
                            { label: 'Pending', value: counts.pending, icon: Clock, color: 'text-yellow-400' },
                            { label: 'Approved', value: counts.approved, icon: CheckCircle, color: 'text-green-400' },
                            { label: 'Rejected', value: counts.rejected, icon: XCircle, color: 'text-red-400' },
                        ].map((s, i) => {
                            const Icon = s.icon;
                            return <Card key={i} className="text-center"><Icon className={`w-6 h-6 mx-auto mb-2 ${s.color}`} /><p className="text-2xl font-bold text-white">{s.value}</p><p className="text-xs text-white/40">{s.label}</p></Card>;
                        })}
                    </div>
                </div>

                {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} className="mb-6" />}

                <div ref={contentRef}>
                    <div className="flex gap-2 mb-6">
                        {['pending', 'approved', 'rejected', 'all'].map(f => (
                            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${filter === f ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-dark-700/50 text-white/50 border border-white/5 hover:bg-white/5'}`}>
                                {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
                            </button>
                        ))}
                    </div>

                    <Card>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Service</th>
                                        <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Category</th>
                                        <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Vendor</th>
                                        <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Price</th>
                                        <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Status</th>
                                        <th className="text-right py-4 px-4 text-white/60 font-medium text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(s => {
                                        const CatIcon = categoryIcons[s.category] || Package;
                                        const statusStyle = s.status === 'approved' ? 'bg-green-500/10 text-green-400' : s.status === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400';
                                        return (
                                            <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={s.image} alt={s.name} className="w-12 h-12 rounded-lg object-cover" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=100'; }} />
                                                        <div><p className="font-semibold text-white text-sm">{s.name}</p><p className="text-xs text-white/40">{s.duration}</p></div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4"><span className="flex items-center gap-1 text-sm text-white/70"><CatIcon className="w-4 h-4" />{getCatLabel(s.category)}</span></td>
                                                <td className="py-4 px-4 text-sm text-white/70">{s.vendorName}</td>
                                                <td className="py-4 px-4 text-sm font-semibold text-primary-400">${s.price}</td>
                                                <td className="py-4 px-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle}`}>{s.status.charAt(0).toUpperCase() + s.status.slice(1)}</span></td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => setViewService(s)} className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"><Eye className="w-4 h-4 text-primary-400" /></button>
                                                        {s.status === 'pending' && (
                                                            <>
                                                                <button onClick={() => handleApprove(s.id)} className="p-2 hover:bg-green-500/10 rounded-lg transition-colors"><CheckCircle className="w-4 h-4 text-green-400" /></button>
                                                                <button onClick={() => handleReject(s.id)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"><XCircle className="w-4 h-4 text-red-400" /></button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {filtered.length === 0 && <div className="text-center py-12"><Package className="w-12 h-12 text-white/10 mx-auto mb-3" /><p className="text-white/40">{filter === 'pending' ? 'No pending services' : 'No services found'}</p></div>}
                        </div>
                    </Card>
                </div>

                {/* Detail Modal */}
                {viewService && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 pb-8 px-4 overflow-y-auto">
                        <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={() => setViewService(null)} />
                        <Card className="relative z-10 w-full max-w-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-white">Service Details</h2>
                                <button onClick={() => setViewService(null)} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5 text-white/60" /></button>
                            </div>
                            <img src={viewService.image} alt={viewService.name} className="w-full h-48 object-cover rounded-xl mb-4" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800'; }} />
                            <h3 className="text-xl font-bold text-white mb-2">{viewService.name}</h3>
                            <p className="text-white/60 mb-4">{viewService.description}</p>
                            <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                                <div className="bg-dark-700/50 rounded-xl p-3"><p className="text-white/40">Price</p><p className="text-primary-400 font-bold">${viewService.price}</p></div>
                                <div className="bg-dark-700/50 rounded-xl p-3"><p className="text-white/40">Duration</p><p className="text-white">{viewService.duration}</p></div>
                                <div className="bg-dark-700/50 rounded-xl p-3"><p className="text-white/40">Location</p><p className="text-white">{viewService.location}</p></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                <div className="bg-dark-700/50 rounded-xl p-3"><p className="text-white/40">Vendor</p><p className="text-white">{viewService.vendorName}</p></div>
                                <div className="bg-dark-700/50 rounded-xl p-3"><p className="text-white/40">Capacity</p><p className="text-white">{viewService.capacity}</p></div>
                            </div>
                            {viewService.status === 'pending' && (
                                <div className="flex gap-3 pt-4 border-t border-white/10">
                                    <Button variant="primary" onClick={() => handleApprove(viewService.id)} className="flex items-center gap-2"><CheckCircle className="w-4 h-4" />Approve</Button>
                                    <Button variant="danger" onClick={() => handleReject(viewService.id)} className="flex items-center gap-2"><XCircle className="w-4 h-4" />Reject</Button>
                                </div>
                            )}
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminServices;
