import { FormEvent, useEffect, useState, useRef } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import {
    Search,
    RotateCcw,
    Eye,
    Plus,
    FileCheck2,
    CheckCircle2,
    Clock,
    Send,
    Building2,
    FileText,
    Image as ImageIcon,
    Download,
    X,
    Loader2,
    ExternalLink,
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
    barangay: { id: number; name: string; code: string; captain_name?: string };
    category: { id: number; name: string; code: string; weight: number };
    user: { id: number; name: string; email: string };
    deadline?: { id: number; title: string; due_date: string };
    files: Array<{ id: number; original_name: string; file_type: string; file_size: number; file_path: string }>;
    checklists: Array<{ id: number; requirement_name: string; is_checked: boolean }>;
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
    filters: {
        search: string;
        status: string;
        category: string;
        barangay: string;
        sort: string;
    };
    barangays: Array<{ id: number; name: string; code: string }>;
    categories: Array<{ id: number; name: string; code: string }>;
    canReview: boolean;
};

export default function SubmissionsIndex({
    submissions,
    filters,
    barangays,
    categories,
    canReview,
}: Props) {
    const page = usePage();
    const flash = page.props.flash as { success?: string; error?: string };

    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [category, setCategory] = useState(filters.category || 'all');
    const [barangay, setBarangay] = useState(filters.barangay || 'all');
    const [sort, setSort] = useState(filters.sort || 'latest');
    const [isSearching, setIsSearching] = useState(false);

    // Track previously requested filter values to prevent pagination clicks from re-triggering search
    const prevFilters = useRef({
        search: filters.search || '',
        status: filters.status || 'all',
        category: filters.category || 'all',
        barangay: filters.barangay || 'all',
        sort: filters.sort || 'latest',
    });

    // Review Modal State
    const [reviewingSubmission, setReviewingSubmission] = useState<SubmissionItem | null>(null);
    const [selectedPreviewFile, setSelectedPreviewFile] = useState<{ id?: number; name: string; type?: string; size?: number; url?: string } | null>(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    // Review Form State
    const { data: reviewData, setData: setReviewData, post: postReview, processing: reviewProcessing, reset: resetReview } = useForm({
        action: 'verified' as 'verified' | 'returned' | 'under_review' | 'forwarded',
        remarks: '',
        score: 95.0,
        checklists: {} as Record<string, boolean>,
    });

    // Real-time live filtering on change ONLY when user modifies filters
    useEffect(() => {
        const hasChanged =
            prevFilters.current.search !== search ||
            prevFilters.current.status !== status ||
            prevFilters.current.category !== category ||
            prevFilters.current.barangay !== barangay ||
            prevFilters.current.sort !== sort;

        if (!hasChanged) {
            return;
        }

        prevFilters.current = { search, status, category, barangay, sort };

        setIsSearching(true);
        const timer = setTimeout(() => {
            router.get(
                '/submissions',
                {
                    search,
                    status,
                    category,
                    barangay,
                    sort,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    onFinish: () => setIsSearching(false),
                }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search, status, category, barangay, sort]);

    const handleReset = () => {
        setSearch('');
        setStatus('all');
        setCategory('all');
        setBarangay('all');
        setSort('latest');
        prevFilters.current = { search: '', status: 'all', category: 'all', barangay: 'all', sort: 'latest' };
        router.get('/submissions', {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const openReviewModal = (sub: SubmissionItem) => {
        setReviewingSubmission(sub);
        const initialChecklists: Record<string, boolean> = {};
        if (sub.checklists && Array.isArray(sub.checklists)) {
            sub.checklists.forEach((c) => {
                initialChecklists[c.requirement_name] = c.is_checked;
            });
        }

        setReviewData({
            action: 'verified',
            remarks: '',
            score: (sub.score && sub.score > 0) ? sub.score : 95.0,
            checklists: initialChecklists,
        });
    };

    const submitReviewAction = (actionType: 'verified' | 'returned' | 'under_review' | 'forwarded') => {
        if (!reviewingSubmission) return;

        reviewData.action = actionType;
        postReview(`/submissions/${reviewingSubmission.id}/review`, {
            preserveScroll: true,
            onSuccess: () => {
                setReviewingSubmission(null);
                resetReview();
            },
        });
    };

    const quickPreviewFirstFile = (sub: SubmissionItem) => {
        if (!sub.files || sub.files.length === 0) return;
        const file = sub.files[0];
        setSelectedPreviewFile({
            id: file.id,
            name: file.original_name,
            type: file.file_type,
            size: file.file_size,
            url: `/files/${file.id}/preview`,
        });
        setIsViewerOpen(true);
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

    const statusPills = [
        { key: 'all', label: 'All Submissions' },
        { key: 'pending', label: 'Pending' },
        { key: 'under_review', label: 'Under Review' },
        { key: 'verified', label: 'Verified' },
        { key: 'returned', label: 'Returned' },
        { key: 'forwarded', label: 'Forwarded' },
    ];

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Submissions Queue', href: '/submissions' }]}>
            <Head title="Submissions Management - SGLG-SYS" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
                {/* Flash Banner */}
                {flash?.success && (
                    <div className="alert alert-success text-white text-xs font-semibold py-2.5 rounded-xl shadow-sm">
                        <CheckCircle2 className="size-4" />
                        <span>{flash.success}</span>
                    </div>
                )}

                {/* Page Title & New Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <FileCheck2 className="size-5 text-slate-600 dark:text-slate-300" /> SGLG Document Submissions
                        </h1>
                        <p className="text-xs text-slate-500">
                            Search, filter, inspect attachments, and validate barangay compliance reports
                        </p>
                    </div>

                    <Link
                        href="/submissions/create"
                        className="btn btn-sm btn-neutral font-semibold text-xs gap-1.5 rounded-lg px-4"
                    >
                        <Plus className="size-3.5" /> New Submission
                    </Link>
                </div>

                {/* Status Quick Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {statusPills.map((pill) => (
                        <button
                            key={pill.key}
                            type="button"
                            onClick={() => setStatus(pill.key)}
                            className={`btn btn-xs rounded-lg text-xs font-semibold transition-all shrink-0 ${
                                status === pill.key
                                    ? 'btn-neutral shadow-sm'
                                    : 'btn-ghost text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                            }`}
                        >
                            {pill.label}
                        </button>
                    ))}
                </div>

                {/* Filter & Live Search Toolbar */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {/* Search Bar with Live Debounce */}
                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Search</label>
                            <div className="relative">
                                {isSearching ? (
                                    <Loader2 className="absolute left-2.5 top-2.5 size-3.5 text-sky-500 animate-spin" />
                                ) : (
                                    <Search className="absolute left-2.5 top-2.5 size-3.5 text-slate-400" />
                                )}
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Title or Barangay..."
                                    className="input input-sm input-bordered w-full pl-8 text-xs font-medium bg-slate-50 dark:bg-slate-800"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="select select-sm select-bordered w-full text-xs font-medium bg-slate-50 dark:bg-slate-800"
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="under_review">Under Review</option>
                                <option value="verified">Verified</option>
                                <option value="returned">Returned</option>
                                <option value="forwarded">Forwarded</option>
                            </select>
                        </div>

                        {/* Barangay Filter (All 64 Barangays) */}
                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Barangay (64 LGUs)</label>
                            <select
                                value={barangay}
                                onChange={(e) => setBarangay(e.target.value)}
                                className="select select-sm select-bordered w-full text-xs font-medium bg-slate-50 dark:bg-slate-800"
                            >
                                <option value="all">All 64 Barangays</option>
                                {barangays.map((b) => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Governance Area</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="select select-sm select-bordered w-full text-xs font-medium bg-slate-50 dark:bg-slate-800"
                            >
                                <option value="all">All 6 Categories</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date Sort */}
                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Date Sort</label>
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="select select-sm select-bordered w-full text-xs font-medium bg-slate-50 dark:bg-slate-800"
                            >
                                <option value="latest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                            </select>
                        </div>
                    </div>

                    {/* Reset Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                        <span>
                            Showing <strong>{submissions.total}</strong> total submission records
                        </span>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="btn btn-xs btn-ghost text-slate-500 hover:text-slate-900 text-xs gap-1"
                        >
                            <RotateCcw className="size-3" /> Reset Filters
                        </button>
                    </div>
                </div>

                {/* Submissions Data Table */}
                <div className="rounded-xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table table-sm w-full">
                            <thead className="bg-slate-50 border-b border-slate-200 dark:bg-slate-800/60 dark:border-slate-700 text-slate-500 text-[10px] uppercase tracking-wider">
                                <tr>
                                    <th>Document Title</th>
                                    <th>Barangay</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                    <th>Attached Files</th>
                                    <th>Submitted</th>
                                    <th>Score</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                {submissions.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-10 text-center text-slate-400">
                                            No matching submissions found for the selected criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    submissions.data.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                                            <td className="max-w-[220px]">
                                                <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                                    {sub.title}
                                                </div>
                                                <div className="text-[10px] text-slate-400 truncate">
                                                    by {sub.user?.name}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                                    <Building2 className="size-3 text-slate-400" />
                                                    <span>{sub.barangay?.name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge badge-ghost badge-sm text-[10px]">
                                                    {sub.category?.code || sub.category?.name}
                                                </span>
                                            </td>
                                            <td>{getStatusBadge(sub.status)}</td>
                                            <td>
                                                {sub.files && sub.files.length > 0 ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => quickPreviewFirstFile(sub)}
                                                        className="badge badge-neutral hover:badge-primary badge-xs gap-1 cursor-pointer font-medium"
                                                        title="Click to inspect PDF document"
                                                    >
                                                        <FileText className="size-2.5" />
                                                        {sub.files.length} file(s) • Inspect
                                                    </button>
                                                ) : (
                                                    <span className="text-slate-400 text-[11px] italic">No files</span>
                                                )}
                                            </td>
                                            <td className="text-slate-500 text-[11px]">
                                                {new Date(sub.submitted_at).toLocaleDateString()}
                                                {sub.is_late && (
                                                    <span className="badge badge-error badge-xs ml-1 text-white font-bold">LATE</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                    {sub.score > 0 ? `${sub.score.toFixed(1)}%` : '—'}
                                                </span>
                                            </td>
                                            <td className="text-right space-x-1">
                                                {canReview ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => openReviewModal(sub)}
                                                        className="btn btn-xs btn-neutral font-semibold rounded-lg gap-1"
                                                    >
                                                        <Eye className="size-3" /> Review
                                                    </button>
                                                ) : (
                                                    <Link
                                                        href={`/submissions/${sub.id}`}
                                                        className="btn btn-xs btn-ghost text-slate-600 hover:text-slate-900 gap-1"
                                                    >
                                                        <Eye className="size-3" /> Details
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3.5 border-t border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/60 text-xs text-slate-500">
                        <div>
                            Showing <strong className="text-slate-800 dark:text-slate-200">{submissions.from || 0}</strong> to{' '}
                            <strong className="text-slate-800 dark:text-slate-200">{submissions.to || 0}</strong> of{' '}
                            <strong className="text-slate-800 dark:text-slate-200">{submissions.total}</strong> results (14 per page)
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
                </div>
            </div>

            {/* Checker Review Modal */}
            {reviewingSubmission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 animate-in fade-in duration-150 overflow-y-auto">
                    <div className="flex flex-col w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-900 text-white shrink-0">
                            <div>
                                <h3 className="text-sm font-bold flex items-center gap-2">
                                    <FileCheck2 className="size-4 text-sky-400" /> Review Compliance Document
                                </h3>
                                <p className="text-[11px] text-slate-300">
                                    {reviewingSubmission.barangay.name} • {reviewingSubmission.category.name}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setReviewingSubmission(null)}
                                className="btn btn-ghost btn-circle btn-xs text-white"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        {/* Split Modal Body */}
                        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs">
                            {/* Left: Attached Files & Decision Form (7 cols) */}
                            <div className="lg:col-span-7 space-y-4">
                                <div>
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        1. Attached Files ({reviewingSubmission.files.length})
                                    </h4>
                                    <div className="space-y-1.5">
                                        {reviewingSubmission.files.map((file) => (
                                            <div
                                                key={file.id}
                                                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                                            >
                                                <div className="flex items-center gap-2 truncate">
                                                    {file.file_type === 'image' ? (
                                                        <ImageIcon className="size-4 text-slate-500 shrink-0" />
                                                    ) : (
                                                        <FileText className="size-4 text-slate-600 shrink-0" />
                                                    )}
                                                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                                        {file.original_name}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1 shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedPreviewFile({
                                                                id: file.id,
                                                                name: file.original_name,
                                                                type: file.file_type,
                                                                size: file.file_size,
                                                                url: `/files/${file.id}/preview`,
                                                            });
                                                            setIsViewerOpen(true);
                                                        }}
                                                        className="btn btn-xs btn-outline text-xs gap-1"
                                                    >
                                                        <Eye className="size-3" /> Inspect
                                                    </button>
                                                    <a
                                                        href={`/files/${file.id}/preview`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="btn btn-xs btn-ghost text-xs"
                                                        title="Open in new tab"
                                                    >
                                                        <ExternalLink className="size-3" />
                                                    </a>
                                                    <a
                                                        href={`/files/${file.id}/download`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="btn btn-xs btn-ghost text-xs"
                                                        title="Download"
                                                    >
                                                        <Download className="size-3" />
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        2. Validator Decision & Remarks
                                    </h4>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                            Checker Remarks
                                        </label>
                                        <textarea
                                            value={reviewData.remarks}
                                            onChange={(e) => setReviewData('remarks', e.target.value)}
                                            rows={3}
                                            placeholder="Enter feedback or return notes..."
                                            className="textarea textarea-bordered w-full text-xs font-medium bg-slate-50 dark:bg-slate-800"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                            Score (0 - 100%)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.5"
                                            value={reviewData.score}
                                            onChange={(e) => setReviewData('score', parseFloat(e.target.value))}
                                            className="input input-sm input-bordered w-32 text-xs font-bold bg-slate-50 dark:bg-slate-800"
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap items-center gap-2 pt-2">
                                        <button
                                            type="button"
                                            disabled={reviewProcessing}
                                            onClick={() => submitReviewAction('verified')}
                                            className="btn btn-sm btn-success text-white font-semibold text-xs gap-1.5 rounded-lg"
                                        >
                                            <CheckCircle2 className="size-3.5" /> Approve & Verify
                                        </button>

                                        <button
                                            type="button"
                                            disabled={reviewProcessing}
                                            onClick={() => submitReviewAction('returned')}
                                            className="btn btn-sm btn-error text-white font-semibold text-xs gap-1.5 rounded-lg"
                                        >
                                            <RotateCcw className="size-3.5" /> Return With Remarks
                                        </button>

                                        <button
                                            type="button"
                                            disabled={reviewProcessing}
                                            onClick={() => submitReviewAction('under_review')}
                                            className="btn btn-sm btn-ghost text-xs"
                                        >
                                            Mark Under Review
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Submission Details & Quick Checklist (5 cols) */}
                            <div className="lg:col-span-5 space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200 dark:bg-slate-800/40 dark:border-slate-700">
                                <div>
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        Details
                                    </h4>
                                    <div className="space-y-1.5 text-xs">
                                        <div className="flex justify-between py-0.5">
                                            <span className="text-slate-500">Barangay:</span>
                                            <strong className="text-slate-800 dark:text-slate-100">{reviewingSubmission.barangay.name}</strong>
                                        </div>
                                        <div className="flex justify-between py-0.5">
                                            <span className="text-slate-500">Submitted By:</span>
                                            <span className="text-slate-700 dark:text-slate-300">{reviewingSubmission.user.name}</span>
                                        </div>
                                        <div className="flex justify-between py-0.5">
                                            <span className="text-slate-500">Area:</span>
                                            <span className="badge badge-ghost badge-xs">{reviewingSubmission.category.name}</span>
                                        </div>
                                        <div className="flex justify-between py-0.5">
                                            <span className="text-slate-500">Status:</span>
                                            {getStatusBadge(reviewingSubmission.status)}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        Validation Checklist
                                    </h4>

                                    <div className="space-y-1.5">
                                        {reviewingSubmission.checklists.length === 0 ? (
                                            <p className="text-slate-400 text-center py-2">No checklist requirements recorded.</p>
                                        ) : (
                                            reviewingSubmission.checklists.map((item, i) => {
                                                const isChecked = reviewData.checklists[item.requirement_name] ?? item.is_checked;
                                                return (
                                                    <label
                                                        key={i}
                                                        className="flex items-start gap-2 p-1 rounded hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={(e) => {
                                                                setReviewData('checklists', {
                                                                    ...reviewData.checklists,
                                                                    [item.requirement_name]: e.target.checked,
                                                                });
                                                            }}
                                                            className="checkbox checkbox-xs checkbox-success mt-0.5"
                                                        />
                                                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                                                            {item.requirement_name}
                                                        </span>
                                                    </label>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Viewer Modal with Real PDF Preview and Open in New Tab */}
            <DocumentViewerModal
                isOpen={isViewerOpen}
                onClose={() => setIsViewerOpen(false)}
                file={selectedPreviewFile}
            />
        </AppSidebarLayout>
    );
}
