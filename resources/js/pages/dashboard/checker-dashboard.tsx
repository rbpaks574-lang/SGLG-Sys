import { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import {
    Clock,
    FileCheck2,
    CheckCircle2,
    RotateCcw,
    Eye,
    ArrowRight,
    Building2,
    Calendar,
    Activity,
    X,
    FileText,
    Image as ImageIcon,
    Download,
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
    barangay?: { id: number; name: string; code: string; captain_name?: string };
    category?: { id: number; name: string; code: string };
    user?: { id: number; name: string };
    files?: Array<{ id: number; original_name: string; file_type: string; file_size: number }>;
    checklists?: Array<{ id: number; requirement_name: string; is_checked: boolean }>;
};

type Props = {
    metrics: {
        pendingReview: number;
        underReview: number;
        verifiedToday: number;
        returnedToday: number;
    };
    pendingSubmissions: SubmissionItem[];
    recentActivity: Array<{
        id: number;
        action: string;
        remarks: string;
        created_at: string;
        checker_name?: string;
        barangay_name?: string;
        submission_title?: string;
        submission?: {
            id: number;
            title: string;
            barangay?: { name: string };
            category?: { name: string };
        };
    }>;
};

export default function CheckerDashboard({
    metrics,
    pendingSubmissions = [],
    recentActivity = [],
}: Props) {
    const page = usePage();
    const flash = page.props.flash as { success?: string; error?: string };

    const [reviewingSubmission, setReviewingSubmission] = useState<SubmissionItem | null>(null);
    const [selectedPreviewFile, setSelectedPreviewFile] = useState<{ id?: number; name: string; type?: string; size?: number; url?: string } | null>(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        action: 'verified' as 'verified' | 'returned' | 'under_review' | 'forwarded',
        remarks: '',
        score: 95.0,
        checklists: {} as Record<string, boolean>,
    });

    const openReviewModal = (sub: SubmissionItem) => {
        setReviewingSubmission(sub);
        const initialChecklists: Record<string, boolean> = {};
        if (sub.checklists && Array.isArray(sub.checklists)) {
            sub.checklists.forEach((c) => {
                initialChecklists[c.requirement_name] = c.is_checked;
            });
        }

        setData({
            action: 'verified',
            remarks: '',
            score: (sub.score && sub.score > 0) ? sub.score : 95.0,
            checklists: initialChecklists,
        });
    };

    const submitReviewAction = (actionType: 'verified' | 'returned' | 'under_review' | 'forwarded') => {
        if (!reviewingSubmission) return;

        data.action = actionType;
        post(`/submissions/${reviewingSubmission.id}/review`, {
            preserveScroll: true,
            onSuccess: () => {
                setReviewingSubmission(null);
                reset();
            },
        });
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Checker Dashboard', href: '/dashboard' }]}>
            <Head title="Checker & Validator Dashboard - SGLG-SYS" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
                {/* Flash Message Banner */}
                {flash?.success && (
                    <div className="alert alert-success shadow-sm rounded-xl text-white text-xs font-semibold py-2.5">
                        <CheckCircle2 className="size-4" />
                        <span>{flash.success}</span>
                    </div>
                )}

                {/* 4 Cards on Top */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {/* Card 1: Pending Review */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-[11px] font-semibold uppercase tracking-wider">Pending Review</span>
                            <Clock className="size-4 text-amber-500" />
                        </div>
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                            {metrics?.pendingReview ?? 0}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Submissions awaiting validation</div>
                    </div>

                    {/* Card 2: Under Review */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-[11px] font-semibold uppercase tracking-wider">Under Review</span>
                            <FileCheck2 className="size-4 text-sky-500" />
                        </div>
                        <div className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-1">
                            {metrics?.underReview ?? 0}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Currently being assessed</div>
                    </div>

                    {/* Card 3: Verified Today */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-[11px] font-semibold uppercase tracking-wider">Verified Today</span>
                            <CheckCircle2 className="size-4 text-emerald-500" />
                        </div>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                            {metrics?.verifiedToday ?? 0}
                        </div>
                        <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Approved compliance</div>
                    </div>

                    {/* Card 4: Returned Today */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-[11px] font-semibold uppercase tracking-wider">Returned Today</span>
                            <RotateCcw className="size-4 text-rose-500" />
                        </div>
                        <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                            {metrics?.returnedToday ?? 0}
                        </div>
                        <div className="text-[11px] text-rose-500 font-medium mt-0.5">Sent back for remarks</div>
                    </div>
                </div>

                {/* 2-Column Split: Pending Submissions (Left) | Recent Activity (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: Pending Submissions (7 cols) */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <Clock className="size-4 text-amber-500" /> Submissions Pending Validation
                                    </h3>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Documents from 64 barangays awaiting DILG review
                                    </p>
                                </div>
                                <Link
                                    href="/submissions"
                                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 dark:text-slate-400 dark:hover:text-slate-200"
                                >
                                    View All Submissions <ArrowRight className="size-3" />
                                </Link>
                            </div>

                            {pendingSubmissions.length === 0 ? (
                                <div className="text-center py-10">
                                    <CheckCircle2 className="size-8 text-emerald-500 mx-auto mb-2" />
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">All submissions are reviewed!</p>
                                    <p className="text-[11px] text-slate-400">No pending compliance reports at this time.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {pendingSubmissions.map((sub) => (
                                        <div
                                            key={sub.id}
                                            className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                        >
                                            <div className="space-y-1 max-w-md">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="badge badge-ghost badge-xs font-semibold text-[10px]">
                                                        {sub.category?.name || 'General Compliance'}
                                                    </span>
                                                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                                        <Building2 className="size-3 text-slate-400" />
                                                        {sub.barangay?.name || 'Barangay'}
                                                    </span>
                                                    {sub.is_late && (
                                                        <span className="badge badge-error badge-xs font-bold text-white">LATE</span>
                                                    )}
                                                </div>

                                                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                                    {sub.title}
                                                </h4>

                                                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                                                    <Calendar className="size-3" /> {new Date(sub.submitted_at).toLocaleString()}
                                                    <span>• {sub.files?.length || 0} file(s)</span>
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                                <button
                                                    type="button"
                                                    onClick={() => openReviewModal(sub)}
                                                    className="btn btn-xs btn-neutral font-semibold gap-1 rounded-lg"
                                                >
                                                    <Eye className="size-3" /> Review
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Recent Validator Activity (5 cols) */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <Activity className="size-4 text-slate-600 dark:text-slate-300" /> Recent Validator Activity
                                </h3>
                                <Link
                                    href="/logs"
                                    className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400"
                                >
                                    View Logs
                                </Link>
                            </div>

                            <div className="space-y-3">
                                {recentActivity.length === 0 ? (
                                    <p className="text-xs text-slate-400 py-4 text-center">No validation actions recorded today.</p>
                                ) : (
                                    recentActivity.map((act) => (
                                        <div
                                            key={act.id}
                                            className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs dark:bg-slate-800/40 dark:border-slate-700 space-y-1"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                    {act.submission?.barangay?.name || act.barangay_name || 'Barangay'}
                                                </span>
                                                <span className={`badge badge-xs font-bold ${
                                                    act.action === 'verified' ? 'badge-success text-white' : 'badge-error text-white'
                                                }`}>
                                                    {act.action.toUpperCase()}
                                                </span>
                                            </div>

                                            <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                                                {act.submission?.title || act.submission_title || 'Document Submission'}
                                            </p>

                                            {act.remarks && (
                                                <p className="text-[10px] text-slate-500 italic bg-white p-1.5 rounded border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                                                    "{act.remarks}"
                                                </p>
                                            )}

                                            <div className="text-[10px] text-slate-400 text-right">
                                                {act.created_at}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Checker Review Modal with Non-Blurred Overlay */}
            {reviewingSubmission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 animate-in fade-in duration-150 overflow-y-auto">
                    <div className="flex flex-col w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-900 text-white shrink-0">
                            <div>
                                <h3 className="text-sm font-bold flex items-center gap-2">
                                    <FileCheck2 className="size-4 text-sky-400" /> Review Compliance Document
                                </h3>
                                <p className="text-[11px] text-slate-300">
                                    {reviewingSubmission.barangay?.name || 'Barangay'} • {reviewingSubmission.category?.name || 'General'}
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

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs">
                            {/* Left: Files & Review Actions (7 cols) */}
                            <div className="lg:col-span-7 space-y-4">
                                <div>
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        1. Attached Documents ({reviewingSubmission.files?.length || 0})
                                    </h4>
                                    <div className="space-y-1.5">
                                        {(!reviewingSubmission.files || reviewingSubmission.files.length === 0) ? (
                                            <p className="text-slate-400 italic">No files attached.</p>
                                        ) : (
                                            reviewingSubmission.files.map((file) => (
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
                                                                });
                                                                setIsViewerOpen(true);
                                                            }}
                                                            className="btn btn-xs btn-outline text-xs"
                                                        >
                                                            Inspect
                                                        </button>
                                                        <a
                                                            href={`/files/${file.id}/download`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="btn btn-xs btn-ghost"
                                                        >
                                                            <Download className="size-3" />
                                                        </a>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            2. Validator Decision & Automated Scoring
                                        </h4>
                                        <span className="badge badge-info badge-xs font-semibold">AUTOMATIC SCORING</span>
                                    </div>

                                    {/* Automated Score Breakdown Box */}
                                    {(() => {
                                        const reqsList = reviewingSubmission.checklists || [];
                                        const totalReqs = reqsList.length > 0 ? reqsList.length : 1;
                                        const checkedCount = Object.values(data.checklists).filter(Boolean).length;
                                        const baseScore = Math.round((checkedCount / totalReqs) * 100 * 10) / 10;
                                        const latePenalty = reviewingSubmission.is_late ? 20.0 : 0.0;
                                        const automatedComputedScore = Math.max(0, Math.round((baseScore - latePenalty) * 10) / 10);

                                        return (
                                            <>
                                                <div className="p-3.5 rounded-xl bg-slate-100/90 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                                            Compliance Grade Breakdown
                                                        </span>
                                                        {reviewingSubmission.is_late ? (
                                                            <span className="badge badge-error badge-xs font-bold text-white">
                                                                LATE SUBMISSION (-20.0 pts)
                                                            </span>
                                                        ) : (
                                                            <span className="badge badge-success badge-xs font-bold text-white">
                                                                ON-TIME (No Penalty)
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-2 text-center">
                                                        <div className="p-2 rounded-lg bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                                                            <span className="text-[9px] text-slate-400 block font-medium">Base Criteria</span>
                                                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                                                {baseScore.toFixed(1)}%
                                                            </span>
                                                            <span className="text-[8px] text-slate-400 block">
                                                                ({checkedCount}/{totalReqs} criteria)
                                                            </span>
                                                        </div>

                                                        <div className="p-2 rounded-lg bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                                                            <span className="text-[9px] text-slate-400 block font-medium">Late Penalty</span>
                                                            <span className={`text-xs font-bold ${reviewingSubmission.is_late ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                                {reviewingSubmission.is_late ? '-20.0 pts' : '0 pts'}
                                                            </span>
                                                            <span className="text-[8px] text-slate-400 block">
                                                                {reviewingSubmission.is_late ? 'Overdue' : 'On-Time'}
                                                            </span>
                                                        </div>

                                                        <div className="p-2 rounded-lg bg-slate-900 text-white dark:bg-slate-800 dark:border-slate-700">
                                                            <span className="text-[9px] text-slate-300 block font-semibold">Final Grade</span>
                                                            <span className="text-sm font-extrabold text-white">
                                                                {automatedComputedScore.toFixed(1)}%
                                                            </span>
                                                            <span className="text-[8px] text-slate-300 block">Auto-computed</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                        Checker Remarks
                                                    </label>
                                                    <textarea
                                                        value={data.remarks}
                                                        onChange={(e) => setData('remarks', e.target.value)}
                                                        rows={2}
                                                        placeholder="Enter compliance notes or return reasons..."
                                                        className="textarea textarea-bordered w-full text-xs font-medium"
                                                    />
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                                    <button
                                                        type="button"
                                                        disabled={processing}
                                                        onClick={() => submitReviewAction('verified')}
                                                        className="btn btn-sm btn-success text-white font-semibold text-xs gap-1.5 rounded-lg shadow-sm"
                                                    >
                                                        <CheckCircle2 className="size-3.5" /> Approve & Verify ({automatedComputedScore.toFixed(1)}%)
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={processing}
                                                        onClick={() => submitReviewAction('returned')}
                                                        className="btn btn-sm btn-error text-white font-semibold text-xs gap-1.5 rounded-lg shadow-sm"
                                                    >
                                                        <RotateCcw className="size-3.5" /> Return With Remarks
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={processing}
                                                        onClick={() => submitReviewAction('under_review')}
                                                        className="btn btn-sm btn-ghost text-xs"
                                                    >
                                                        Mark Under Review
                                                    </button>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Right: Quick Checklist (5 cols) */}
                            <div className="lg:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 space-y-3">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    Validation Checklist (Tick verified criteria)
                                </h4>

                                <div className="space-y-1.5">
                                    {(!reviewingSubmission.checklists || reviewingSubmission.checklists.length === 0) ? (
                                        <p className="text-slate-400 text-center py-2">No checklist items recorded.</p>
                                    ) : (
                                        reviewingSubmission.checklists.map((item, idx) => {
                                            const isChecked = Boolean(data.checklists[item.requirement_name]);
                                            return (
                                                <label
                                                    key={idx}
                                                    className="flex items-start gap-2 p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition-colors"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={(e) => {
                                                            setData('checklists', {
                                                                ...data.checklists,
                                                                [item.requirement_name]: e.target.checked,
                                                            });
                                                        }}
                                                        className="checkbox checkbox-xs checkbox-success mt-0.5"
                                                    />
                                                    <div className="text-xs">
                                                        <span className={`font-medium ${isChecked ? 'text-slate-900 dark:text-slate-100 font-semibold' : 'text-slate-500'}`}>
                                                            {item.requirement_name}
                                                        </span>
                                                        {isChecked && (
                                                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold ml-1.5">
                                                                ✓ Verified
                                                            </span>
                                                        )}
                                                    </div>
                                                </label>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Viewer Modal */}
            <DocumentViewerModal
                isOpen={isViewerOpen}
                onClose={() => setIsViewerOpen(false)}
                file={selectedPreviewFile}
            />
        </AppSidebarLayout>
    );
}
