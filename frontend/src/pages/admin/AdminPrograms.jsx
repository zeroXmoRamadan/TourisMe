import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Package, Trash2, Eye, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import vendorService from '../../services/vendorService';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';

const AdminPrograms = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [programs, setPrograms] = useState([]);
    const [search, setSearch] = useState('');
    const [alert, setAlert] = useState(null);
    const headerRef = useRef(null);
    const contentRef = useRef(null);

    const load = async () => {
        const result = await vendorService.getAll();
        setPrograms(result);
    };
    useEffect(() => { load(); }, []);

    useEffect(() => {
        gsap.fromTo(headerRef.current, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
        gsap.fromTo(contentRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'power3.out' });
    }, []);

    const flash = (type, message) => { setAlert({ type, message }); setTimeout(() => setAlert(null), 3000); };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this program permanently?')) return;
        const result = await vendorService.delete(id);
        if (result.success) {
            flash('success', 'Program deleted successfully.');
            load();
        } else {
            flash('error', result.error);
        }
    };

    const filtered = programs.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                             (p.description || '').toLowerCase().includes(search.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="min-h-screen bg-dark-900 pt-20 pb-12">
            <div className="container-custom max-w-6xl">
                <div ref={headerRef} className="mb-8">
                    <h1 className="text-4xl font-display font-bold text-white mb-2">
                        Monitor <span className="bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent">Programs</span>
                    </h1>
                    <p className="text-white/50">Monitor all active tour programs. Click a program to manage its reviews.</p>
                </div>

                {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} className="mb-6" />}

                <div ref={contentRef}>
                    <div className="mb-6">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input 
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name..."
                                className="w-full pl-10 pr-4 py-2 bg-dark-700/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                            />
                        </div>
                    </div>

                    <Card>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Program</th>
                                        <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Vendor</th>
                                        <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Price</th>
                                        <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Submitted</th>
                                        <th className="text-right py-4 px-4 text-white/60 font-medium text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((p) => (
                                        <tr 
                                            key={p._id} 
                                            onClick={() => navigate(`/services/${p._id}`)}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                                        >
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=100'} alt={p.name} className="w-12 h-12 rounded-lg object-cover" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=100'; }} />
                                                    <div><p className="font-semibold text-white text-sm group-hover:text-primary-400 transition-colors">{p.name}</p><p className="text-xs text-white/40">{p.durationDays} days - {p.serviceType}</p></div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-sm text-white/70">{p.ownerId?.companyName || p.ownerId?.name || 'Unknown'}</td>
                                            <td className="py-4 px-4 text-white/80">${p.price}</td>
                                            <td className="py-4 px-4 text-sm text-white/50">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'}</td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); navigate(`/services/${p._id}`); }} 
                                                        className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors text-primary-400"
                                                        title="View Details & Reviews"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => handleDelete(p._id, e)} 
                                                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-400"
                                                        title="Delete Program"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filtered.length === 0 && (
                                <div className="text-center py-12"><Package className="w-12 h-12 text-white/10 mx-auto mb-3" /><p className="text-white/40">No programs found</p></div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminPrograms;
