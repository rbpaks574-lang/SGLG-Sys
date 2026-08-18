import { FormEvent, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import {
    History,
    Search,
    Filter,
    RotateCcw,
    CheckCircle2,
    Clock,
    Send,
    FileText,
    Eye,
    Calendar,
    ArrowRight,
} from 'lucide-react';
import DocumentViewerModal from '@/components/ui/document-viewer-modal';

type SubmissionItem = {
    id: number;
    title: string;
    description?: string;
    status: string;
    score: number;
    is_late: boolean;
    submitted_at: string;
    category: { id: number; name: string; code: string };
    files: Array<{ id: number; original_name: string; file_type: string; file_size: number }>;
    reviews: Array<{ id: number; action: string; remarks: string; created_at: string; checker: { name: string } }>;
};

type Props = {
    submissions: {
        data: SubmissionItem[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    categories: Array<{ id: number; name: string; code: string }>;
    filters: {
        search: string;
        status: string;
        category: string;
    };
};

export default function HistoryIndex({ submissions, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [category, setCategory] = useState(filters.category || 'all');

    const [selectedFile, setSelectedFile] = useState<{ id?: number; name: string; type?: string; size?: number; url?: string } | null>(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    const handleFilter = (e: FormEvent) => {
        e.preventDefault();
        router.get('/history', {
            search,
            status,
            category,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('all');
        setCategory('all');
        router.get('/history');
    };

    const getStatusBadge = (statusStr: string) => {
        switch (statusStr) {
            case 'verified':
                return <span className="badge badge-success badge-sm text-white font-semibold gap-1"><CheckCircle2 className="size-3" /> Verified</span>;
            case 'returned':
                return <span className="badge badge-error badge-sm text-white font-semibold gap-1"><RotateCcw className="size-3" /> Returned</span>;
            case 'forwarded':
                return <span className="badge badge-info badge-sm font-semibold gap-1"><Send className="size-3" /> Forwarded</span>;
            case 'under_review':
                return <span className="badge badge-warning badge-sm font-semibold gap-1"><Clock className="size-3" /> Under Review</span>;
            default:
                return <span className="badge badge-neutral badge-sm font-semibold gap-1"><Clock className="size-3" /> Pending</span>;
        }
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'History & Tracking', href: '/history' }]}>
            <Head title="Submission History - SGLG-SYS" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <History className="size-5 text-slate-600 dark:text-slate-300" /> Submission History & Tracking
                    </h1>
                    <p className="text-xs text-slate-500">
                        Review all past uploads, verification status, and checker feedback
                    </p>
                </div>

                {/* Filter Toolbar */}
                <form onSubmit={handleFilter} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Search</label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 size-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search title..."
                                    className="input input-sm input-bordered w-full pl-8 text-xs font-medium"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="select select-sm select-bordered w-full text-xs font-medium"
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="under_review">Under Review</option>
                                <option value="verified">Verified</option>
                                <option value="returned">Returned</option>
                                <option value="forwarded">Forwarded</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="select select-sm select-bordered w-full text-xs font-medium"
                            >
                                <option value="all">All 6 Categories</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="btn btn-xs btn-ghost text-xs text-slate-500"
                        >
                            <RotateCcw className="size-3" /> Reset
                        </button>
                        <button
                            type="submit"
                            className="btn btn-xs btn-neutral font-semibold gap-1 rounded-lg"
                        >
                            <Filter className="size-3" /> Apply Filter
                        </button>
                    </div>
                </form>

                {/* Submissions List */}
                <div className="space-y-3">
                    {submissions.data.length === 0 ? (
                        <div className="text-center py-10 rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                            <FileText className="size-8 text-slate-300 mx-auto mb-1.5" />
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No submissions recorded.</p>
                        </div>
                    ) : (
                        submissions.data.map((sub) => (
                            <div
                                key={sub.id}
                                className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                                <div className="space-y-1.5 max-w-2xl">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="badge badge-ghost badge-sm text-[10px] font-semibold">
                                            {sub.category.name}
                                        </span>
                                        {getStatusBadge(sub.status)}
                                        {sub.score > 0 && (
                                            <span className="badge badge-neutral badge-sm font-semibold font-mono">
                                                Score: {sub.score.toFixed(1)}%
                                            </span>
                                        )}
                                        {sub.is_late && (
                                            <span className="badge badge-error badge-xs text-white font-bold">
                                                LATE
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                                        {sub.title}
                                    </h3>

                                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                                        <Calendar className="size-3" />
                                        Submitted: {new Date(sub.submitted_at).toLocaleString()}
                                    </p>

                                    {/* Latest Checker Remarks */}
                                    {sub.reviews.length > 0 && sub.reviews[0].remarks && (
                                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs dark:bg-slate-800/60 dark:border-slate-700 mt-1">
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                                Feedback ({sub.reviews[0].checker?.name}):
                                            </span>
                                            <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                                                "{sub.reviews[0].remarks}"
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                    {sub.files.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedFile({
                                                    id: sub.files[0].id,
                                                    name: sub.files[0].original_name,
                                                    type: sub.files[0].file_type,
                                                    size: sub.files[0].file_size,
                                                });
                                                setIsViewerOpen(true);
                                            }}
                                            className="btn btn-xs btn-outline text-xs gap-1"
                                        >
                                            <Eye className="size-3" /> View File
                                        </button>
                                    )}
                                    <Link
                                        href={`/submissions/${sub.id}`}
                                        className="btn btn-xs btn-neutral font-semibold text-xs gap-1 rounded-lg"
                                    >
                                        Details <ArrowRight className="size-3" />
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {submissions.total > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3.5 rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-xs text-slate-500">
                        <div>
                            Showing <strong>{submissions.from}</strong> to <strong>{submissions.to}</strong> of <strong>{submissions.total}</strong> results
                        </div>

                        <div className="join">
                            {submissions.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    preserveScroll
                                    preserveState
                                    className={`join-item btn btn-xs ${
                                        link.active
                                            ? 'btn-neutral font-semibold'
                                            : link.url
                                            ? 'btn-ghost'
                                            : 'btn-disabled opacity-40'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Document Viewer Modal */}
            <DocumentViewerModal
                isOpen={isViewerOpen}
                onClose={() => setIsViewerOpen(false)}
                file={selectedFile}
            />
        </AppSidebarLayout>
    );
}
