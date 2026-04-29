import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, Edit2, Lock, Trash2, X, Loader2, Store, Shield, FileText } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Alert from '../components/common/Alert';

const Profile = () => {
    const { user, updateProfile, changePassword, deleteAccount } = useAuth();

    const [activeModal, setActiveModal] = useState(null); // 'edit', 'password', 'delete', null
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [editData, setEditData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
        companyName: user?.companyName || '',
        description: user?.description || ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [deletePassword, setDeletePassword] = useState('');

    const closeModal = () => {
        setActiveModal(null);
        setError('');
        setSuccess('');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setDeletePassword('');
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const res = await updateProfile(editData);
        if (res.success) {
            setSuccess('Profile updated successfully');
            setTimeout(closeModal, 1500);
        } else {
            setError(res.error);
        }
        setLoading(false);
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return setError('New passwords do not match');
        }
        setLoading(true);
        setError('');
        const res = await changePassword(passwordData.currentPassword, passwordData.newPassword);
        if (res.success) {
            setSuccess('Password changed successfully');
            setTimeout(closeModal, 1500);
        } else {
            setError(res.error);
        }
        setLoading(false);
    };

    const handleDeleteSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const res = await deleteAccount(deletePassword);
        if (!res.success) {
            setError(res.error);
            setLoading(false);
        }
        // If success, AuthContext will call logout() and redirect to login automatically
    };

    const profileFields = [
        { icon: User, label: 'First Name', value: user?.firstName },
        { icon: User, label: 'Last Name', value: user?.lastName },
        { icon: Mail, label: 'Email', value: user?.email },
        { icon: Phone, label: 'Phone', value: user?.phone },
    ];

    if (user?.role === 'LocalBusinessOwner') {
        profileFields.push({ icon: Store, label: 'Company Name', value: user?.companyName });
        profileFields.push({ icon: Shield, label: 'License Number', value: user?.licenseNumber });
        profileFields.push({ icon: FileText, label: 'Description', value: user?.description });
    }

    return (
        <div className="min-h-screen bg-dark-900 pt-20 pb-12 relative">
            <div className="container-custom max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-display font-bold text-white mb-2">
                        My <span className="bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent">Profile</span>
                    </h1>
                    <p className="text-white/50">Manage your account information</p>
                </div>

                {/* Profile Card */}
                <Card className="relative overflow-visible">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-3xl blur-xl opacity-50" />

                    <div className="relative">
                        {/* Avatar Section */}
                        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/10">
                            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-[0_0_40px_rgba(242,133,109,0.3)]">
                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{user?.companyName || user?.firstName + " " + user?.lastName}</h2>
                                <p className="text-white/50">{user?.email}</p>
                            </div>
                        </div>

                        {/* Profile Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {profileFields.map((field, index) => {
                                const Icon = field.icon;
                                return (
                                    <div key={index} className="group">
                                        <label className="flex items-center gap-2 text-sm font-medium text-white/50 mb-2">
                                            <Icon className="w-4 h-4 text-primary-400" />
                                            {field.label}
                                        </label>
                                        <p className="text-lg text-white bg-dark-700/50 px-4 py-3 rounded-xl border border-white/5">
                                            {field.value || '-'}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Actions */}
                        <div className="mt-8 pt-8 border-t border-white/10 flex flex-wrap gap-4">
                            <Button variant="outline" onClick={() => {
                                setEditData({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '', companyName: user?.companyName || '', description: user?.description || '' });
                                setActiveModal('edit');
                            }} className="flex items-center gap-2">
                                <Edit2 className="w-4 h-4" />
                                Edit Profile
                            </Button>
                            <Button variant="outline" onClick={() => setActiveModal('password')} className="flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                Change Password
                            </Button>
                            <div className="flex-grow"></div>
                            <Button variant="outline" onClick={() => setActiveModal('delete')} className="flex items-center gap-2 border-red-500/50 text-red-400 hover:bg-red-500/10">
                                <Trash2 className="w-4 h-4" />
                                Delete Account
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Modals */}
            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-sm">
                    <Card className="w-full max-w-md relative p-6">
                        <button onClick={closeModal} className="absolute top-4 right-4 text-white/50 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>

                        {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />}
                        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} className="mb-4" />}

                        {activeModal === 'edit' && (
                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                <h3 className="text-xl font-bold text-white mb-4">Edit Profile</h3>
                                <Input label="First Name" value={editData.firstName} onChange={e => setEditData({ ...editData, firstName: e.target.value })} icon={User} required />
                                <Input label="Last Name" value={editData.lastName} onChange={e => setEditData({ ...editData, lastName: e.target.value })} icon={User} required />
                                <Input label="Phone" type="tel" value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} icon={Phone} required />
                                {user?.role === 'LocalBusinessOwner' && (
                                    <>
                                        <Input label="Company Name" value={editData.companyName} onChange={e => setEditData({ ...editData, companyName: e.target.value })} icon={Store} required />
                                        <Input label="Description" value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} icon={FileText} />
                                    </>
                                )}
                                <Button type="submit" variant="primary" fullWidth loading={loading}>Save Changes</Button>
                            </form>
                        )}

                        {activeModal === 'password' && (
                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <h3 className="text-xl font-bold text-white mb-4">Change Password</h3>
                                <Input label="Current Password" type="password" value={passwordData.currentPassword} onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })} icon={Lock} required />
                                <Input label="New Password" type="password" value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} icon={Lock} required />
                                <Input label="Confirm New Password" type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} icon={Lock} required />
                                <Button type="submit" variant="primary" fullWidth loading={loading}>Change Password</Button>
                            </form>
                        )}

                        {activeModal === 'delete' && (
                            <form onSubmit={handleDeleteSubmit} className="space-y-4">
                                <h3 className="text-xl font-bold text-red-400 mb-4">Delete Account</h3>
                                <p className="text-white/70 text-sm mb-4">Warning: This action is permanent and cannot be undone. Please enter your password to confirm.</p>
                                <Input label="Password" type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} icon={Lock} required />
                                <Button type="submit" variant="primary" className="!bg-red-500 hover:!bg-red-600 !border-red-500" fullWidth loading={loading}>Permanently Delete Account</Button>
                            </form>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Profile;
