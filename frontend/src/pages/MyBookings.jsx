import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Compass, Users, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import bookingService from '../services/bookingService';

const statusStyles = {
    Pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', icon: Clock },
    Confirmed: { bg: 'bg-green-500/10', text: 'text-green-400', icon: CheckCircle },
    Completed: { bg: 'bg-purple-500/10', text: 'text-purple-400', icon: CheckCircle },
    Cancelled: { bg: 'bg-red-500/10', text: 'text-red-400', icon: XCircle },
};

const MyBookings = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);
    const [alert, setAlert] = useState(null);

    const fetchBookings = async () => {
        setLoading(true);
        const result = await bookingService.getMyBookings();
        if (result.success) {
            setBookings(result.bookings);
        } else {
            setAlert({ type: 'error', message: result.error });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        setCancellingId(id);
        const result = await bookingService.cancel(id);
        setCancellingId(null);
        if (result.success) {
            setAlert({ type: 'success', message: 'Booking cancelled successfully.' });
            fetchBookings();
        } else {
            setAlert({ type: 'error', message: result.error });
        }
    };

    return (
        <div className="min-h-screen bg-dark-900 pt-20 pb-12">
            <div className="container-custom max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-display font-bold text-white mb-2">
                        My <span className="bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent">Bookings</span>
                    </h1>
                    <p className="text-white/50">Track your upcoming and past adventures</p>
                </div>

                {alert && (
                    <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} className="mb-6" />
                )}

                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-12 h-12 rounded-full border-4 border-primary-500/30 border-t-primary-500 animate-spin mx-auto mb-4" />
                        <p className="text-white/50">Loading your bookings...</p>
                    </div>
                ) : bookings.length === 0 ? (
                    /* Empty State */
                    <Card className="relative overflow-visible">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 rounded-3xl blur-xl opacity-50" />
                        <div className="relative text-center py-16">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-500/10 to-secondary-500/10 flex items-center justify-center">
                                <Compass className="w-12 h-12 text-primary-400 opacity-50" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">No bookings yet</h3>
                            <p className="text-white/50 mb-8 max-w-md mx-auto">
                                Start exploring the wonders of ancient Luxor! Browse our exclusive tour programs and book your first adventure.
                            </p>
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={() => navigate('/services')}
                                className="shadow-[0_0_30px_rgba(242,133,109,0.4)]"
                            >
                                <MapPin className="w-5 h-5 mr-2" />
                                Explore Services
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {bookings.map(booking => {
                            const StatusIcon = statusStyles[booking.status]?.icon || AlertCircle;
                            const statusStyle = statusStyles[booking.status] || { bg: 'bg-white/10', text: 'text-white/50' };
                            const service = booking.serviceId || {};
                            
                            return (
                                <Card key={booking._id} className="flex flex-col sm:flex-row gap-5 p-5">
                                    <div className="w-full sm:w-48 h-32 shrink-0">
                                        <img 
                                            src={service.images?.[0] || 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=400'} 
                                            alt={service.name || 'Service'} 
                                            className="w-full h-full object-cover rounded-xl"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div>
                                            <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                                                <h3 className="text-xl font-bold text-white truncate pr-2">
                                                    {service.name || 'Unknown Service'}
                                                </h3>
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                                                    <StatusIcon className="w-3 h-3 mr-1" />
                                                    {booking.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-primary-400 mb-3">{service.serviceType}</p>
                                            
                                            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                                                <div className="flex items-center text-sm text-white/60">
                                                    <Calendar className="w-4 h-4 mr-2 text-white/40" />
                                                    {new Date(booking.serviceDate).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center text-sm text-white/60">
                                                    <Users className="w-4 h-4 mr-2 text-white/40" />
                                                    {booking.numberOfPeople} People
                                                </div>
                                                <div className="flex items-center text-sm text-white/60">
                                                    <DollarSign className="w-4 h-4 mr-2 text-white/40" />
                                                    Total: ${booking.totalPrice}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                            <p className="text-xs text-white/30">
                                                Booked on {new Date(booking.createdAt).toLocaleDateString()}
                                            </p>
                                            {booking.status === 'Pending' && (
                                                <Button 
                                                    variant="danger" 
                                                    size="sm" 
                                                    onClick={() => handleCancel(booking._id)}
                                                    disabled={cancellingId === booking._id}
                                                >
                                                    {cancellingId === booking._id ? 'Cancelling...' : <><X className="w-4 h-4 mr-1"/> Cancel</>}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookings;
