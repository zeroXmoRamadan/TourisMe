import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Package, CheckCircle, XCircle, Clock, Eye, X, Star, Users, DollarSign, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import vendorService from '../../services/vendorService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const AdminPrograms = () => {
    const { user } = useAuth();
    const [programs, setPrograms] = useState([]);
    const [filter, setFilter] = useState('pending');
    const [alert, setAlert] = useState(null);
    const [viewProgram, setViewProgram] = useState(null);
    const headerRef = useRef(null);
    const contentRef = useRef(null);

    const load = () => setPrograms(vendorService.getAll());
    useEffect(() => { load(); }, []);

    useEffect(() => {
        gsap.fromTo(headerRef.current, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
        gsap.fromTo(contentRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'power3.out' });
    }, []);

    const handleApprove = (id) => {
        const result = vendorService.approve(id, user.id);
        if (result.success) {
            setAlert({ type: 'success', message: 'Program approved!' });
            load();
            setViewProgram(null);
        }
        setTimeout(() => setAlert(null), 3000);
    };

    const handleReject = (id) => {
        const result = vendorService.reject(id, user.id);
        if (result.success) {
            setAlert({ type: 'success', message: 'Program rejected' });
            load();
            setViewProgram(null);
        }
        setTimeout(() => setAlert(null), 3000);
    };

    const filtered = filter === 'all' ? programs : programs.filter(p => p.status === filter);
    const counts = {
        all: programs.length,
        pending: programs.filter(p => p.status === 'pending').length,
        approved: programs.filter(p => p.status === 'approved').length,
        rejected: programs.filter(p => p.status === 'rejected').length,
    };

    const statusBadge = (status) => {
        const styles = { pending: 'bg-yellow-500/10 text-yellow-400', approved: 'bg-green-500/10 text-green-400', rejected: 'bg-red-500/10 text-red-400' };
        const icons = { pending: Clock, approved: CheckCircle, rejected: XCircle };
        const Icon = icons[status];
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
                <Icon className="w-3 h-3" />{status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-dark-900 pt-20 pb-12">
            <div className="container-custom max-w-6xl">
                <div ref={headerRef} className="mb-8">
                    <h1 className="text-4xl font-display font-bold text-white mb-2">
                        Program <span className="bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent">Approvals</span>
                    </h1>
                    <p className="text-white/50">Review and approve vendor-submitted tour programs</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        {[
                            { label: 'Total', value: counts.all, icon: Package, color: 'text-primary-400' },
                            { label: 'Pending', value: counts.pending, icon: Clock, color: 'text-yellow-400' },
                            { label: 'Approved', value: counts.approved, icon: CheckCircle, color: 'text-green-400' },
                            { label: 'Rejected', value: counts.rejected, icon: XCircle, color: 'text-red-400' },
                        ].map((s, i) => {
                            const Icon = s.icon;
                            return (
                                <Card key={i} className="text-center">
                                    <Icon className={`w-6 h-6 mx-auto mb-2 ${s.color}`} />
                                    <p className="text-2xl font-bold text-white">{s.value}</p>
                                    <p className="text-xs text-white/40">{s.label}</p>
                                </Card>
                            );
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
                                        <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Program</th>
                                        <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Vendor</th>
                                        <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Price</th>
                                        <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Status</th>
                                        <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Submitted</th>
                                        <th className="text-right py-4 px-4 text-white/60 font-medium text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((p) => (
                                        <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=100'; }} />
                                                    <div><p className="font-semibold text-white text-sm">{p.name}</p><p className="text-xs text-white/40">{p.duration} - {p.category}</p></div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-sm text-white/70">{p.vendorName || p.company}</td>
                                            <td className="py-4 px-4 text-white/80">${p.price}</td>
                                            <td className="py-4 px-4">{statusBadge(p.status)}</td>
                                            <td className="py-4 px-4 text-sm text-white/50">{p.submittedAt ? new Date(p.submittedAt).toLocaleDateString() : 'N/A'}</td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => setViewProgram(p)} className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors" title="View Details"><Eye className="w-4 h-4 text-primary-400" /></button>
                                                    {p.status === 'pending' && (
                                                        <>
                                                            <button onClick={() => handleApprove(p.id)} className="p-2 hover:bg-green-500/10 rounded-lg transition-colors" title="Approve"><CheckCircle className="w-4 h-4 text-green-400" /></button>
                                                            <button onClick={() => handleReject(p.id)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors" title="Reject"><XCircle className="w-4 h-4 text-red-400" /></button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filtered.length === 0 && (
                                <div className="text-center py-12"><Package className="w-12 h-12 text-white/10 mx-auto mb-3" /><p className="text-white/40">{filter === 'pending' ? 'No pending programs to review' : 'No programs found'}</p></div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Detail Modal */}
                {viewProgram && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 pb-8 px-4 overflow-y-auto">
                        <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={() => setViewProgram(null)} />
                        <Card className="relative z-10 w-full max-w-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">Program Details</h2>
                                <button onClick={() => setViewProgram(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><X className="w-5 h-5 text-white/60" /></button>
                            </div>
                            <div className="space-y-4">
                                <img src={viewProgram.image} alt={viewProgram.name} className="w-full h-48 object-cover rounded-xl" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800'; }} />
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-white">{viewProgram.name}</h3>
                                    {statusBadge(viewProgram.status)}
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div className="bg-dark-700/50 rounded-xl p-3"><p className="text-white/40">Vendor</p><p className="text-white font-medium">{viewProgram.vendorName || viewProgram.company}</p></div>
                                    <div className="bg-dark-700/50 rounded-xl p-3"><p className="text-white/40">Price</p><p className="text-white font-medium">${viewProgram.price} {viewProgram.discount > 0 && <span className="text-primary-400">({viewProgram.discount}% off)</span>}</p></div>
                                    <div className="bg-dark-700/50 rounded-xl p-3"><p className="text-white/40">Duration</p><p className="text-white font-medium">{viewProgram.duration}</p></div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div className="bg-dark-700/50 rounded-xl p-3"><p className="text-white/40">Group Size</p><p className="text-white font-medium">{viewProgram.groupSize}</p></div>
                                    <div className="bg-dark-700/50 rounded-xl p-3"><p className="text-white/40">Difficulty</p><p className="text-white font-medium">{viewProgram.difficulty}</p></div>
                                    <div className="bg-dark-700/50 rounded-xl p-3"><p className="text-white/40">Category</p><p className="text-white font-medium">{viewProgram.category}</p></div>
                                </div>
                                <div><p className="text-white/40 text-sm mb-1">Description</p><p className="text-white/80">{viewProgram.description}</p></div>
                                {viewProgram.highlights?.length > 0 && (
                                    <div><p className="text-white/40 text-sm mb-2">Highlights</p><ul className="space-y-1">{viewProgram.highlights.map((h, i) => <li key={i} className="text-white/70 text-sm flex items-center gap-2"><Star className="w-3 h-3 text-primary-400 flex-shrink-0" />{h}</li>)}</ul></div>
                                )}
                                {viewProgram.included?.length > 0 && (
                                    <div><p className="text-white/40 text-sm mb-2">Included</p><ul className="space-y-1">{viewProgram.included.map((h, i) => <li key={i} className="text-white/70 text-sm flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />{h}</li>)}</ul></div>
                                )}
                                {viewProgram.status === 'pending' && (
                                    <div className="flex gap-3 pt-4 border-t border-white/10">
                                        <Button variant="primary" onClick={() => handleApprove(viewProgram.id)} className="flex items-center gap-2"><CheckCircle className="w-4 h-4" />Approve</Button>
                                        <Button variant="danger" onClick={() => handleReject(viewProgram.id)} className="flex items-center gap-2"><XCircle className="w-4 h-4" />Reject</Button>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPrograms;
