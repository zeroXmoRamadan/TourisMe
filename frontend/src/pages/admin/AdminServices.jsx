import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Package, Trash2, Eye, Car, UtensilsCrossed, Landmark, Search, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import individualServicesService from '../../services/individualServicesService';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';

const categoryIcons = { Rental: Car, Restaurant: UtensilsCrossed, TourPackage: Landmark };

const AdminServices = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [alert, setAlert] = useState(null);
    const headerRef = useRef(null);
    const contentRef = useRef(null);

    const load = async () => {
        const result = await individualServicesService.getApproved();
        setServices(result);
    };
    useEffect(() => { load(); }, []);

    useEffect(() => {
        gsap.fromTo(headerRef.current, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
        gsap.fromTo(contentRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'power3.out' });
    }, []);

    const flash = (type, message) => { setAlert({ type, message }); setTimeout(() => setAlert(null), 3000); };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this service permanently?')) return;
        const result = await individualServicesService.delete(id);
        if (result.success) {
            flash('success', 'Service deleted successfully.');
            load();
        } else {
            flash('error', result.error);
        }
    };

    const filtered = services.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                             (s.description || '').toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || s.serviceType === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = individualServicesService.getCategories();
    const getCatLabel = (id) => categories.find(c => c.id === id)?.label || id;

    return (
        <div className="min-h-screen bg-dark-900 pt-20 pb-12">
            <div className="container-custom max-w-6xl">
                <div ref={headerRef} className="mb-8">
                    <h1 className="text-4xl font-display font-bold text-white mb-2">
                        Monitor <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Services</span>
                    </h1>
                    <p className="text-white/50">Monitor all active vendor services. Click a service to manage its reviews.</p>
                </div>

                {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} className="mb-6" />}

                <div ref={contentRef}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input 
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name..."
                                className="w-full pl-10 pr-4 py-2 bg-dark-700/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                            />
                        </div>

                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <select 
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-dark-700/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 appearance-none"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
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
                                        <th className="text-right py-4 px-4 text-white/60 font-medium text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(s => {
                                        const CatIcon = categoryIcons[s.serviceType] || Package;
                                        return (
                                            <tr 
                                                key={s._id} 
                                                onClick={() => navigate(`/services/${s._id}`)}
                                                className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                                            >
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={s.images?.[0] || 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=100'} alt={s.name} className="w-12 h-12 rounded-lg object-cover" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=100'; }} />
                                                        <div><p className="font-semibold text-white text-sm group-hover:text-primary-400 transition-colors">{s.name}</p><p className="text-xs text-white/40">{s.durationDays ? `${s.durationDays} days` : s.cuisineType || s.vehicleType}</p></div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4"><span className="flex items-center gap-1 text-sm text-white/70"><CatIcon className="w-4 h-4" />{getCatLabel(s.serviceType)}</span></td>
                                                <td className="py-4 px-4 text-sm text-white/70">{s.ownerId?.companyName || s.ownerId?.name || 'Unknown'}</td>
                                                <td className="py-4 px-4 text-sm font-semibold text-primary-400">${s.price}</td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); navigate(`/services/${s._id}`); }} 
                                                            className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors text-primary-400"
                                                            title="View Details & Reviews"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => handleDelete(s._id, e)} 
                                                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-400"
                                                            title="Delete Service"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {filtered.length === 0 && <div className="text-center py-12"><Package className="w-12 h-12 text-white/10 mx-auto mb-3" /><p className="text-white/40">No services found</p></div>}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminServices;
