import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell,
    CheckCheck,
    Trash2,
    ExternalLink,
    Filter,
    Loader2,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import notificationService from '../services/notificationService';

const priorityStyle = {
    high: 'bg-red-500/15 text-red-400 border-red-500/30',
    medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    low: 'bg-white/5 text-white/50 border-white/10',
};

const formatType = (type) =>
    type
        ? type
              .split('_')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ')
        : '';

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadOnly, setUnreadOnly] = useState(false);
    const [alert, setAlert] = useState(null);
    const [busyId, setBusyId] = useState(null);

    const fetchList = useCallback(
        async (pageNum, append, unread) => {
            const isFirst = !append;
            if (isFirst) setLoading(true);
            else setLoadingMore(true);

            const result = await notificationService.getNotifications({
                page: pageNum,
                limit: 20,
                unreadOnly: unread ? 'true' : 'false',
            });

            if (result.success) {
                setUnreadCount(result.unreadCount ?? 0);
                setTotalPages(result.totalPages || 1);
                setNotifications((prev) =>
                    append ? [...prev, ...result.notifications] : result.notifications
                );
            } else {
                setAlert({ type: 'error', message: result.error });
            }

            setLoading(false);
            setLoadingMore(false);
        },
        []
    );

    useEffect(() => {
        setPage(1);
        fetchList(1, false, unreadOnly);
    }, [unreadOnly, fetchList]);

    const loadMore = () => {
        if (page >= totalPages || loadingMore) return;
        const next = page + 1;
        setPage(next);
        fetchList(next, true, unreadOnly);
    };

    const refresh = () => {
        setPage(1);
        fetchList(1, false, unreadOnly);
    };

    const handleOpen = async (n) => {
        if (!n.isRead) {
            setBusyId(n._id);
            const result = await notificationService.markAsRead(n._id);
            setBusyId(null);
            if (!result.success) {
                setAlert({ type: 'error', message: result.error });
                return;
            }
            setNotifications((prev) =>
                prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x))
            );
            setUnreadCount((c) => Math.max(0, c - 1));
        }
        if (n.actionUrl) {
            if (/^https?:\/\//i.test(n.actionUrl)) {
                window.open(n.actionUrl, '_blank', 'noopener,noreferrer');
            } else {
                navigate(n.actionUrl);
            }
        }
    };

    const handleMarkAllRead = async () => {
        const result = await notificationService.markAllAsRead();
        if (!result.success) {
            setAlert({ type: 'error', message: result.error });
            return;
        }
        setAlert({ type: 'success', message: 'All notifications marked as read.' });
        refresh();
    };

    const handleClearRead = async () => {
        if (!window.confirm('Remove all read notifications? This cannot be undone.')) return;
        const result = await notificationService.clearRead();
        if (!result.success) {
            setAlert({ type: 'error', message: result.error });
            return;
        }
        setAlert({ type: 'success', message: 'Read notifications cleared.' });
        refresh();
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        const toRemove = notifications.find((x) => x._id === id);
        setBusyId(id);
        const result = await notificationService.deleteNotification(id);
        setBusyId(null);
        if (!result.success) {
            setAlert({ type: 'error', message: result.error });
            return;
        }
        setNotifications((prev) => prev.filter((x) => x._id !== id));
        if (toRemove && !toRemove.isRead) {
            setUnreadCount((c) => Math.max(0, c - 1));
        }
    };

    return (
        <div className="min-h-screen bg-dark-900 pt-20 pb-12">
            <div className="container-custom max-w-3xl">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-display font-bold text-white mb-2 flex items-center gap-3">
                            <Bell className="w-9 h-9 text-primary-400 shrink-0" />
                            <span>
                                <span className="bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent">
                                    Notifications
                                </span>
                            </span>
                        </h1>
                        <p className="text-white/50">
                            {unreadOnly
                                ? 'Unread messages and alerts'
                                : 'Stay updated on bookings, reviews, and account activity'}
                            {unreadCount > 0 && (
                                <span className="text-primary-400 ml-2">
                                    · {unreadCount} unread
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={unreadOnly ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setUnreadOnly(!unreadOnly)}
                            className="inline-flex items-center gap-2"
                        >
                            <Filter className="w-4 h-4" />
                            {unreadOnly ? 'Show all' : 'Unread only'}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleMarkAllRead}
                            disabled={unreadCount === 0}
                            className="inline-flex items-center gap-2"
                        >
                            <CheckCheck className="w-4 h-4" />
                            Mark all read
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearRead}
                            className="inline-flex items-center gap-2 text-white/70"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear read
                        </Button>
                    </div>
                </div>

                {alert && (
                    <Alert
                        type={alert.type}
                        message={alert.message}
                        onClose={() => setAlert(null)}
                        className="mb-6"
                    />
                )}

                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-12 h-12 rounded-full border-4 border-primary-500/30 border-t-primary-500 animate-spin mx-auto mb-4" />
                        <p className="text-white/50">Loading notifications...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <Card className="relative overflow-visible">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 rounded-3xl blur-xl opacity-50" />
                        <div className="relative text-center py-16">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-500/10 to-secondary-500/10 flex items-center justify-center">
                                <Bell className="w-12 h-12 text-primary-400 opacity-50" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                                {unreadOnly ? 'No unread notifications' : 'No notifications yet'}
                            </h3>
                            <p className="text-white/50 max-w-md mx-auto">
                                When something important happens—bookings, reviews, or
                                messages—you will see it here.
                            </p>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((n) => {
                            const pri = priorityStyle[n.priority] || priorityStyle.medium;
                            const opening = busyId === n._id;
                            return (
                                <Card
                                    key={n._id}
                                    padding={false}
                                    className={`p-4 sm:p-5 cursor-pointer transition-all border ${
                                        n.isRead
                                            ? 'border-white/5 bg-dark-800/40'
                                            : 'border-primary-500/20 bg-primary-500/5'
                                    } hover:border-primary-500/40`}
                                    onClick={() => handleOpen(n)}
                                >
                                    <div className="flex gap-4">
                                        <div className="shrink-0 mt-0.5">
                                            {opening ? (
                                                <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />
                                            ) : (
                                                <div
                                                    className={`w-2.5 h-2.5 rounded-full mt-1.5 ${
                                                        n.isRead ? 'bg-white/20' : 'bg-primary-400'
                                                    }`}
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                                                <h3 className="text-lg font-semibold text-white pr-2">
                                                    {n.title}
                                                </h3>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span
                                                        className={`text-xs px-2 py-0.5 rounded-full border ${pri}`}
                                                    >
                                                        {n.priority || 'medium'}
                                                    </span>
                                                    <span className="text-xs text-white/40 whitespace-nowrap">
                                                        {formatType(n.type)}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-white/60 text-sm leading-relaxed mb-2">
                                                {n.message}
                                            </p>
                                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/35">
                                                <time dateTime={n.createdAt}>
                                                    {n.createdAt
                                                        ? new Date(n.createdAt).toLocaleString()
                                                        : ''}
                                                </time>
                                                <div className="flex items-center gap-3">
                                                    {n.actionUrl && (
                                                        <span className="inline-flex items-center gap-1 text-primary-400/90">
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                            Open
                                                        </span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleDelete(n._id, e)}
                                                        className="inline-flex items-center gap-1 text-red-400/90 hover:text-red-400"
                                                        disabled={opening}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}

                        {page < totalPages && (
                            <div className="pt-4 text-center">
                                <Button
                                    variant="outline"
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                >
                                    {loadingMore ? 'Loading...' : 'Load more'}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
