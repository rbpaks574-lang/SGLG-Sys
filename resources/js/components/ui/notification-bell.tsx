import { useEffect, useState } from 'react';
import { Bell, Check, ExternalLink, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from '@inertiajs/react';
import apiClient from '@/lib/axios';

type NotificationItem = {
    id: number;
    title: string;
    message: string;
    type: string;
    link?: string;
    is_read: boolean;
    created_at: string;
};

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await apiClient.get('/api/notifications');
            setNotifications(res.data.notifications || []);
            setUnreadCount(res.data.unreadCount || 0);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id: number) => {
        try {
            await apiClient.post(`/api/notifications/${id}/read`);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            setLoading(true);
            await apiClient.post('/api/notifications/read-all');
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />;
            case 'warning':
            case 'error':
                return <AlertTriangle className="size-3.5 text-amber-500 shrink-0 mt-0.5" />;
            default:
                return <Info className="size-3.5 text-slate-500 shrink-0 mt-0.5" />;
        }
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="relative btn btn-ghost btn-circle btn-xs text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                aria-label="Notifications"
            >
                <Bell className="size-4" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 badge badge-neutral badge-xs px-1 text-[9px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 sm:w-88 rounded-xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-800/50">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-slate-800 dark:text-slate-100">
                                    Notifications
                                </span>
                                {unreadCount > 0 && (
                                    <span className="badge badge-neutral badge-xs text-[10px]">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    disabled={loading}
                                    className="text-[11px] text-slate-600 hover:text-slate-900 font-medium hover:underline flex items-center gap-1 dark:text-slate-400"
                                >
                                    <Check className="size-3" /> Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                            {notifications.length === 0 ? (
                                <div className="p-6 text-center text-xs text-slate-400">
                                    No notifications.
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => !n.is_read && markAsRead(n.id)}
                                        className={`flex items-start gap-2.5 p-3 transition-colors cursor-pointer text-xs ${
                                            n.is_read
                                                ? 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/60'
                                                : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        {getIcon(n.type)}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs ${n.is_read ? 'font-medium text-slate-700 dark:text-slate-300' : 'font-bold text-slate-900 dark:text-slate-100'}`}>
                                                {n.title}
                                            </p>
                                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 dark:text-slate-400">
                                                {n.message}
                                            </p>
                                            {n.link && (
                                                <Link
                                                    href={n.link}
                                                    onClick={() => setIsOpen(false)}
                                                    className="inline-flex items-center gap-1 text-[10px] text-slate-700 hover:underline mt-1 font-medium dark:text-slate-300"
                                                >
                                                    View Details <ExternalLink className="size-2.5" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
