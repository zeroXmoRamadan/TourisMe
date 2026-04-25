import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Plus, Edit2, Trash2, Package, X, Save, Image, Clock, CheckCircle, XCircle, BarChart3, Users, DollarSign, TrendingUp, Car, Bike, UtensilsCrossed, Landmark } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import vendorService from '../../services/vendorService';
import individualServicesService from '../../services/individualServicesService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';

const SERVICE_CATEGORY_ICONS = { car_rental: Car, bicycle_rental: Bike, restaurant: UtensilsCrossed, temple_visit: Landmark };

const emptyForm = {
    name: '', company: '', image: '', duration: '', price: '', originalPrice: '',
    discount: '', groupSize: '', difficulty: 'Easy', category: 'Cultural',
    description: '', highlights: [''], included: [''],
};

const emptySvcForm = {
    name: '', category: 'car_rental', image: '', duration: '', price: '',
    location: '', capacity: '', description: '',
};

const VendorDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('programs');
    const [programs, setPrograms] = useState([]);
    const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0, totalBookings: 0 });
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [alert, setAlert] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [filter, setFilter] = useState('all');
    // Services state
    const [myServices, setMyServices] = useState([]);
    const [showSvcForm, setShowSvcForm] = useState(false);
    const [editingSvcId, setEditingSvcId] = useState(null);
    const [svcFormData, setSvcFormData] = useState(emptySvcForm);
    const [svcFilter, setSvcFilter] = useState('all');
    const headerRef = useRef(null);
    const contentRef = useRef(null);

    const load = () => {
        const p = vendorService.getByVendor(user.id);
        setPrograms(p);
        setStats(vendorService.getStats(user.id));
        setMyServices(individualServicesService.getByVendor(user.id));
    };

    useEffect(() => { load(); }, []);

    useEffect(() => {
        gsap.fromTo(headerRef.current, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
        gsap.fromTo(contentRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'power3.out' });
    }, []);

    const openCreate = () => {
        setFormData({ ...emptyForm, company: user.companyName || '' });
        setEditingId(null); setShowForm(true);
    };

    const openEdit = (p) => {
        setFormData({
            name: p.name, company: p.company || '', image: p.image, duration: p.duration, price: p.price,
            originalPrice: p.originalPrice || '', discount: p.discount || '', groupSize: p.groupSize,
            difficulty: p.difficulty, category: p.category, description: p.description,
            highlights: p.highlights?.length > 0 ? [...p.highlights] : [''],
            included: p.included?.length > 0 ? [...p.included] : [''],
        });
        setEditingId(p.id); setShowForm(true);
    };

    const closeForm = () => { setShowForm(false); setEditingId(null); setFormData(emptyForm); };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            ...formData,
            price: Number(formData.price),
            originalPrice: Number(formData.originalPrice) || Number(formData.price),
            discount: Number(formData.discount) || 0,
            highlights: formData.highlights.filter(h => h.trim()),
            included: formData.included.filter(h => h.trim()),
        };
        const result = editingId
            ? vendorService.update(editingId, data, user.id)
            : vendorService.submit(data, user);
        if (result.success) {
            setAlert({ type: 'success', message: editingId ? 'Program updated!' : 'Program submitted for approval!' });
            load(); closeForm();
        } else { setAlert({ type: 'error', message: result.error }); }
        setTimeout(() => setAlert(null), 3000);
    };

    const handleDelete = (id) => {
        const result = vendorService.delete(id, user.id);
        if (result.success) { setAlert({ type: 'success', message: 'Program deleted!' }); load(); }
        else { setAlert({ type: 'error', message: result.error }); }
        setDeleteConfirm(null); setTimeout(() => setAlert(null), 3000);
    };

    const updateList = (field, index, value) => {
        const arr = [...formData[field]]; arr[index] = value;
        setFormData({ ...formData, [field]: arr });
    };
    const addListItem = (field) => setFormData({ ...formData, [field]: [...formData[field], ''] });
    const removeListItem = (field, index) => {
        const arr = formData[field].filter((_, i) => i !== index);
        setFormData({ ...formData, [field]: arr.length > 0 ? arr : [''] });
    };

    const filteredPrograms = filter === 'all' ? programs : programs.filter(p => p.status === filter);
    const filteredServices = svcFilter === 'all' ? myServices : myServices.filter(s => s.status === svcFilter);

    // Service handlers
    const openCreateSvc = () => { setSvcFormData(emptySvcForm); setEditingSvcId(null); setShowSvcForm(true); };
    const closeSvcForm = () => { setShowSvcForm(false); setEditingSvcId(null); setSvcFormData(emptySvcForm); };
    const handleSvcSubmit = (e) => {
        e.preventDefault();
        const data = { ...svcFormData, price: Number(svcFormData.price) };
        const result = editingSvcId
            ? individualServicesService.update(editingSvcId, data, user.id)
            : individualServicesService.submit(data, user);
        if (result.success) { setAlert({ type: 'success', message: editingSvcId ? 'Service updated!' : 'Service submitted for approval!' }); load(); closeSvcForm(); }
        else { setAlert({ type: 'error', message: result.error }); }
        setTimeout(() => setAlert(null), 3000);
    };
    const handleDeleteSvc = (id) => {
        const result = individualServicesService.delete(id, user.id);
        if (result.success) { setAlert({ type: 'success', message: 'Service deleted!' }); load(); }
        setDeleteConfirm(null); setTimeout(() => setAlert(null), 3000);
    };
    const openEditSvc = (s) => {
        setSvcFormData({ name: s.name, category: s.category, image: s.image, duration: s.duration, price: s.price, location: s.location || '', capacity: s.capacity || '', description: s.description });
        setEditingSvcId(s.id); setShowSvcForm(true);
    };

    const statusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-500/10 text-yellow-400',
            approved: 'bg-green-500/10 text-green-400',
            rejected: 'bg-red-500/10 text-red-400',
        };
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
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-display font-bold text-white mb-2">
                                Vendor <span className="bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent">Dashboard</span>
                            </h1>
                            <p className="text-white/50">Manage your tour programs, services, and track performance</p>
                        </div>
                        <Button variant="primary" onClick={activeTab === 'programs' ? openCreate : openCreateSvc} className="flex items-center gap-2">
                            <Plus className="w-5 h-5" />{activeTab === 'programs' ? 'Submit Program' : 'Submit Service'}
                        </Button>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex gap-2 mb-6">
                        <button onClick={() => setActiveTab('programs')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === 'programs' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-dark-700/50 text-white/50 border border-white/5 hover:bg-white/5'}`}>
                            <Package className="w-4 h-4" />Programs ({programs.length})
                        </button>
                        <button onClick={() => setActiveTab('services')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === 'services' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-dark-700/50 text-white/50 border border-white/5 hover:bg-white/5'}`}>
                            <Car className="w-4 h-4" />Services ({myServices.length})
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        {[
                            { label: 'Total Programs', value: stats.total, icon: Package, color: 'primary' },
                            { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'green' },
                            { label: 'Pending', value: stats.pending, icon: Clock, color: 'yellow' },
                            { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'red' },
                            { label: 'Total Bookings', value: stats.totalBookings, icon: Users, color: 'secondary' },
                        ].map((s, i) => {
                            const Icon = s.icon;
                            return (
                                <Card key={i} className="text-center">
                                    <Icon className={`w-6 h-6 mx-auto mb-2 text-${s.color === 'primary' ? 'primary' : s.color === 'secondary' ? 'secondary' : s.color}-400`} />
                                    <p className="text-2xl font-bold text-white">{s.value}</p>
                                    <p className="text-xs text-white/40">{s.label}</p>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} className="mb-6" />}

                {/* Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 pb-8 px-4 overflow-y-auto">
                        <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={closeForm} />
                        <Card className="relative z-10 w-full max-w-3xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3"><Package className="w-6 h-6 text-primary-400" />{editingId ? 'Edit Program' : 'Submit New Program'}</h2>
                                <button onClick={closeForm} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><X className="w-5 h-5 text-white/60" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <Input label="Program Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Luxor Ancient Wonders - 3 Days" required />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Company Name" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} required />
                                    <Input label="Image URL" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} icon={Image} required />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <Input label="Duration" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g. 3 Days / 2 Nights" required />
                                    <Input label="Price ($)" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                                    <Input label="Discount (%)" type="number" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.value })} placeholder="0" />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <Input label="Group Size" value={formData.groupSize} onChange={(e) => setFormData({ ...formData, groupSize: e.target.value })} placeholder="Up to 15" required />
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-white/80">Difficulty</label>
                                        <select value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })} className="w-full px-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300">
                                            {['Easy', 'Moderate', 'Challenging'].map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-white/80">Category</label>
                                        <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300">
                                            {['Cultural', 'Adventure', 'Luxury', 'Family', 'Historical'].map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-white/80">Description</label>
                                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300" required />
                                </div>
                                {['highlights', 'included'].map(field => (
                                    <div key={field}>
                                        <label className="block text-sm font-medium mb-2 text-white/80 capitalize">{field}</label>
                                        <div className="space-y-2">
                                            {formData[field].map((item, i) => (
                                                <div key={i} className="flex gap-2">
                                                    <input type="text" value={item} onChange={(e) => updateList(field, i, e.target.value)} className="flex-1 px-4 py-2 bg-dark-700/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300" placeholder={`${field.slice(0, -1)} ${i + 1}`} />
                                                    {formData[field].length > 1 && <button type="button" onClick={() => removeListItem(field, i)} className="p-2 hover:bg-red-500/10 rounded-lg"><X className="w-4 h-4 text-red-400" /></button>}
                                                </div>
                                            ))}
                                        </div>
                                        <button type="button" onClick={() => addListItem(field)} className="mt-2 text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"><Plus className="w-4 h-4" />Add {field.slice(0, -1)}</button>
                                    </div>
                                ))}
                                <div className="flex gap-3 pt-4">
                                    <Button type="submit" variant="primary" className="flex items-center gap-2"><Save className="w-4 h-4" />{editingId ? 'Update' : 'Submit for Approval'}</Button>
                                    <Button type="button" variant="ghost" onClick={closeForm}>Cancel</Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                )}

                {/* Delete Confirm */}
                {deleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
                        <Card className="relative z-10 w-full max-w-md text-center">
                            <Trash2 className="w-12 h-12 text-red-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Delete Program?</h3>
                            <p className="text-white/50 mb-6">This action cannot be undone.</p>
                            <div className="flex gap-3 justify-center">
                                <Button variant="danger" onClick={() => {
                                    if (typeof deleteConfirm === 'string' && deleteConfirm.startsWith('svc-del-')) {
                                        handleDeleteSvc(deleteConfirm.replace('svc-del-', ''));
                                    } else {
                                        handleDelete(deleteConfirm);
                                    }
                                }}>Delete</Button>
                                <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Content */}
                <div ref={contentRef}>
                    {activeTab === 'programs' ? (
                        <>
                            <div className="flex gap-2 mb-6">
                                {['all', 'pending', 'approved', 'rejected'].map(f => (
                                    <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${filter === f ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-dark-700/50 text-white/50 border border-white/5 hover:bg-white/5'}`}>
                                        {f.charAt(0).toUpperCase() + f.slice(1)} {f === 'all' ? `(${programs.length})` : `(${programs.filter(p => p.status === f).length})`}
                                    </button>
                                ))}
                            </div>
                            <Card>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead><tr className="border-b border-white/10">
                                            <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Program</th>
                                            <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Price</th>
                                            <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Status</th>
                                            <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Bookings</th>
                                            <th className="text-right py-4 px-4 text-white/60 font-medium text-sm">Actions</th>
                                        </tr></thead>
                                        <tbody>
                                            {filteredPrograms.map((p) => (
                                                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="py-4 px-4"><div className="flex items-center gap-3"><img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover" /><div><p className="font-semibold text-white text-sm">{p.name}</p><p className="text-xs text-white/40">{p.duration}</p></div></div></td>
                                                    <td className="py-4 px-4 text-white/80">${p.price}</td>
                                                    <td className="py-4 px-4">{statusBadge(p.status)}</td>
                                                    <td className="py-4 px-4 text-white/80">{p.bookings || 0}</td>
                                                    <td className="py-4 px-4"><div className="flex items-center justify-end gap-2"><button onClick={() => openEdit(p)} className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4 text-primary-400" /></button><button onClick={() => setDeleteConfirm(p.id)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-red-400" /></button></div></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {filteredPrograms.length === 0 && <div className="text-center py-12"><Package className="w-12 h-12 text-white/10 mx-auto mb-3" /><p className="text-white/40">{filter === 'all' ? 'No programs yet.' : `No ${filter} programs.`}</p></div>}
                                </div>
                            </Card>
                        </>
                    ) : (
                        <>
                            {/* Services Tab */}
                            <div className="flex gap-2 mb-6">
                                {['all', 'pending', 'approved', 'rejected'].map(f => (
                                    <button key={f} onClick={() => setSvcFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${svcFilter === f ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-dark-700/50 text-white/50 border border-white/5 hover:bg-white/5'}`}>
                                        {f.charAt(0).toUpperCase() + f.slice(1)} ({f === 'all' ? myServices.length : myServices.filter(s => s.status === f).length})
                                    </button>
                                ))}
                            </div>
                            <Card>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead><tr className="border-b border-white/10">
                                            <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Service</th>
                                            <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Category</th>
                                            <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Price</th>
                                            <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Status</th>
                                            <th className="text-right py-4 px-4 text-white/60 font-medium text-sm">Actions</th>
                                        </tr></thead>
                                        <tbody>
                                            {filteredServices.map((s) => {
                                                const CatIcon = SERVICE_CATEGORY_ICONS[s.category] || Package;
                                                return (
                                                    <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                        <td className="py-4 px-4"><div className="flex items-center gap-3"><img src={s.image} alt={s.name} className="w-12 h-12 rounded-lg object-cover" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=100'; }} /><div><p className="font-semibold text-white text-sm">{s.name}</p><p className="text-xs text-white/40">{s.duration}</p></div></div></td>
                                                        <td className="py-4 px-4"><span className="flex items-center gap-1 text-sm text-white/70"><CatIcon className="w-4 h-4" />{individualServicesService.getCategories().find(c => c.id === s.category)?.label}</span></td>
                                                        <td className="py-4 px-4 text-white/80">${s.price}</td>
                                                        <td className="py-4 px-4">{statusBadge(s.status)}</td>
                                                        <td className="py-4 px-4"><div className="flex items-center justify-end gap-2"><button onClick={() => openEditSvc(s)} className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4 text-primary-400" /></button><button onClick={() => setDeleteConfirm(`svc-del-${s.id}`)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-red-400" /></button></div></td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                    {filteredServices.length === 0 && <div className="text-center py-12"><Car className="w-12 h-12 text-white/10 mx-auto mb-3" /><p className="text-white/40">{svcFilter === 'all' ? 'No services yet.' : `No ${svcFilter} services.`}</p></div>}
                                </div>
                            </Card>
                        </>
                    )}
                </div>

                {/* Service Form Modal */}
                {showSvcForm && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 pb-8 px-4 overflow-y-auto">
                        <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={closeSvcForm} />
                        <Card className="relative z-10 w-full max-w-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3"><Car className="w-6 h-6 text-blue-400" />{editingSvcId ? 'Edit Service' : 'Submit New Service'}</h2>
                                <button onClick={closeSvcForm} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5 text-white/60" /></button>
                            </div>
                            <form onSubmit={handleSvcSubmit} className="space-y-5">
                                <Input label="Service Name" value={svcFormData.name} onChange={(e) => setSvcFormData({ ...svcFormData, name: e.target.value })} placeholder="e.g. Luxor Sedan - Full Day" required />
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-white/80">Category</label>
                                        <select value={svcFormData.category} onChange={(e) => setSvcFormData({ ...svcFormData, category: e.target.value })} className="w-full px-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300">
                                            {individualServicesService.getCategories().map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                        </select>
                                    </div>
                                    <Input label="Image URL" value={svcFormData.image} onChange={(e) => setSvcFormData({ ...svcFormData, image: e.target.value })} icon={Image} required />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <Input label="Duration" value={svcFormData.duration} onChange={(e) => setSvcFormData({ ...svcFormData, duration: e.target.value })} placeholder="e.g. 4 hours" required />
                                    <Input label="Price ($)" type="number" value={svcFormData.price} onChange={(e) => setSvcFormData({ ...svcFormData, price: e.target.value })} required />
                                    <Input label="Capacity" value={svcFormData.capacity} onChange={(e) => setSvcFormData({ ...svcFormData, capacity: e.target.value })} placeholder="e.g. 4 passengers" required />
                                </div>
                                <Input label="Location" value={svcFormData.location} onChange={(e) => setSvcFormData({ ...svcFormData, location: e.target.value })} placeholder="e.g. West Bank, Luxor" required />
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-white/80">Description</label>
                                    <textarea value={svcFormData.description} onChange={(e) => setSvcFormData({ ...svcFormData, description: e.target.value })} rows={3} className="w-full px-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300" required />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button type="submit" variant="primary" className="flex items-center gap-2"><Save className="w-4 h-4" />{editingSvcId ? 'Update' : 'Submit for Approval'}</Button>
                                    <Button type="button" variant="ghost" onClick={closeSvcForm}>Cancel</Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorDashboard;
