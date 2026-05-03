import api from '../api/axios';

class NotificationService {
    async getNotifications(params = {}) {
        try {
            const response = await api.get('/notifications', { params });
            return { success: true, ...response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch notifications',
            };
        }
    }

    async getUnreadCount() {
        try {
            const response = await api.get('/notifications/unread-count');
            return { success: true, unreadCount: response.data.unreadCount };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch unread count',
            };
        }
    }

    async markAsRead(id) {
        try {
            const response = await api.put(`/notifications/${id}/read`);
            return { success: true, notification: response.data.notification };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to update notification',
            };
        }
    }

    async markAllAsRead() {
        try {
            await api.put('/notifications/read-all');
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to mark all as read',
            };
        }
    }

    async deleteNotification(id) {
        try {
            await api.delete(`/notifications/${id}`);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to delete notification',
            };
        }
    }

    async clearRead() {
        try {
            await api.delete('/notifications/clear-read');
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to clear read notifications',
            };
        }
    }
}

export default new NotificationService();
