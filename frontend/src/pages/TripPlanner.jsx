import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Plus, Trash2, Edit2, MapPin, Calendar, X, Save, Car, Bike, UtensilsCrossed, Landmark, DollarSign, Clock, CheckCircle, XCircle, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import tripPlannerService from '../services/tripPlannerService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Alert from '../components/common/Alert';

const categoryIcons = { car_rental: Car, bicycle_rental: Bike, restaurant: UtensilsCrossed, temple_visit: Landmark };
const statusStyles = {
    Draft: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Draft' },
    Confirmed: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Confirmed' },
    Completed: { bg: 'bg-purple-500/10', text: 'text-purple-400', label: 'Completed' },
};

const TripPlanner = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [trips, setTrips] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingTrip, setEditingTrip] = useState(null);
    const [newTripName, setNewTripName] = useState('');
    const [newTripDate, setNewTripDate] = useState('');
    const [newTripNotes, setNewTripNotes] = useState('');
    const [alert, setAlert] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [expandedTrip, setExpandedTrip] = useState(null);
    const headerRef = useRef(null);
    const contentRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        const data = await tripPlannerService.getByUser(user._id);
        setTrips(data);
        setLoading(false);
    };
    useEffect(() => { load(); }, []);

    useEffect(() => {
        if (headerRef.current) gsap.fromTo(headerRef.current, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
        if (contentRef.current) gsap.fromTo(contentRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'power3.out' });
    }, [loading]);

    const flash = (type, message) => { setAlert({ type, message }); setTimeout(() => setAlert(null), 3000); };

    const handleCreate = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        const result = await tripPlannerService.create(user._id, `${user.firstName} ${user.lastName}`, {
            name: newTripName || 'My Luxor Trip', date: newTripDate, notes: newTripNotes
        });
        setActionLoading(false);
        if (result.success) { flash('success', 'Trip created!'); await load(); setShowCreateForm(false); setNewTripName(''); setNewTripDate(''); setNewTripNotes(''); }
        else flash('error', result.error);
    };

    const handleUpdateStatus = async (tripId, status) => {
        const result = await tripPlannerService.updateStatus(tripId, user._id, status);
        if (result.success) { flash('success', `Trip ${status}!`); await load(); }
    };

    const handleRemoveItem = async (tripId, itemId) => {
        const result = await tripPlannerService.removeItem(tripId, user._id, itemId);
        if (result.success) { flash('success', 'Item removed'); await load(); }
    };

    const handleDelete = async (tripId) => {
        const result = await tripPlannerService.delete(tripId, user._id);
        if (result.success) { flash('success', 'Trip deleted'); await load(); }
        setDeleteConfirm(null);
    };

    const handleUpdateTrip = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        const result = await tripPlannerService.update(editingTrip.id, user._id, {
            title: newTripName, startDate: newTripDate, notes: newTripNotes
        });
        setActionLoading(false);
        if (result.success) { flash('success', 'Trip updated!'); await load(); setEditingTrip(null); }
    };

    const openEdit = (trip) => {
        setNewTripName(trip.name); setNewTripDate(trip.date || ''); setNewTripNotes(trip.notes || '');
        setEditingTrip(trip);
    };

    return (
        <div className="min-h-screen bg-dark-900 pt-20 pb-12">
            <div className="container-custom max-w-5xl">
                <div ref={headerRef} className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-display font-bold text-white mb-2">
                                My Trip <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Planner</span>
                            </h1>
                            <p className="text-white/50">Plan your perfect Luxor adventure by combining services</p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="ghost" onClick={() => navigate('/services')} className="flex items-center gap-2">
                                <Package className="w-4 h-4" />Browse Services
                            </Button>
                            <Button variant="primary" onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
                                <Plus className="w-5 h-5" />New Trip
                            </Button>
                        </div>
                    </div>
                </div>

                {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} className="mb-6" />}

                <div ref={contentRef}>
                    {/* Create Form */}
                    {showCreateForm && (
                        <Card className="mb-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-primary-400" />Create New Trip</h3>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input label="Trip Name" value={newTripName} onChange={(e) => setNewTripName(e.target.value)} placeholder="e.g. My Luxor Weekend" required />
                                    <Input label="Date" type="date" value={newTripDate} onChange={(e) => setNewTripDate(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-white/80">Notes</label>
                                    <textarea value={newTripNotes} onChange={(e) => setNewTripNotes(e.target.value)} rows={2} className="w-full px-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300" placeholder="Any notes for your trip..." />
                                </div>
                                <div className="flex gap-3">
                                    <Button type="submit" variant="primary"><Save className="w-4 h-4 mr-2" />Create Trip</Button>
                                    <Button type="button" variant="ghost" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                                </div>
                            </form>
                        </Card>
                    )}

                    {loading ? (
                        <div className="text-center py-20">
                            <div className="w-12 h-12 rounded-full border-4 border-primary-500/30 border-t-primary-500 animate-spin mx-auto mb-4" />
                            <p className="text-white/50">Loading your trips...</p>
                        </div>
                    ) : trips.length === 0 ? (
                        <div className="text-center py-20">
                            <MapPin className="w-16 h-16 text-white/10 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-white/30 mb-2">No trips yet</h3>
                            <p className="text-white/20 mb-6">Create a trip and add services from the Services page</p>
                            <div className="flex gap-3 justify-center">
                                <Button variant="primary" onClick={() => setShowCreateForm(true)}>Create Trip</Button>
                                <Button variant="ghost" onClick={() => navigate('/services')}>Browse Services</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {trips.map(trip => {
                                const st = statusStyles[trip.status] || statusStyles.Draft;
                                const isExpanded = expandedTrip === trip.id;
                                return (
                                    <Card key={trip.id} className="overflow-hidden">
                                        {/* Trip Header */}
                                        <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedTrip(isExpanded ? null : trip.id)}>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                                                    <MapPin className="w-6 h-6 text-blue-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white">{trip.name}</h3>
                                                    <div className="flex items-center gap-3 text-sm text-white/40">
                                                        {trip.date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{trip.date}</span>}
                                                        <span>{trip.items.length} items</span>
                                                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${trip.totalBudget}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${st.bg} ${st.text}`}>{st.label}</span>
                                                <span className={`transition-transform duration-300 text-white/30 ${isExpanded ? 'rotate-90' : ''}`}>&#9654;</span>
                                            </div>
                                        </div>

                                        {/* Expanded Content */}
                                        {isExpanded && (
                                            <div className="mt-4 pt-4 border-t border-white/10">
                                                {trip.notes && <p className="text-white/50 text-sm mb-4 italic">"{trip.notes}"</p>}

                                                {/* Items */}
                                                {trip.items.length > 0 ? (
                                                    <div className="space-y-2 mb-4">
                                                        {trip.items.map(item => {
                                                            const CatIcon = categoryIcons[item.category] || Package;
                                                            return (
                                                                <div key={item.id} className="flex items-center justify-between p-3 bg-dark-700/30 rounded-xl">
                                                                    <div className="flex items-center gap-3">
                                                                        <img src={item.image} alt={item.serviceName} className="w-10 h-10 rounded-lg object-cover" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=100'; }} />
                                                                        <div>
                                                                            <p className="text-sm font-medium text-white flex items-center gap-2">
                                                                                <CatIcon className="w-3 h-3 text-white/40" />{item.serviceName}
                                                                            </p>
                                                                            <p className="text-xs text-white/40">{item.vendor} - {item.duration}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-sm font-semibold text-primary-400">${item.price}</span>
                                                                        {trip.status === 'Draft' && (
                                                                            <button onClick={(e) => { e.stopPropagation(); handleRemoveItem(trip.id, item.id); }} className="p-1 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                        <div className="flex justify-end pt-2 border-t border-white/5">
                                                            <p className="text-sm text-white/60">Total: <span className="font-bold text-white text-lg">${trip.totalBudget}</span></p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-6 mb-4">
                                                        <p className="text-white/30 text-sm">No items yet. <button onClick={() => navigate('/services')} className="text-primary-400 hover:underline">Browse services</button> to add some.</p>
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                <div className="flex flex-wrap gap-2">
                                                    {trip.status === 'Draft' && (
                                                        <>
                                                            <Button variant="primary" size="sm" onClick={() => navigate('/services')}><Plus className="w-4 h-4 mr-1" />Add Services</Button>
                                                            {trip.items.length > 0 && <Button variant="secondary" size="sm" onClick={() => handleUpdateStatus(trip.id, 'Confirmed')}><CheckCircle className="w-4 h-4 mr-1" />Confirm Trip</Button>}
                                                            <Button variant="ghost" size="sm" onClick={() => openEdit(trip)}><Edit2 className="w-4 h-4 mr-1" />Edit</Button>
                                                        </>
                                                    )}
                                                    {trip.status === 'Confirmed' && (
                                                        <>
                                                            <Button variant="primary" size="sm" onClick={() => handleUpdateStatus(trip.id, 'Completed')}><CheckCircle className="w-4 h-4 mr-1" />Mark Complete</Button>
                                                            <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(trip.id, 'Draft')}>Back to Planning</Button>
                                                        </>
                                                    )}
                                                    <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(trip.id)} className="text-red-400 ml-auto"><Trash2 className="w-4 h-4 mr-1" />Delete</Button>
                                                </div>
                                            </div>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Edit Trip Modal */}
                {editingTrip && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={() => setEditingTrip(null)} />
                        <Card className="relative z-10 w-full max-w-md">
                            <h3 className="text-xl font-bold text-white mb-4">Edit Trip</h3>
                            <form onSubmit={handleUpdateTrip} className="space-y-4">
                                <Input label="Trip Name" value={newTripName} onChange={(e) => setNewTripName(e.target.value)} required />
                                <Input label="Date" type="date" value={newTripDate} onChange={(e) => setNewTripDate(e.target.value)} />
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-white/80">Notes</label>
                                    <textarea value={newTripNotes} onChange={(e) => setNewTripNotes(e.target.value)} rows={2} className="w-full px-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300" />
                                </div>
                                <div className="flex gap-3">
                                    <Button type="submit" variant="primary">Save</Button>
                                    <Button type="button" variant="ghost" onClick={() => setEditingTrip(null)}>Cancel</Button>
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
                            <h3 className="text-xl font-bold text-white mb-2">Delete Trip?</h3>
                            <p className="text-white/50 mb-6">This cannot be undone.</p>
                            <div className="flex gap-3 justify-center">
                                <Button variant="danger" onClick={() => handleDelete(deleteConfirm)}>Delete</Button>
                                <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TripPlanner;
