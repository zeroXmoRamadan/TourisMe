import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Users, Search, Shield, Store, User, Trash2, X, Edit2, Save, Mail, Phone, Calendar, ChevronDown } from 'lucide-react';
import { secureStorage } from '../../utils/security';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const USERS_KEY = 'luxor_users';

const AdminUsers = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [alert, setAlert] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const headerRef = useRef(null);
    const contentRef = useRef(null);

    const loadUsers = () => {
        const allUsers = secureStorage.getItem(USERS_KEY) || [];
        // Remove password from display
        setUsers(allUsers.map(u => ({ ...u, password: undefined })));
    };

    useEffect(() => { loadUsers(); }, []);

    useEffect(() => {
        gsap.fromTo(headerRef.current, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
        gsap.fromTo(contentRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'power3.out' });
    }, []);

    const filteredUsers = users.filter(u => {
        const matchesSearch = search === '' ||
            (`${u.firstName} ${u.lastName}`).toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const changeRole = (userId, newRole) => {
        if (userId === currentUser.id) {
            setAlert({ type: 'error', message: "You can't change your own role" });
            setTimeout(() => setAlert(null), 3000);
            return;
        }
        const allUsers = secureStorage.getItem(USERS_KEY) || [];
        const index = allUsers.findIndex(u => u.id === userId);
        if (index === -1) return;
        allUsers[index].role = newRole;
        if (newRole === 'vendor' && !allUsers[index].companyName) {
            allUsers[index].companyName = '';
        }
        secureStorage.setItem(USERS_KEY, allUsers);
        loadUsers();
        setAlert({ type: 'success', message: `User role changed to ${newRole}` });
        setTimeout(() => setAlert(null), 3000);
    };

    const deleteUser = (userId) => {
        if (userId === currentUser.id) {
            setAlert({ type: 'error', message: "You can't delete your own account" });
            setDeleteConfirm(null);
            setTimeout(() => setAlert(null), 3000);
            return;
        }
        const allUsers = secureStorage.getItem(USERS_KEY) || [];
        const filtered = allUsers.filter(u => u.id !== userId);
        secureStorage.setItem(USERS_KEY, filtered);
        loadUsers();
        setDeleteConfirm(null);
        setAlert({ type: 'success', message: 'User deleted' });
        setTimeout(() => setAlert(null), 3000);
    };

    const updateUser = (userId, updates) => {
        const allUsers = secureStorage.getItem(USERS_KEY) || [];
        const index = allUsers.findIndex(u => u.id === userId);
        if (index === -1) return;
        allUsers[index] = { ...allUsers[index], ...updates };
        secureStorage.setItem(USERS_KEY, allUsers);
        loadUsers();
        setEditingUser(null);
        setAlert({ type: 'success', message: 'User updated' });
        setTimeout(() => setAlert(null), 3000);
    };

    const roleBadge = (role) => {
        const styles = { admin: 'bg-purple-500/10 text-purple-400', vendor: 'bg-blue-500/10 text-blue-400', user: 'bg-green-500/10 text-green-400' };
        const icons = { admin: Shield, vendor: Store, user: User };
        const Icon = icons[role] || User;
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${styles[role] || styles.user}`}>
                <Icon className="w-3 h-3" />{role.charAt(0).toUpperCase() + role.slice(1)}
            </span>
        );
    };

    const counts = {
        all: users.length,
        admin: users.filter(u => u.role === 'admin').length,
        vendor: users.filter(u => u.role === 'vendor').length,
        user: users.filter(u => u.role === 'user').length,
    };

    return (
        <div className="min-h-screen bg-dark-900 pt-20 pb-12">
            <div className="container-custom max-w-6xl">
                <div ref={headerRef} className="mb-8">
                    <h1 className="text-4xl font-display font-bold text-white mb-2">
                        User <span className="bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent">Management</span>
                    </h1>
                    <p className="text-white/50">Manage all platform users - tourists, vendors, and administrators</p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        {[
                            { label: 'Total Users', value: counts.all, icon: Users, color: 'primary' },
                            { label: 'Admins', value: counts.admin, icon: Shield, color: 'purple' },
                            { label: 'Vendors', value: counts.vendor, icon: Store, color: 'blue' },
                            { label: 'Tourists', value: counts.user, icon: User, color: 'green' },
                        ].map((s, i) => {
                            const Icon = s.icon;
                            return (
                                <Card key={i} className="text-center">
                                    <Icon className={`w-6 h-6 mx-auto mb-2 ${s.color === 'primary' ? 'text-primary-400' : s.color === 'purple' ? 'text-purple-400' : s.color === 'blue' ? 'text-blue-400' : 'text-green-400'}`} />
                                    <p className="text-2xl font-bold text-white">{s.value}</p>
                                    <p className="text-xs text-white/40">{s.label}</p>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} className="mb-6" />}

                <div ref={contentRef}>
                    {/* Search & Filter */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 z-10" />
                            <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300" />
                        </div>
                        <div className="flex gap-2">
                            {['all', 'admin', 'vendor', 'user'].map(r => (
                                <button key={r} onClick={() => setRoleFilter(r)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${roleFilter === r ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-dark-700/50 text-white/50 border border-white/5 hover:bg-white/5'}`}>
                                    {r.charAt(0).toUpperCase() + r.slice(1)} ({counts[r]})
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Users Table */}
                    <Card>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">User</th>
                                        <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Contact</th>
                                        <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Role</th>
                                        <th className="text-left py-4 px-4 text-white/60 font-medium text-sm">Joined</th>
                                        <th className="text-right py-4 px-4 text-white/60 font-medium text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((u) => (
                                        <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                        {u.firstName?.[0]}{u.lastName?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white text-sm">{u.firstName} {u.lastName}</p>
                                                        {u.companyName && <p className="text-xs text-blue-400">{u.companyName}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <p className="text-sm text-white/70 flex items-center gap-1"><Mail className="w-3 h-3" />{u.email}</p>
                                                <p className="text-xs text-white/40 flex items-center gap-1 mt-1"><Phone className="w-3 h-3" />{u.phone || 'N/A'}</p>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="relative group inline-block">
                                                    {roleBadge(u.role)}
                                                    {u.id !== currentUser.id && (
                                                        <div className="hidden group-hover:block absolute top-full left-0 mt-1 z-20 bg-dark-700 border border-white/10 rounded-xl shadow-lg overflow-hidden min-w-[120px]">
                                                            {['user', 'vendor', 'admin'].filter(r => r !== u.role).map(r => (
                                                                <button key={r} onClick={() => changeRole(u.id, r)} className="block w-full text-left px-4 py-2 text-sm text-white/70 hover:bg-white/10 transition-colors capitalize">{r}</button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="text-sm text-white/50 flex items-center gap-1"><Calendar className="w-3 h-3" />{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => setEditingUser(u)} className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors" title="Edit"><Edit2 className="w-4 h-4 text-primary-400" /></button>
                                                    {u.id !== currentUser.id && (
                                                        <button onClick={() => setDeleteConfirm(u.id)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4 text-red-400" /></button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredUsers.length === 0 && (
                                <div className="text-center py-12"><Users className="w-12 h-12 text-white/10 mx-auto mb-3" /><p className="text-white/40">No users found</p></div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Edit Modal */}
                {editingUser && (
                    <EditUserModal user={editingUser} onSave={updateUser} onClose={() => setEditingUser(null)} isCurrentUser={editingUser.id === currentUser.id} />
                )}

                {/* Delete Confirm */}
                {deleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
                        <Card className="relative z-10 w-full max-w-md text-center">
                            <Trash2 className="w-12 h-12 text-red-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Delete User?</h3>
                            <p className="text-white/50 mb-6">This will permanently remove the user and all their data.</p>
                            <div className="flex gap-3 justify-center">
                                <Button variant="danger" onClick={() => deleteUser(deleteConfirm)}>Delete</Button>
                                <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

const EditUserModal = ({ user, onSave, onClose, isCurrentUser }) => {
    const [form, setForm] = useState({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        companyName: user.companyName || '',
        role: user.role || 'user',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const updates = { ...form };
        if (isCurrentUser) delete updates.role;
        onSave(user.id, updates);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={onClose} />
            <Card className="relative z-10 w-full max-w-lg">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3"><Edit2 className="w-5 h-5 text-primary-400" />Edit User</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><X className="w-5 h-5 text-white/60" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-white/80">First Name</label>
                            <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full px-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-white/80">Last Name</label>
                            <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full px-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-white/80">Email</label>
                        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-white/80">Phone</label>
                        <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300" />
                    </div>
                    {(form.role === 'vendor' || user.role === 'vendor') && (
                        <div>
                            <label className="block text-sm font-medium mb-2 text-white/80">Company Name</label>
                            <input type="text" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="w-full px-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300" placeholder="Tourism company name" />
                        </div>
                    )}
                    {!isCurrentUser && (
                        <div>
                            <label className="block text-sm font-medium mb-2 text-white/80">Role</label>
                            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-4 py-3 bg-dark-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300">
                                <option value="user">Tourist</option>
                                <option value="vendor">Vendor</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    )}
                    <div className="flex gap-3 pt-4">
                        <Button type="submit" variant="primary" className="flex items-center gap-2"><Save className="w-4 h-4" />Save Changes</Button>
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default AdminUsers;
