import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Plus, Edit2, Trash2, Package, X, Save, BarChart3, Users, Car, Bike, UtensilsCrossed, Landmark, Loader2, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import vendorService from '../../services/vendorService';
import individualServicesService from '../../services/individualServicesService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';

const SERVICE_CATEGORY_ICONS = { car_rental: Car, bicycle_rental: Bike, restaurant: UtensilsCrossed, temple_visit: Landmark };

const emptyForm = {
    name: '', description: '', price: '', durationDays: '', itinerary: '', includedItems: [''], imageFile: null
};

const emptySvcForm = {
    name: '', category: 'Rental', price: '', description: '',
    vehicleType: '', capacity: '', conditions: '',
    cuisineType: '', tableCapacity: '', imageFile: null
};

const VendorDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('programs');
    const [programs, setPrograms] = useState([]);
    const [stats, setStats] = useState({ total: 0, totalBookings: 0 });
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
    const [submitting, setSubmitting] = useState(false);
    const headerRef = useRef(null);
    const contentRef = useRef(null);

    const load = async () => {
        const p = await vendorService.getByVendor();
        setPrograms(p);
        setStats(vendorService.getStats(p));
        const s = await individualServicesService.getByVendor();
        setMyServices(s);
    };

    useEffect(() => { load(); }, []);

    useEffect(() => {
        gsap.fromTo(headerRef.current, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
        gsap.fromTo(contentRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'power3.out' });
    }, []);

    const openCreate = () => {
        setFormData(emptyForm);
        setEditingId(null); setShowForm(true);
    };

    const openEdit = (p) => {
        setFormData({
            name: p.name, durationDays: p.durationDays || '', price: p.price,
            itinerary: p.itinerary || '', description: p.description || '',
            includedItems: p.includedItems?.length > 0 ? [...p.includedItems] : [''],
            imageFile: null
        });
        setEditingId(p._id); setShowForm(true);
    };

    const closeForm = () => { setShowForm(false); setEditingId(null); setFormData(emptyForm); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        const data = new FormData();
        data.append('serviceType', 'TourPackage');
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('price', Number(formData.price));
        data.append('durationDays', Number(formData.durationDays));
        data.append('itinerary', formData.itinerary);
        
        const included = formData.includedItems.filter(h => h.trim());
        included.forEach((item, index) => {
            data.append(`includedItems[${index}]`, item);
        });

        if (formData.imageFile) {
            Array.from(formData.imageFile).forEach(file => {
                data.append('images', file);
            });
        }

        const result = editingId
            ? await vendorService.update(editingId, data)
            : await vendorService.submit(data);

        if (result.success) {
            setAlert({ type: 'success', message: editingId ? 'Program updated!' : 'Program submitted successfully!' });
            load(); closeForm();
        } else { setAlert({ type: 'error', message: result.error }); }
        setSubmitting(false);
        setTimeout(() => setAlert(null), 3000);
    };

    const handleDelete = async (id) => {
        const result = await vendorService.delete(id);
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

    const filteredPrograms = programs;
    const filteredServices = myServices;

    // Service handlers
    const openCreateSvc = () => { setSvcFormData(emptySvcForm); setEditingSvcId(null); setShowSvcForm(true); };
    const closeSvcForm = () => { setShowSvcForm(false); setEditingSvcId(null); setSvcFormData(emptySvcForm); };

    const handleSvcSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        const data = new FormData();
        data.append('serviceType', svcFormData.category);
        data.append('name', svcFormData.name);
        data.append('description', svcFormData.description);
        data.append('price', Number(svcFormData.price));

        if (svcFormData.category === 'Rental') {
            data.append('vehicleType', svcFormData.vehicleType);
            data.append('capacity', Number(svcFormData.capacity));
            data.append('conditions', svcFormData.conditions);
        } else if (svcFormData.category === 'Restaurant') {
            data.append('cuisineType', svcFormData.cuisineType);
            data.append('tableCapacity', Number(svcFormData.tableCapacity));
        }

        if (svcFormData.imageFile) {
            Array.from(svcFormData.imageFile).forEach(file => {
                data.append('images', file);
            });
        }

        const result = editingSvcId
            ? await individualServicesService.update(editingSvcId, data)
            : await individualServicesService.submit(data);

        if (result.success) { 
            setAlert({ type: 'success', message: editingSvcId ? 'Service updated!' : 'Service submitted successfully!' }); 
            load(); closeSvcForm(); 
        } else { setAlert({ type: 'error', message: result.error }); }
        setSubmitting(false);
        setTimeout(() => setAlert(null), 3000);
    };

    const handleDeleteSvc = async (id) => {
        const result = await individualServicesService.delete(id);
        if (result.success) { setAlert({ type: 'success', message: 'Service deleted!' }); load(); }
        setDeleteConfirm(null); setTimeout(() => setAlert(null), 3000);
    };

    const openEditSvc = (s) => {
        setSvcFormData({ 
            name: s.name, category: s.serviceType, price: s.price, description: s.description || '', 
            vehicleType: s.vehicleType || '', capacity: s.capacity || '', conditions: s.conditions || '',
            cuisineType: s.cuisineType || '', tableCapacity: s.tableCapacity || '',
            imageFile: null 
        });
        setEditingSvcId(s._id); setShowSvcForm(true);
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
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {[
                            { 
                                label: activeTab === 'programs' ? 'Total Programs' : 'Total Services', 
                                value: (activeTab === 'programs' ? programs : myServices).length, 
                                icon: Package, 
                                color: 'primary' 
                            },
                            { 
                                label: 'Total Bookings', 
                                value: (activeTab === 'programs' ? programs : myServices).reduce((sum, item) => sum + (item.bookings || 0), 0), 
                                icon: Users, 
                                color: 'secondary' 
                            },
                        ].map((s, i) => {
                            const Icon = s.icon;
                            return (
                                <Card key={i} className="text-center">
                                    <Icon className={`w-6 h-6 mx-auto mb-2 text-${s.color === 'primary' ? 'primary' : 'secondary'}-400`} />
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
                                    <Input label="Price ($)" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                                    <Input label="Duration (Days)" type="number" value={formData.durationDays} onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-white/80">Description</label>
                                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-white/80">Itinerary</label>
                                    <textarea value={formData.itinerary} onChange={(e) => setFormData({ ...formData, itinerary: e.target.value })} rows={3} className="w-full px-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300" placeholder="e.g. Day 1: Arrival..." required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-white/80">Upload Images <span className="text-white/30 font-normal">(max 10MB each)</span></label>
                                    <input type="file" multiple accept="image/*" onChange={(e) => {
                                        const files = Array.from(e.target.files);
                                        const oversized = files.find(f => f.size > 10 * 1024 * 1024);
                                        if (oversized) {
                                            setAlert({ type: 'error', message: `"${oversized.name}" exceeds the 10MB limit. Please choose a smaller image.` });
                                            e.target.value = '';
                                            return;
                                        }
                                        setFormData({ ...formData, imageFile: e.target.files });
                                    }} className="w-full px-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300" />
                                </div>
                                {['includedItems'].map(field => (
                                    <div key={field}>
                                        <label className="block text-sm font-medium mb-2 text-white/80 capitalize">Included Items</label>
                                        <div className="space-y-2">
                                            {formData[field].map((item, i) => (
                                                <div key={i} className="flex gap-2">
                                                    <input type="text" value={item} onChange={(e) => updateList(field, i, e.target.value)} className="flex-1 px-4 py-2 bg-dark-700/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300" placeholder={`Item ${i + 1}`} />
                                                    {formData[field].length > 1 && <button type="button" onClick={() => removeListItem(field, i)} className="p-2 hover:bg-red-500/10 rounded-lg"><X className="w-4 h-4 text-red-400" /></button>}
                                                </div>
                                            ))}
                                        </div>
                                        <button type="button" onClick={() => addListItem(field)} className="mt-2 text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"><Plus className="w-4 h-4" />Add Item</button>
                                    </div>
                                ))}
                                <div className="flex gap-3 pt-4">
                                    <Button type="submit" variant="primary" disabled={submitting} className="flex items-center gap-2">
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        {submitting ? 'Saving...' : editingId ? 'Update' : 'Save'}
                                    </Button>
                                    <Button type="button" variant="ghost" onClick={closeForm} disabled={submitting}>Cancel</Button>
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
                            <Card>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead><tr className="border-b border-white/10">
                                            <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Program</th>
                                            <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Price</th>
                                            <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Bookings</th>
                                            <th className="text-right py-4 px-4 text-white/60 font-medium text-sm">Actions</th>
                                        </tr></thead>
                                        <tbody>
                                            {filteredPrograms.map((p) => (
                                                <tr key={p._id || p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="py-4 px-4"><div className="flex items-center gap-3"><img src={p.images && p.images.length > 0 ? p.images[0] : 'https://images.unsplash.com/photo-1549317661-bd32c8ce0e6e?w=100'} alt={p.name} className="w-12 h-12 rounded-lg object-cover" /><div><p className="font-semibold text-white text-sm">{p.name}</p><p className="text-xs text-white/40">{p.durationDays} Days</p></div></div></td>
                                                    <td className="py-4 px-4 text-white/80">${p.price}</td>
                                                    <td className="py-4 px-4 text-white/80">{p.bookings || 0}</td>
                                                    <td className="py-4 px-4"><div className="flex items-center justify-end gap-2"><button onClick={() => navigate(`/vendor/service/${p._id || p.id}`)} className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors"><Eye className="w-4 h-4 text-blue-400" /></button><button onClick={() => openEdit(p)} className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4 text-primary-400" /></button><button onClick={() => setDeleteConfirm(p._id || p.id)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-red-400" /></button></div></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {filteredPrograms.length === 0 && <div className="text-center py-12"><Package className="w-12 h-12 text-white/10 mx-auto mb-3" /><p className="text-white/40">No programs yet.</p></div>}
                                </div>
                            </Card>
                        </>
                    ) : (
                        <>
                            {/* Services Tab */}
                            <Card>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead><tr className="border-b border-white/10">
                                            <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Service</th>
                                            <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Category</th>
                                            <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Price</th>
                                            <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Bookings</th>
                                            <th className="text-right py-4 px-4 text-white/60 font-medium text-sm">Actions</th>
                                        </tr></thead>
                                        <tbody>
                                            {filteredServices.map((s) => {
                                                const CatIcon = SERVICE_CATEGORY_ICONS[s.serviceType] || Package;
                                                return (
                                                    <tr key={s._id || s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                        <td className="py-4 px-4"><div className="flex items-center gap-3"><img src={s.images && s.images.length > 0 ? s.images[0] : 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=100'} alt={s.name} className="w-12 h-12 rounded-lg object-cover" /><div><p className="font-semibold text-white text-sm">{s.name}</p></div></div></td>
                                                        <td className="py-4 px-4"><span className="flex items-center gap-1 text-sm text-white/70"><CatIcon className="w-4 h-4" />{individualServicesService.getCategories().find(c => c.id === s.serviceType)?.label || s.serviceType}</span></td>
                                                        <td className="py-4 px-4 text-white/80">${s.price}</td>
                                                        <td className="py-4 px-4 text-white/80">{s.bookings || 0}</td>
                                                        <td className="py-4 px-4"><div className="flex items-center justify-end gap-2"><button onClick={() => navigate(`/vendor/service/${s._id || s.id}`)} className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors"><Eye className="w-4 h-4 text-blue-400" /></button><button onClick={() => openEditSvc(s)} className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4 text-primary-400" /></button><button onClick={() => setDeleteConfirm(`svc-del-${s._id || s.id}`)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-red-400" /></button></div></td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                    {filteredServices.length === 0 && <div className="text-center py-12"><Car className="w-12 h-12 text-white/10 mx-auto mb-3" /><p className="text-white/40">No services yet.</p></div>}
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
                                    <Input label="Price ($)" type="number" value={svcFormData.price} onChange={(e) => setSvcFormData({ ...svcFormData, price: e.target.value })} required />
                                </div>

                                {svcFormData.category === 'Rental' && (
                                    <div className="grid grid-cols-3 gap-4">
                                        <Input label="Vehicle Type" value={svcFormData.vehicleType} onChange={(e) => setSvcFormData({ ...svcFormData, vehicleType: e.target.value })} placeholder="e.g. Sedan" required />
                                        <Input label="Capacity" type="number" value={svcFormData.capacity} onChange={(e) => setSvcFormData({ ...svcFormData, capacity: e.target.value })} placeholder="e.g. 4" required />
                                        <Input label="Conditions" value={svcFormData.conditions} onChange={(e) => setSvcFormData({ ...svcFormData, conditions: e.target.value })} placeholder="e.g. With Driver" required />
                                    </div>
                                )}
                                {svcFormData.category === 'Restaurant' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label="Cuisine Type" value={svcFormData.cuisineType} onChange={(e) => setSvcFormData({ ...svcFormData, cuisineType: e.target.value })} placeholder="e.g. Egyptian" required />
                                        <Input label="Table Capacity" type="number" value={svcFormData.tableCapacity} onChange={(e) => setSvcFormData({ ...svcFormData, tableCapacity: e.target.value })} placeholder="e.g. 50" required />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-white/80">Upload Images <span className="text-white/30 font-normal">(max 10MB each)</span></label>
                                    <input type="file" multiple accept="image/*" onChange={(e) => {
                                        const files = Array.from(e.target.files);
                                        const oversized = files.find(f => f.size > 10 * 1024 * 1024);
                                        if (oversized) {
                                            setAlert({ type: 'error', message: `"${oversized.name}" exceeds the 10MB limit. Please choose a smaller image.` });
                                            e.target.value = '';
                                            return;
                                        }
                                        setSvcFormData({ ...svcFormData, imageFile: e.target.files });
                                    }} className="w-full px-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-white/80">Description</label>
                                    <textarea value={svcFormData.description} onChange={(e) => setSvcFormData({ ...svcFormData, description: e.target.value })} rows={3} className="w-full px-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300" required />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button type="submit" variant="primary" disabled={submitting} className="flex items-center gap-2">
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        {submitting ? 'Saving...' : editingSvcId ? 'Update' : 'Save'}
                                    </Button>
                                    <Button type="button" variant="ghost" onClick={closeSvcForm} disabled={submitting}>Cancel</Button>
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
