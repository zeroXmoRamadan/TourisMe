import React, { useEffect, useMemo, useState } from 'react';
import { Ban, CheckCircle, Mail, Search, Shield, User, Users } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import adminService from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';

const PAGE_SIZE = 10;

const AdminUsers = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    const [suspendTarget, setSuspendTarget] = useState(null); // { user, action: 'suspend'|'unsuspend' }

    useEffect(() => {
        const timeout = setTimeout(() => loadUsers(page, search), 350);
        return () => clearTimeout(timeout);
    }, [page, search]);

    const loadUsers = async (targetPage = page, query = search) => {
        setLoading(true);
        const result = await adminService.getUsers({
            page: targetPage,
            limit: PAGE_SIZE,
            search: query || undefined,
        });
        if (result.success) {
            setUsers(result.users || []);
            setTotalPages(result.totalPages || 1);
            setTotalUsers(result.totalUsers || 0);
        } else {
            setAlert({ type: 'error', message: result.error });
        }
        setLoading(false);
    };

    const roleCounts = useMemo(() => ({
        Admin: users.filter((u) => u.role === 'Admin').length,
        LocalBusinessOwner: users.filter((u) => u.role === 'LocalBusinessOwner').length,
        Tourist: users.filter((u) => u.role === 'Tourist').length,
    }), [users]);

    const handleToggleSuspend = async () => {
        if (!suspendTarget) return;
        const { user: target } = suspendTarget;
        const result = await adminService.toggleSuspend(target._id);
        if (result.success) {
            // Optimistically update the row in-place — no full reload needed
            setUsers((prev) =>
                prev.map((u) =>
                    u._id === target._id ? { ...u, isSuspended: result.isSuspended } : u
                )
            );
            const verb = result.isSuspended ? 'suspended' : 'unsuspended';
            setAlert({ type: 'success', message: `${target.firstName} ${target.lastName} has been ${verb}.` });
            setSuspendTarget(null);
        } else {
            setAlert({ type: 'error', message: result.error });
            setSuspendTarget(null);
        }
    };

    return (
        <div className="min-h-screen bg-dark-900 pt-24 pb-16">
            <div className="container-custom max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-4xl font-display font-bold text-white mb-2">
                        User &amp; <span className="bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent">Role Management</span>
                    </h1>
                    <p className="text-white/50">Search users and manage account status from one moderation table.</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <Card className="text-center"><Users className="w-5 h-5 mx-auto text-primary-400 mb-2" /><p className="text-xl text-white font-bold">{totalUsers}</p><p className="text-xs text-white/40">Total</p></Card>
                        <Card className="text-center"><Shield className="w-5 h-5 mx-auto text-red-400 mb-2" /><p className="text-xl text-white font-bold">{roleCounts.Admin}</p><p className="text-xs text-white/40">Admins</p></Card>
                        <Card className="text-center"><User className="w-5 h-5 mx-auto text-blue-400 mb-2" /><p className="text-xl text-white font-bold">{roleCounts.LocalBusinessOwner}</p><p className="text-xs text-white/40">Business Owners</p></Card>
                        <Card className="text-center"><User className="w-5 h-5 mx-auto text-green-400 mb-2" /><p className="text-xl text-white font-bold">{roleCounts.Tourist}</p><p className="text-xs text-white/40">Tourists</p></Card>
                    </div>
                </div>

                {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} className="mb-6" />}

                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
                    <input
                        value={search}
                        onChange={(e) => {
                            setPage(1);
                            setSearch(e.target.value);
                        }}
                        placeholder="Search by full name, company, or email..."
                        className="w-full pl-10 pr-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                    />
                </div>

                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-4 px-3 text-white/60 text-sm">User</th>
                                    <th className="text-left py-4 px-3 text-white/60 text-sm">Role</th>
                                    <th className="text-left py-4 px-3 text-white/60 text-sm">Status</th>
                                    <th className="text-left py-4 px-3 text-white/60 text-sm">Joined</th>
                                    <th className="text-right py-4 px-3 text-white/60 text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-3">
                                            <p className="text-white font-medium">
                                                {u.role === 'LocalBusinessOwner' && u.companyName 
                                                    ? u.companyName 
                                                    : `${u.firstName} ${u.lastName}`
                                                }
                                            </p>
                                            <div className="flex flex-col gap-0.5 mt-1">
                                                <p className="text-white/50 text-xs flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {u.email}
                                                </p>
                                                {u.role === 'LocalBusinessOwner' && u.companyName && (
                                                    <p className="text-white/50 text-xs pl-4">
                                                        {u.firstName} {u.lastName}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-3">
                                            <span className="text-xs px-2.5 py-1 rounded-full bg-primary-500/15 text-primary-300 border border-primary-500/20">
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="py-4 px-3">
                                            {u.isSuspended ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                                    Suspended
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/25">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                                    Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-3 text-white/60 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td className="py-4 px-3 text-right">
                                            {u._id !== currentUser?._id && u.role !== 'Admin' ? (
                                                u.isSuspended ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setSuspendTarget({ user: u, action: 'unsuspend' })}
                                                        className="inline-flex items-center gap-2 !text-green-400 hover:!bg-green-500/10 border border-green-500/20"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        Unsuspend
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setSuspendTarget({ user: u, action: 'suspend' })}
                                                        className="inline-flex items-center gap-2 !text-amber-400 hover:!bg-amber-500/10 border border-amber-500/20"
                                                    >
                                                        <Ban className="w-4 h-4" />
                                                        Suspend
                                                    </Button>
                                                )
                                            ) : (
                                                <span className="text-white/30 text-sm">Protected</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!loading && users.length === 0 && <p className="text-center py-10 text-white/40">No users found.</p>}
                    </div>
                </Card>

                <div className="flex items-center justify-between mt-6">
                    <p className="text-white/50 text-sm">Page {page} of {totalPages}</p>
                    <div className="flex gap-2">
                        <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
                        <Button variant="ghost" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
                    </div>
                </div>

                {/* Suspend / Unsuspend confirmation modal */}
                {suspendTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={() => setSuspendTarget(null)} />
                        <Card className="relative z-10 w-full max-w-md">
                            {suspendTarget.action === 'suspend' ? (
                                <>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center">
                                            <Ban className="w-5 h-5 text-amber-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white">Suspend this account?</h3>
                                    </div>
                                    <p className="text-white/50 mb-6">
                                        <span className="text-white">{suspendTarget.user.firstName} {suspendTarget.user.lastName}</span> will be immediately logged out and blocked from accessing the platform. You can reverse this at any time.
                                    </p>
                                    <div className="flex gap-3">
                                        <Button
                                            size="sm"
                                            className="!bg-amber-500 hover:!bg-amber-600 !text-white"
                                            onClick={handleToggleSuspend}
                                        >
                                            Confirm Suspend
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => setSuspendTarget(null)}>Cancel</Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-green-500/15 flex items-center justify-center">
                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white">Unsuspend this account?</h3>
                                    </div>
                                    <p className="text-white/50 mb-6">
                                        <span className="text-white">{suspendTarget.user.firstName} {suspendTarget.user.lastName}</span> will regain full access to the platform immediately.
                                    </p>
                                    <div className="flex gap-3">
                                        <Button
                                            size="sm"
                                            className="!bg-green-600 hover:!bg-green-700 !text-white"
                                            onClick={handleToggleSuspend}
                                        >
                                            Confirm Unsuspend
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => setSuspendTarget(null)}>Cancel</Button>
                                    </div>
                                </>
                            )}
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;

