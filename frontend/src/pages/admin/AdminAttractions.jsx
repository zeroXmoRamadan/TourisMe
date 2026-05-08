import React, { useEffect, useState } from 'react';
import { Edit2, Landmark, Plus, Trash2, X } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import adminService from '../../services/adminService';

const emptyForm = {
    name: '',
    description: '',
    category: '',
    ticketPrice: '',
    openingHours: '',
    lng: '',
    lat: '',
    imageFiles: null,
};

const AdminAttractions = () => {
    const [attractions, setAttractions] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(emptyForm);
    const [editing, setEditing] = useState(null);
    const [alert, setAlert] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const loadAttractions = async () => {
        const result = await adminService.getAttractions({ limit: 100, sort: '-createdAt' });
        if (result.success) {
            setAttractions(result.attractions || []);
        } else {
            setAlert({ type: 'error', message: result.error });
        }
    };

    useEffect(() => {
        loadAttractions();
    }, []);

    const openCreate = () => {
        setEditing(null);
        setFormData(emptyForm);
        setShowForm(true);
    };

    const openEdit = (attraction) => {
        setEditing(attraction);
        setFormData({
            name: attraction.name || '',
            description: attraction.description || '',
            category: attraction.category || '',
            ticketPrice: attraction.ticketPrice ?? '',
            openingHours: attraction.openingHours || '',
            lng: attraction.location?.coordinates?.[0] ?? '',
            lat: attraction.location?.coordinates?.[1] ?? '',
            imageFiles: null,
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('category', formData.category);
        data.append('ticketPrice', Number(formData.ticketPrice));
        data.append('openingHours', formData.openingHours);
        data.append('lng', Number(formData.lng));
        data.append('lat', Number(formData.lat));

        if (formData.imageFiles) {
            Array.from(formData.imageFiles).forEach((file) => {
                data.append('images', file);
            });
        }

        const result = editing
            ? await adminService.updateAttraction(editing._id, data)
            : await adminService.createAttraction(data);

        if (result.success) {
            setAlert({ type: 'success', message: editing ? 'Attraction updated.' : 'Attraction created.' });
            setShowForm(false);
            setEditing(null);
            setFormData(emptyForm);
            loadAttractions();
        } else {
            setAlert({ type: 'error', message: result.error });
        }
        setSubmitting(false);
    };

    const handleDelete = async () => {
        const result = await adminService.deleteAttraction(deleteTarget._id);
        if (result.success) {
            setAlert({ type: 'success', message: 'Attraction deleted.' });
            setDeleteTarget(null);
            loadAttractions();
        } else {
            setAlert({ type: 'error', message: result.error });
        }
    };

    return (
        <div className="min-h-screen bg-dark-900 pt-24 pb-16">
            <div className="container-custom max-w-6xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-display font-bold text-white mb-2">
                            Global <span className="bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent">Attractions Database</span>
                        </h1>
                        <p className="text-white/50">Create, update, and remove attractions used by trip planning.</p>
                    </div>
                    <Button variant="primary" onClick={openCreate} className="flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        New Attraction
                    </Button>
                </div>

                {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} className="mb-6" />}

                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-4 px-4 text-white/60 text-sm">Attraction</th>
                                    <th className="text-left py-4 px-4 text-white/60 text-sm">Category</th>
                                    <th className="text-left py-4 px-4 text-white/60 text-sm">Ticket Price</th>
                                    <th className="text-right py-4 px-4 text-white/60 text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attractions.map((a) => (
                                    <tr key={a._id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-dark-700 flex-shrink-0 overflow-hidden border border-white/5">
                                                    {a.images?.[0] ? (
                                                        <img src={a.images[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Landmark className="w-5 h-5 text-white/20" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{a.name}</p>
                                                    <p className="text-white/40 text-xs line-clamp-1">{a.description || 'No description'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-white/70">{a.category || 'Uncategorized'}</td>
                                        <td className="py-4 px-4 text-white/70">${Number(a.ticketPrice || 0).toLocaleString()}</td>
                                        <td className="py-4 px-4">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openEdit(a)} className="p-2 rounded-lg hover:bg-primary-500/15">
                                                    <Edit2 className="w-4 h-4 text-primary-400" />
                                                </button>
                                                <button onClick={() => setDeleteTarget(a)} className="p-2 rounded-lg hover:bg-red-500/15">
                                                    <Trash2 className="w-4 h-4 text-red-400" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {attractions.length === 0 && (
                        <div className="text-center py-12">
                            <Landmark className="w-10 h-10 text-white/20 mx-auto mb-3" />
                            <p className="text-white/40">No attractions found.</p>
                        </div>
                    )}
                </Card>

                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={() => setShowForm(false)} />
                        <Card className="relative z-10 w-full max-w-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-white">{editing ? 'Update Attraction' : 'Create Attraction'}</h3>
                                <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-white/60" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Name" className="w-full px-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white" required />
                                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description" rows={3} className="w-full px-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white" />
                                <div className="grid grid-cols-2 gap-3">
                                    <input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Category" className="w-full px-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white" />
                                    <input type="number" value={formData.ticketPrice} onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })} placeholder="Ticket Price" className="w-full px-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white" />
                                </div>
                                <input value={formData.openingHours} onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })} placeholder="Opening Hours" className="w-full px-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white" />
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="number" step="any" value={formData.lng} onChange={(e) => setFormData({ ...formData, lng: e.target.value })} placeholder="Longitude" className="w-full px-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white" required />
                                    <input type="number" step="any" value={formData.lat} onChange={(e) => setFormData({ ...formData, lat: e.target.value })} placeholder="Latitude" className="w-full px-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white" required />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="block text-sm text-white/60 ml-1">Images</label>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => setFormData({ ...formData, imageFiles: e.target.files })}
                                            className="hidden"
                                            id="attraction-images"
                                        />
                                        <label
                                            htmlFor="attraction-images"
                                            className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-dark-700/50 border-2 border-white/10 border-dashed rounded-xl appearance-none cursor-pointer hover:border-primary-500/50 focus:outline-none"
                                        >
                                            <div className="flex flex-center gap-2 text-white/40 group-hover:text-primary-400 transition-colors">
                                                <Plus className="w-5 h-5" />
                                                <span className="font-medium">
                                                    {formData.imageFiles ? `${formData.imageFiles.length} images selected` : 'Click to upload images'}
                                                </span>
                                            </div>
                                        </label>
                                    </div>
                                    {editing?.images?.length > 0 && (
                                        <div className="flex gap-2 overflow-x-auto py-2">
                                            {editing.images.map((img, i) => (
                                                <img key={i} src={img} alt="" className="w-16 h-16 rounded-lg object-cover border border-white/10" />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button type="submit" variant="primary" loading={submitting}>{editing ? 'Save Changes' : 'Create'}</Button>
                                    <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                )}

                {deleteTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
                        <Card className="relative z-10 w-full max-w-md">
                            <h3 className="text-xl font-bold text-white mb-2">Delete attraction?</h3>
                            <p className="text-white/50 mb-6">{deleteTarget.name} will be permanently removed.</p>
                            <div className="flex gap-3">
                                <Button variant="danger" onClick={handleDelete}>Delete</Button>
                                <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAttractions;
