import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Plus, Edit2, Trash2, Landmark, X, Save, Image } from 'lucide-react';
import attractionsService from '../../services/attractionsService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';

const emptyForm = {
    name: '', shortDescription: '', description: '', image: '',
    location: '', category: '', openingHours: '', entryFee: '', highlights: [''],
};

const AdminAttractions = () => {
    const [attractions, setAttractions] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [alert, setAlert] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const headerRef = useRef(null);
    const contentRef = useRef(null);

    const loadAttractions = () => setAttractions(attractionsService.getAll());
    useEffect(() => { loadAttractions(); }, []);

    useEffect(() => {
        gsap.fromTo(headerRef.current, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
        gsap.fromTo(contentRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'power3.out' });
    }, []);

    const openCreate = () => { setFormData(emptyForm); setEditingId(null); setShowForm(true); };

    const openEdit = (a) => {
        setFormData({ name: a.name, shortDescription: a.shortDescription || '', description: a.description, image: a.image, location: a.location, category: a.category, openingHours: a.openingHours, entryFee: a.entryFee, highlights: a.highlights?.length > 0 ? [...a.highlights] : [''] });
        setEditingId(a.id); setShowForm(true);
    };

    const closeForm = () => { setShowForm(false); setEditingId(null); setFormData(emptyForm); };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = { ...formData, highlights: formData.highlights.filter(h => h.trim()) };
        const result = editingId ? attractionsService.update(editingId, data) : attractionsService.create(data);
        if (result.success) { setAlert({ type: 'success', message: editingId ? 'Attraction updated!' : 'Attraction created!' }); loadAttractions(); closeForm(); }
        else { setAlert({ type: 'error', message: result.error }); }
        setTimeout(() => setAlert(null), 3000);
    };

    const handleDelete = (id) => {
        const result = attractionsService.delete(id);
        if (result.success) { setAlert({ type: 'success', message: 'Attraction deleted!' }); loadAttractions(); }
        else { setAlert({ type: 'error', message: result.error }); }
        setDeleteConfirm(null); setTimeout(() => setAlert(null), 3000);
    };

    const updateHighlight = (i, v) => { const h = [...formData.highlights]; h[i] = v; setFormData({ ...formData, highlights: h }); };
    const addHighlight = () => setFormData({ ...formData, highlights: [...formData.highlights, ''] });
    const removeHighlight = (i) => { const h = formData.highlights.filter((_, idx) => idx !== i); setFormData({ ...formData, highlights: h.length > 0 ? h : [''] }); };

    return (
        <div className="min-h-screen bg-dark-900 pt-20 pb-12">
            <div className="container-custom max-w-6xl">
                <div ref={headerRef} className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-display font-bold text-white mb-2">
                            Manage <span className="bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent">Attractions</span>
                        </h1>
                        <p className="text-white/50">Create, edit, and manage Luxor attractions</p>
                    </div>
                    <Button variant="primary" onClick={openCreate} className="flex items-center gap-2"><Plus className="w-5 h-5" />Add Attraction</Button>
                </div>

                {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} className="mb-6" />}

                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 pb-8 px-4 overflow-y-auto">
                        <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={closeForm} />
                        <Card className="relative z-10 w-full max-w-3xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3"><Landmark className="w-6 h-6 text-primary-400" />{editingId ? 'Edit Attraction' : 'New Attraction'}</h2>
                                <button onClick={closeForm} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><X className="w-5 h-5 text-white/60" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                                <Input label="Short Description" value={formData.shortDescription} onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })} required />
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-white/80">Full Description</label>
                                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} className="w-full px-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300" required />
                                </div>
                                <Input label="Image URL" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} icon={Image} required />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
                                    <Input label="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Temple, Tomb" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Opening Hours" value={formData.openingHours} onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })} required />
                                    <Input label="Entry Fee" value={formData.entryFee} onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })} placeholder="e.g. 150 EGP" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-white/80">Highlights</label>
                                    <div className="space-y-2">
                                        {formData.highlights.map((h, i) => (
                                            <div key={i} className="flex gap-2">
                                                <input type="text" value={h} onChange={(e) => updateHighlight(i, e.target.value)} className="flex-1 px-4 py-2 bg-dark-700/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300" placeholder={`Highlight ${i + 1}`} />
                                                {formData.highlights.length > 1 && <button type="button" onClick={() => removeHighlight(i)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"><X className="w-4 h-4 text-red-400" /></button>}
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" onClick={addHighlight} className="mt-2 text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"><Plus className="w-4 h-4" />Add Highlight</button>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button type="submit" variant="primary" className="flex items-center gap-2"><Save className="w-4 h-4" />{editingId ? 'Update' : 'Create'}</Button>
                                    <Button type="button" variant="ghost" onClick={closeForm}>Cancel</Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                )}

                {deleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
                        <Card className="relative z-10 w-full max-w-md text-center">
                            <Trash2 className="w-12 h-12 text-red-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Delete Attraction?</h3>
                            <p className="text-white/50 mb-6">This action cannot be undone.</p>
                            <div className="flex gap-3 justify-center">
                                <Button variant="danger" onClick={() => handleDelete(deleteConfirm)}>Delete</Button>
                                <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                            </div>
                        </Card>
                    </div>
                )}

                <div ref={contentRef}>
                    <Card>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Attraction</th>
                                        <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Category</th>
                                        <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Location</th>
                                        <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Rating</th>
                                        <th className="text-right py-4 px-4 text-white/60 font-medium text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attractions.map((a) => (
                                        <tr key={a.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={a.image} alt={a.name} className="w-12 h-12 rounded-lg object-cover" />
                                                    <div><p className="font-semibold text-white">{a.name}</p><p className="text-xs text-white/40 line-clamp-1">{a.shortDescription}</p></div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4"><span className="px-3 py-1 bg-primary-500/10 text-primary-400 rounded-full text-xs font-medium">{a.category}</span></td>
                                            <td className="py-4 px-4 text-white/60 text-sm">{a.location}</td>
                                            <td className="py-4 px-4 text-white/80">{a.rating}</td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => openEdit(a)} className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors" title="Edit"><Edit2 className="w-4 h-4 text-primary-400" /></button>
                                                    <button onClick={() => setDeleteConfirm(a.id)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4 text-red-400" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {attractions.length === 0 && (
                                <div className="text-center py-12"><Landmark className="w-12 h-12 text-white/10 mx-auto mb-3" /><p className="text-white/40">No attractions yet. Create your first one!</p></div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminAttractions;
