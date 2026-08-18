import { FormEvent, useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import {
    Megaphone,
    Plus,
    Calendar,
    Pin,
    Download,
    Trash2,
    CheckCircle2,
    X,
    FileText,
    Eye,
} from 'lucide-react';
import AlertModal from '@/components/ui/alert-modal';

type AnnouncementItem = {
    id: number;
    title: string;
    content: string;
    target_role: string;
    is_pinned: boolean;
    attachment_name?: string;
    attachment_path?: string;
    created_at: string;
    user?: { name: string };
};

type Props = {
    announcements: {
        data: AnnouncementItem[];
        current_page: number;
        last_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    canManage: boolean;
};

export default function AnnouncementsIndex({ announcements, canManage }: Props) {
    const page = usePage();
    const flash = page.props.flash as { success?: string; error?: string };

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);
    const [deletingAnnouncement, setDeletingAnnouncement] = useState<AnnouncementItem | null>(null);

    const { data, setData, post, processing, reset, delete: destroy } = useForm({
        title: '',
        content: '',
        target_role: 'all',
        is_pinned: false,
    });

    const handleCreate = (e: FormEvent) => {
        e.preventDefault();
        post('/announcements', {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            },
        });
    };

    const handleDelete = () => {
        if (!deletingAnnouncement) return;
        destroy(`/announcements/${deletingAnnouncement.id}`, {
            onSuccess: () => setDeletingAnnouncement(null),
        });
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Announcements', href: '/announcements' }]}>
            <Head title="DILG Announcements - SGLG-SYS" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
                {/* Flash Banner */}
                {flash?.success && (
                    <div className="alert alert-success text-white text-xs font-semibold py-2.5 rounded-xl shadow-sm">
                        <CheckCircle2 className="size-4" />
                        <span>{flash.success}</span>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <Megaphone className="size-5 text-slate-600 dark:text-slate-300" /> DILG Broadcast Announcements & Memos
                        </h1>
                        <p className="text-xs text-slate-500">
                            Circulars and compliance advisories from DILG Silang
                        </p>
                    </div>

                    {canManage && (
                        <button
                            type="button"
                            onClick={() => setIsCreateOpen(true)}
                            className="btn btn-sm btn-neutral text-xs font-semibold gap-1.5 rounded-lg px-4"
                        >
                            <Plus className="size-3.5" /> New Announcement
                        </button>
                    )}
                </div>

                {/* Announcements Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {announcements.data.map((a) => (
                        <div
                            key={a.id}
                            className={`p-4 rounded-xl bg-white border shadow-sm transition-all flex flex-col justify-between dark:bg-slate-900 ${
                                a.is_pinned
                                    ? 'border-slate-400 dark:border-slate-600'
                                    : 'border-slate-200 dark:border-slate-800'
                            }`}
                        >
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-1.5">
                                        {a.is_pinned && (
                                            <span className="badge badge-neutral badge-xs font-semibold gap-1">
                                                <Pin className="size-2.5" /> PINNED
                                            </span>
                                        )}
                                        <span className="badge badge-ghost badge-xs uppercase text-[9px] font-mono">
                                            {a.target_role}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                        <Calendar className="size-3" /> {new Date(a.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5 leading-snug">
                                    {a.title}
                                </h3>

                                <p className="text-xs text-slate-500 line-clamp-3 dark:text-slate-400 leading-relaxed">
                                    {a.content}
                                </p>
                            </div>

                            {/* Card Footer Actions with Read More Button */}
                            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                                <span className="text-[10px] text-slate-400">
                                    Posted by DILG Admin
                                </span>

                                <div className="flex items-center gap-2">
                                    {canManage && (
                                        <button
                                            type="button"
                                            onClick={() => setDeletingAnnouncement(a)}
                                            className="btn btn-ghost btn-xs text-rose-500 hover:text-rose-700"
                                        >
                                            <Trash2 className="size-3" />
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedAnnouncement(a)}
                                        className="btn btn-xs btn-outline text-xs gap-1"
                                    >
                                        <Eye className="size-3" /> Read More
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create Announcement Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 animate-in fade-in duration-150">
                    <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
                        <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                <Megaphone className="size-4 text-sky-400" /> New Broadcast Announcement
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsCreateOpen(false)}
                                className="btn btn-ghost btn-circle btn-xs text-white"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-5 space-y-3 text-xs">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    required
                                    placeholder="Announcement Title"
                                    className="input input-sm input-bordered w-full text-xs font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Target Audience *
                                </label>
                                <select
                                    value={data.target_role}
                                    onChange={(e) => setData('target_role', e.target.value)}
                                    className="select select-sm select-bordered w-full text-xs font-medium"
                                >
                                    <option value="all">All Portal Users</option>
                                    <option value="barangay">Barangay Submitters Only</option>
                                    <option value="checker">Checkers Only</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Content / Advisory Message *
                                </label>
                                <textarea
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    required
                                    rows={4}
                                    placeholder="Write full circular content..."
                                    className="textarea textarea-bordered w-full text-xs font-medium"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.is_pinned}
                                    onChange={(e) => setData('is_pinned', e.target.checked)}
                                    className="checkbox checkbox-xs checkbox-neutral"
                                />
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                    Pin announcement to the top
                                </span>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="btn btn-xs btn-ghost"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="btn btn-sm btn-neutral text-xs font-semibold rounded-lg"
                                >
                                    Publish
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Read More Modal */}
            {selectedAnnouncement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 animate-in fade-in duration-150">
                    <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
                        <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                <Megaphone className="size-4 text-sky-400" />
                                {selectedAnnouncement.title}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setSelectedAnnouncement(null)}
                                className="btn btn-ghost btn-circle btn-xs text-white"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        <div className="p-5 space-y-3 text-xs">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-100 pb-2 dark:border-slate-800">
                                <span>Published: {new Date(selectedAnnouncement.created_at).toLocaleDateString()}</span>
                                <span className="badge badge-ghost badge-xs uppercase font-mono">
                                    Audience: {selectedAnnouncement.target_role}
                                </span>
                            </div>

                            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line dark:text-slate-200">
                                {selectedAnnouncement.content}
                            </p>
                        </div>

                        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end dark:border-slate-800 dark:bg-slate-800/40">
                            <button
                                type="button"
                                onClick={() => setSelectedAnnouncement(null)}
                                className="btn btn-xs btn-ghost"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deletingAnnouncement && (
                <AlertModal
                    isOpen={Boolean(deletingAnnouncement)}
                    onClose={() => setDeletingAnnouncement(null)}
                    onConfirm={handleDelete}
                    type="error"
                    title="Delete Announcement"
                    description={`Are you sure you want to delete "${deletingAnnouncement.title}"?`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    showCancel={true}
                />
            )}
        </AppSidebarLayout>
    );
}
