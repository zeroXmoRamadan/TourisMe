import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    CalendarDays, Users, DollarSign, Filter, Search,
    CheckCircle, XCircle, Clock, Package, ArrowLeft,
    ChevronDown, Eye, Loader2, AlertCircle
} from 'lucide-react';
import bookingService from '../../services/bookingService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

// --- Status Config ---
const STATUS_CONFIG = {
    Pending: { color: 'yellow', label: 'Pending', Icon: Clock },
    Confirmed: { color: 'green', label: 'Confirmed', Icon: CheckCircle },
    Cancelled: { color: 'red', label: 'Cancelled', Icon: XCircle },
    Completed: { color: 'blue', label: 'Completed', Icon: CheckCircle },
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
    const Icon = cfg.Icon;
    const colorMap = {
        yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        green: 'bg-green-500/10 text-green-400 border-green-500/20',
        red: 'bg-red-500/10 text-red-400 border-red-500/20',
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${colorMap[cfg.color]}`}>
            <Icon className="w-3.5 h-3.5" />
            {cfg.label}
        </span>
    );
};

const VendorBookings = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // bookingId being updated
    const [alert, setAlert] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Derive unique services from loaded bookings for the filter dropdown
    const serviceOptions = useMemo(() => {
        const seen = new Map();
        bookings.forEach(b => {
            const svc = b.serviceId;
            if (svc && !seen.has(svc._id)) seen.set(svc._id, svc.name);
        });
        return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
    }, [bookings]);

    // Read serviceId filter from URL query param
    const selectedServiceId = searchParams.get('serviceId') || 'all';
    const selectedStatus = searchParams.get('status') || 'all';

    const setServiceFilter = (id) => {
        if (id === 'all') {
            searchParams.delete('serviceId');
        } else {
            searchParams.set('serviceId', id);
        }
        setSearchParams(searchParams);
    };

    const setStatusFilter = (status) => {
        if (status === 'all') {
            searchParams.delete('status');
        } else {
            searchParams.set('status', status);
        }
        setSearchParams(searchParams);
    };

    const fetchBookings = async () => {
        setLoading(true);
        const res = await bookingService.getMyBookings({ limit: 200 }); // load all
        if (res.success) {
            // Sort: Pending first → Confirmed (soonest date first) → rest
            const sorted = [...(res.bookings || [])].sort((a, b) => {
                const order = { Pending: 0, Confirmed: 1, Completed: 2, Cancelled: 3 };
                if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
                return new Date(a.serviceDate) - new Date(b.serviceDate);
            });
            setBookings(sorted);
        } else {
            setAlert({ type: 'error', message: res.error });
        }
        setLoading(false);
    };

    useEffect(() => { fetchBookings(); }, []);

    // Filter & search
    const displayedBookings = useMemo(() => {
        let list = bookings;
        if (selectedServiceId !== 'all') {
            list = list.filter(b => b.serviceId?._id === selectedServiceId);
        }
        if (selectedStatus !== 'all') {
            list = list.filter(b => b.status === selectedStatus);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(b =>
                b.serviceId?.name?.toLowerCase().includes(q) ||
                b.touristId?.firstName?.toLowerCase().includes(q) ||
                b.touristId?.lastName?.toLowerCase().includes(q) ||
                b.touristId?.email?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [bookings, selectedServiceId, selectedStatus, searchQuery]);

    // Stat summaries
    const summaryStats = useMemo(() => ({
        total: displayedBookings.length,
        pending: displayedBookings.filter(b => b.status === 'Pending').length,
        confirmed: displayedBookings.filter(b => b.status === 'Confirmed').length,
        revenue: displayedBookings.filter(b => b.status !== 'Cancelled').reduce((s, b) => s + (b.totalPrice || 0), 0),
    }), [displayedBookings]);

    const handleStatusUpdate = async (bookingId, newStatus) => {
        setActionLoading(bookingId);
        const res = await bookingService.updateStatus(bookingId, newStatus);
        if (res.success) {
            setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: newStatus } : b));
            setAlert({ type: 'success', message: `Booking ${newStatus.toLowerCase()} successfully.` });
        } else {
            setAlert({ type: 'error', message: res.error });
        }
        setActionLoading(null);
        setTimeout(() => setAlert(null), 3000);
    };

    return (
        <div className="min-h-screen bg-dark-900 pt-20 pb-16">
            <div className="container-custom max-w-7xl">

                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/vendor/dashboard')}
                        className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </button>
                    <h1 className="text-4xl font-display font-bold text-white mb-2">
                        Booking <span className="bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent">Requests</span>
                    </h1>
                    <p className="text-white/50">Manage and respond to all booking requests across your services.</p>
                </div>

                {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} className="mb-6" />}

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Bookings', value: summaryStats.total, icon: Package, color: 'white' },
                        { label: 'Pending', value: summaryStats.pending, icon: Clock, color: 'yellow' },
                        { label: 'Confirmed', value: summaryStats.confirmed, icon: CheckCircle, color: 'green' },
                        { label: 'Total Revenue', value: `$${summaryStats.revenue.toLocaleString()}`, icon: DollarSign, color: 'primary' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <Card key={label} className="text-center py-5">
                            <Icon className={`w-6 h-6 mx-auto mb-2 ${color === 'yellow' ? 'text-yellow-400' :
                                    color === 'green' ? 'text-green-400' :
                                        color === 'primary' ? 'text-primary-400' : 'text-white/60'
                                }`} />
                            <p className="text-2xl font-bold text-white">{value}</p>
                            <p className="text-xs text-white/40 mt-0.5">{label}</p>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    {/* Service filter dropdown */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                        <select
                            value={selectedServiceId}
                            onChange={e => setServiceFilter(e.target.value)}
                            className="appearance-none pl-9 pr-8 py-2.5 bg-dark-700/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all min-w-[200px]"
                        >
                            <option value="all">All Services</option>
                            {serviceOptions.map(({ id, name }) => (
                                <option key={id} value={id}>{name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                    </div>

                    {/* Status filter dropdown */}
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                        <select
                            value={selectedStatus}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="appearance-none pl-9 pr-8 py-2.5 bg-dark-700/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all min-w-[170px]"
                        >
                            <option value="all">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                    </div>

                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by service or tourist name..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-dark-700/50 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                        />
                    </div>
                </div>

                {/* Table */}
                <Card className="overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
                        </div>
                    ) : displayedBookings.length === 0 ? (
                        <div className="text-center py-20">
                            <AlertCircle className="w-12 h-12 text-white/10 mx-auto mb-3" />
                            <p className="text-white/40 text-lg font-medium">No bookings found</p>
                            <p className="text-white/30 text-sm mt-1">Try changing your filters.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-4 px-4 text-white/50 font-medium text-sm">Service</th>
                                        <th className="text-left py-4 px-4 text-white/50 font-medium text-sm">Tourist</th>
                                        <th className="text-left py-4 px-4 text-white/50 font-medium text-sm">Date</th>
                                        <th className="text-left py-4 px-4 text-white/50 font-medium text-sm">People</th>
                                        <th className="text-left py-4 px-4 text-white/50 font-medium text-sm">Total</th>
                                        <th className="text-left py-4 px-4 text-white/50 font-medium text-sm">Status</th>
                                        <th className="text-right py-4 px-4 text-white/50 font-medium text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedBookings.map(booking => {
                                        const svc = booking.serviceId;
                                        const tourist = booking.touristId;
                                        const isUpdating = actionLoading === booking._id;
                                        return (
                                            <tr key={booking._id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                                                {/* Service */}
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={svc?.images?.[0] || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0e6e?w=80'}
                                                            alt={svc?.name}
                                                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                                                        />
                                                        <div>
                                                            <p className="font-semibold text-white text-sm leading-tight">{svc?.name || '—'}</p>
                                                            <p className="text-xs text-white/40 mt-0.5">{svc?.serviceType}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Tourist */}
                                                <td className="py-4 px-4">
                                                    <p className="text-sm text-white/80">{tourist?.firstName + " " + tourist?.lastName || '—'}</p>
                                                    <p className="text-xs text-white/40">{tourist?.email}</p>
                                                </td>

                                                {/* Date */}
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-1.5 text-sm text-white/70">
                                                        <CalendarDays className="w-3.5 h-3.5 text-primary-400 shrink-0" />
                                                        {new Date(booking.serviceDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </div>
                                                </td>

                                                {/* People */}
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-1.5 text-sm text-white/70">
                                                        <Users className="w-3.5 h-3.5 text-secondary-400 shrink-0" />
                                                        {booking.numberOfPeople}
                                                    </div>
                                                </td>

                                                {/* Total */}
                                                <td className="py-4 px-4 text-white font-semibold text-sm">
                                                    ${booking.totalPrice?.toLocaleString()}
                                                </td>

                                                {/* Status */}
                                                <td className="py-4 px-4">
                                                    <StatusBadge status={booking.status} />
                                                </td>

                                                {/* Actions */}
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {isUpdating ? (
                                                            <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />
                                                        ) : (
                                                            <>
                                                                {booking.status === 'Pending' && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleStatusUpdate(booking._id, 'Confirmed')}
                                                                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors"
                                                                        >
                                                                            Confirm
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleStatusUpdate(booking._id, 'Cancelled')}
                                                                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                                                                        >
                                                                            Decline
                                                                        </button>
                                                                    </>
                                                                )}
                                                                {booking.status === 'Confirmed' && (
                                                                    <button
                                                                        onClick={() => handleStatusUpdate(booking._id, 'Completed')}
                                                                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                                                                    >
                                                                        Mark Complete
                                                                    </button>
                                                                )}
                                                                {svc?._id && (
                                                                    <button
                                                                        onClick={() => navigate(`/vendor/service/${svc._id}`)}
                                                                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                                                        title="View Service"
                                                                    >
                                                                        <Eye className="w-4 h-4 text-white/50" />
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default VendorBookings;
