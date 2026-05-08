import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, BarChart3, Clock, DollarSign, Eye, Shield, Users } from 'lucide-react';
import Card from '../components/common/Card';
import adminService from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';

const formatCurrency = (value) => {
    const amount = Number(value || 0);
    return `$${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

const roleColor = {
    Tourist: '#38bdf8',
    LocalBusinessOwner: '#a78bfa',
    Admin: '#f87171',
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [data, setData] = useState(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const result = await adminService.getDashboardStats();
            if (result.success) {
                setData(result.data);
                setError('');
            } else {
                setError(result.error);
            }
            setLoading(false);
        };
        load();
    }, []);

    const pendingAds = useMemo(() => {
        if (!data?.advertisements) return 0;
        return data.advertisements.find((s) => s._id === 'Pending')?.count || 0;
    }, [data]);

    const roleSlices = useMemo(() => {
        const rows = data?.usersByRole || [];
        const total = rows.reduce((sum, row) => sum + row.count, 0) || 1;
        let offset = 0;
        return rows.map((row) => {
            const percent = (row.count / total) * 100;
            const slice = {
                ...row,
                start: offset,
                end: offset + percent,
                percent,
                color: roleColor[row._id] || '#9ca3af',
            };
            offset += percent;
            return slice;
        });
    }, [data]);

    const pieBackground = useMemo(() => {
        if (!roleSlices.length) return '#1f2937';
        const segments = roleSlices.map((s) => `${s.color} ${s.start}% ${s.end}%`);
        return `conic-gradient(${segments.join(',')})`;
    }, [roleSlices]);

    return (
        <div className="min-h-screen bg-dark-900 pt-24 pb-16">
            <div className="container-custom">
                <div className="mb-8">
                    <h1 className="text-4xl font-display font-bold text-white mb-2">
                        Admin <span className="bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent">Command Center</span>
                    </h1>
                    <p className="text-white/60">Welcome back, {user?.firstName || 'Admin'}.</p>
                </div>

                {error && (
                    <Card className="mb-6 border border-red-500/30">
                        <p className="text-red-300 text-sm">{error}</p>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Total Active Users', value: data?.overview?.totalUsers ?? 0, icon: Users },
                        { label: 'Total Platform Revenue', value: formatCurrency(data?.overview?.totalRevenue), icon: DollarSign },
                        { label: 'Pending Ads', value: pendingAds, icon: Clock },
                        { label: 'Total Bookings', value: data?.overview?.totalBookings ?? 0, icon: Eye },
                    ].map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={stat.label}>
                                <div className="flex items-center justify-between mb-4">
                                    <Icon className="w-6 h-6 text-primary-400" />
                                    <Shield className="w-4 h-4 text-white/30" />
                                </div>
                                <p className="text-3xl font-bold text-white">{loading ? '...' : stat.value}</p>
                                <p className="text-white/50 text-sm mt-1">{stat.label}</p>
                            </Card>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <Card className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-primary-400" />
                                Top 5 Booked Services
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {(data?.topServices || []).map((item, index) => (
                                <div key={`${item.name}-${index}`} className="flex items-center justify-between p-3 rounded-xl bg-dark-700/40 border border-white/5">
                                    <div>
                                        <p className="text-white font-medium">{index + 1}. {item.name}</p>
                                        <p className="text-white/50 text-xs">{item.type || 'Service'} • {item.totalBookings} bookings</p>
                                    </div>
                                    <p className="text-green-400 font-semibold">{formatCurrency(item.totalRevenue)}</p>
                                </div>
                            ))}
                            {!loading && (data?.topServices || []).length === 0 && <p className="text-white/40 text-sm">No booking data yet.</p>}
                        </div>
                    </Card>

                    <Card>
                        <h2 className="text-xl font-bold text-white mb-4">Role Breakdown</h2>
                        <div className="flex justify-center mb-4">
                            <div className="w-40 h-40 rounded-full border-4 border-dark-700" style={{ background: pieBackground }} />
                        </div>
                        <div className="space-y-2">
                            {roleSlices.map((slice) => (
                                <div key={slice._id} className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2 text-white/70">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
                                        {slice._id}
                                    </span>
                                    <span className="text-white">{slice.count} ({slice.percent.toFixed(0)}%)</span>
                                </div>
                            ))}
                            {!loading && !roleSlices.length && <p className="text-white/40 text-sm">No role data available.</p>}
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <Card>
                        <h2 className="text-xl font-bold text-white mb-4">Top 5 Most Planned Attractions</h2>
                        <div className="space-y-3">
                            {(data?.topAttractions || []).map((item, index) => (
                                <div key={`${item.name}-${index}`} className="flex items-center justify-between p-3 rounded-xl bg-dark-700/40 border border-white/5">
                                    <div>
                                        <p className="text-white font-medium">{index + 1}. {item.name}</p>
                                        <p className="text-white/50 text-xs">{item.category || 'Attraction'}</p>
                                    </div>
                                    <p className="text-primary-400 font-semibold">{item.timesPlanned} plans</p>
                                </div>
                            ))}
                            {!loading && (data?.topAttractions || []).length === 0 && <p className="text-white/40 text-sm">No trip planning activity yet.</p>}
                        </div>
                    </Card>

                    <Card>
                        <h2 className="text-xl font-bold text-white mb-4">Admin Actions</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button onClick={() => navigate('/admin/users')} className="text-left p-4 rounded-xl bg-dark-700/40 border border-white/5 hover:border-primary-500/40 transition-colors">
                                <p className="text-white font-semibold">User & Role Management</p>
                                <p className="text-white/50 text-xs mt-1">Search, paginate, and ban bad actors.</p>
                            </button>
                            <button onClick={() => navigate('/admin/attractions')} className="text-left p-4 rounded-xl bg-dark-700/40 border border-white/5 hover:border-primary-500/40 transition-colors">
                                <p className="text-white font-semibold">Global Attractions DB</p>
                                <p className="text-white/50 text-xs mt-1">Create, edit, and delete attractions.</p>
                            </button>
                            <button onClick={() => navigate('/admin/programs')} className="text-left p-4 rounded-xl bg-dark-700/40 border border-white/5 hover:border-primary-500/40 transition-colors">
                                <p className="text-white font-semibold">Monitor Programs</p>
                                <p className="text-white/50 text-xs mt-1">Review and manage tour programs.</p>
                            </button>
                            <button onClick={() => navigate('/admin/services')} className="text-left p-4 rounded-xl bg-dark-700/40 border border-white/5 hover:border-primary-500/40 transition-colors">
                                <p className="text-white font-semibold">Monitor Services</p>
                                <p className="text-white/50 text-xs mt-1">Review and manage individual services.</p>
                            </button>
                        </div>
                    </Card>
                </div>

                {data?.growth && (
                    <Card>
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-primary-400" />
                            <p className="text-white font-semibold">User Growth</p>
                        </div>
                        <p className="text-white/60 text-sm">
                            Current period: {data.growth.currentPeriod} users • Previous period: {data.growth.previousPeriod} users • Growth: {data.growth.growthPercentage}%
                        </p>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
