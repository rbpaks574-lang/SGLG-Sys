import { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    Download,
    Eye,
    FileCheck2,
    FileText,
    History,
    Image as ImageIcon,
    RotateCcw,
    Send,
    Shield,
} from 'lucide-react';
import DocumentViewerModal from '@/components/ui/document-viewer-modal';

type Props = {
    submission: {
        id: number;
        title: string;
        description?: string;
        status: string;
        score: number;
        is_late: boolean;
        submitted_at: string;
        verified_at?: string;
        barangay: { id: number; name: string; code: string; captain_name?: string };
        category: { id: number; name: string; code: string; weight: number };
        user: { id: number; name: string; email: string };
        verifier?: { id: number; name: string };
        deadline?: { id: number; title: string; due_date: string };
        files: Array<{ id: number; original_name: string; file_type: string; file_size: number; file_path: string }>;
        checklists: Array<{ id: number; requirement_name: string; is_checked: boolean }>;
        reviews: Array<{ id: number; action: string; remarks: string; created_at: string; checker: { name: string } }>;
    };
};

export default function SubmissionShow({ submission }: Props) {
    const page = usePage();
    const user = page.props.auth?.user;
    const canReview = user?.role === 'admin' || user?.role === 'checker';

    const [selectedFile, setSelectedFile] = useState<{ id?: number; name: string; type?: string; size?: number; url?: string } | null>(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    const initialChecklists: Record<string, boolean> = {};
    (submission?.checklists || []).forEach((c) => {
        initialChecklists[c.requirement_name] = Boolean(c.is_checked);
    });

    const [checklistState, setChecklistState] = useState<Record<string, boolean>>(initialChecklists);

    const { data, setData, post, processing } = useForm({
        action: 'verified' as 'verified' | 'returned' | 'under_review' | 'forwarded',
        remarks: '',
        checklists: initialChecklists,
    });

    const toggleChecklist = (reqName: string) => {
        const updated = {
            ...checklistState,
            [reqName]: !checklistState[reqName],
        };
        setChecklistState(updated);
        setData('checklists', updated);
    };

    // Calculate automated score
    const checklistsList = submission?.checklists || [];
    const totalRequirements = checklistsList.length > 0 ? checklistsList.length : 1;
    const checkedCount = Object.values(checklistState).filter(Boolean).length;
    const baseScore = Math.round((checkedCount / totalRequirements) * 100 * 10) / 10;
    const latePenalty = submission?.is_late ? 10.0 : 0.0;
    const automatedCalculatedScore = Math.max(0, Math.round((baseScore - latePenalty) * 10) / 10);

    const submitReview = (actionType: 'verified' | 'returned' | 'under_review' | 'forwarded') => {
        data.action = actionType;
        post(`/submissions/${submission.id}/review`);
    };

    const getStatusBadge = (statusStr: string) => {
        switch (statusStr) {
            case 'verified':
                return <span className="badge badge-success text-white font-semibold gap-1"><CheckCircle2 className="size-3" /> Verified</span>;
            case 'returned':
                return <span className="badge badge-error text-white font-semibold gap-1"><RotateCcw className="size-3" /> Returned</span>;
            case 'forwarded':
                return <span className="badge badge-info font-semibold gap-1"><Send className="size-3" /> Forwarded</span>;
            case 'under_review':
                return <span className="badge badge-warning font-semibold gap-1"><Clock className="size-3" /> Under Review</span>;
            default:
                return <span className="badge badge-neutral font-semibold gap-1"><Clock className="size-3" /> Pending</span>;
        }
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Submissions', href: '/submissions' }, { title: `#${submission.id} Details`, href: `/submissions/${submission.id}` }]}>
            <Head title={`Submission #${submission.id} - ${submission.title}`} />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
                {/* Top Nav */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <Link href="/submissions" className="btn btn-ghost btn-circle btn-sm">
                            <ArrowLeft className="size-4" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <FileCheck2 className="size-5 text-slate-600 dark:text-slate-300" />
                                {submission?.title || 'Submission Details'}
                            </h1>
                            <p className="text-xs text-slate-500">
                                {submission?.barangay?.name || 'Barangay'} • {submission?.category?.name || 'General Area'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {getStatusBadge(submission?.status || 'pending')}
                        {submission?.is_late && (
                            <span className="badge badge-error badge-sm text-white font-bold">
                                LATE SUBMISSION
                            </span>
                        )}
                        {(submission?.score ?? 0) > 0 && (
                            <span className="badge badge-neutral font-semibold text-xs font-mono">
                                Verified Score: {Number(submission.score).toFixed(1)}%
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: Files & Validator Action (8 cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Files Inspection */}
                        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
                                Attached Compliance Files ({(submission?.files || []).length})
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {(submission?.files || []).map((file) => (
                                    <div
                                        key={file.id}
                                        className="p-3 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 flex flex-col justify-between"
                                    >
                                        <div className="flex items-start gap-2.5 mb-2.5">
                                            {file.file_type === 'image' ? (
                                                <ImageIcon className="size-4 text-slate-500 shrink-0 mt-0.5" />
                                            ) : (
                                                <FileText className="size-4 text-slate-600 shrink-0 mt-0.5" />
                                            )}
                                            <div className="truncate">
                                                <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">
                                                    {file.original_name}
                                                </p>
                                                <span className="text-[10px] text-slate-400 uppercase">
                                                    {file.file_type}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedFile({
                                                        id: file.id,
                                                        name: file.original_name,
                                                        type: file.file_type,
                                                        size: file.file_size,
                                                    });
                                                    setIsViewerOpen(true);
                                                }}
                                                className="btn btn-xs btn-outline text-xs gap-1"
                                            >
                                                <Eye className="size-3" /> View
                                            </button>
                                            <a
                                                href={`/files/${file.id}/download`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="btn btn-xs btn-ghost text-xs"
                                            >
                                                <Download className="size-3" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Reviewer Action Form (Only for Checker / Admin) */}
                        {canReview && (
                            <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <Shield className="size-4 text-slate-600 dark:text-slate-300" /> DILG Validation Assessment & Automated Scoring
                                    </h3>
                                    <span className="badge badge-info badge-xs font-semibold">AUTOMATIC SCORING</span>
                                </div>

                                {/* Checklist verification for checker */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Verify Compliance Criteria (Tick verified requirements):
                                    </label>
                                    <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-800/40 dark:border-slate-700">
                                        {(submission?.checklists || []).map((c) => {
                                            const isChecked = Boolean(checklistState[c.requirement_name]);
                                            return (
                                                <label
                                                    key={c.id}
                                                    className="flex items-start gap-2.5 p-1.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleChecklist(c.requirement_name)}
                                                        className="checkbox checkbox-xs checkbox-success mt-0.5"
                                                    />
                                                    <div className="text-xs">
                                                        <span className={`font-medium ${isChecked ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500'}`}>
                                                            {c.requirement_name}
                                                        </span>
                                                        {isChecked && (
                                                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold ml-2">
                                                                ✓ Verified
                                                            </span>
                                                        )}
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Automated Score Breakdown Box */}
                                <div className="p-4 rounded-xl bg-slate-100/80 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700 space-y-2.5">
                                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                        Automated Score Breakdown
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center dark:bg-slate-900 dark:border-slate-800">
                                            <span className="text-[10px] text-slate-400 block font-medium">Base Criteria Score</span>
                                            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                                {baseScore.toFixed(1)}%
                                            </span>
                                            <span className="text-[9px] text-slate-400 block">
                                                ({checkedCount}/{totalRequirements} criteria)
                                            </span>
                                        </div>

                                        <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center dark:bg-slate-900 dark:border-slate-800">
                                            <span className="text-[10px] text-slate-400 block font-medium">Late Penalty</span>
                                            <span className={`text-sm font-bold ${submission?.is_late ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                {submission?.is_late ? '-10.0 pts' : '0 pts'}
                                            </span>
                                            <span className="text-[9px] text-slate-400 block">
                                                {submission?.is_late ? 'Late Submission Deduction' : 'Submitted On-Time'}
                                            </span>
                                        </div>

                                        <div className="p-2.5 rounded-lg bg-slate-900 text-white text-center dark:bg-slate-800 dark:border-slate-700">
                                            <span className="text-[10px] text-slate-300 block font-semibold">Final Automated Score</span>
                                            <span className="text-base font-extrabold text-white">
                                                {automatedCalculatedScore.toFixed(1)}%
                                            </span>
                                            <span className="text-[9px] text-slate-300 block">Calculated Automatically</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Checker Remarks & Feedback
                                    </label>
                                    <textarea
                                        value={data.remarks}
                                        onChange={(e) => setData('remarks', e.target.value)}
                                        rows={3}
                                        placeholder="Add comments or feedback for the barangay secretary..."
                                        className="textarea textarea-bordered w-full text-xs font-medium"
                                    />
                                </div>

                                <div className="flex flex-wrap items-center gap-2 pt-2">
                                    <button
                                        type="button"
                                        disabled={processing}
                                        onClick={() => submitReview('verified')}
                                        className="btn btn-sm btn-success text-white font-semibold text-xs gap-1.5 rounded-lg shadow-sm"
                                    >
                                        <CheckCircle2 className="size-3.5" /> Approve & Verify ({automatedCalculatedScore.toFixed(1)}%)
                                    </button>

                                    <button
                                        type="button"
                                        disabled={processing}
                                        onClick={() => submitReview('returned')}
                                        className="btn btn-sm btn-error text-white font-semibold text-xs gap-1.5 rounded-lg shadow-sm"
                                    >
                                        <RotateCcw className="size-3.5" /> Return With Remarks
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Review History */}
                        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-3">
                                <History className="size-4 text-slate-600 dark:text-slate-300" /> Review History & Feedback
                            </h3>

                            <div className="space-y-2.5">
                                {(submission?.reviews || []).length === 0 ? (
                                    <p className="text-xs text-slate-400 py-2">No review remarks yet.</p>
                                ) : (
                                    submission.reviews.map((r) => (
                                        <div
                                            key={r.id}
                                            className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs dark:bg-slate-800/60 dark:border-slate-700"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                    by {r.checker?.name || 'Validator'}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {r.created_at ? new Date(r.created_at).toLocaleString() : ''}
                                                </span>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-300">
                                                {r.remarks}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Submission Info & Checklist (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                                Details
                            </h3>

                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">Barangay:</span>
                                    <strong className="text-slate-800 dark:text-slate-200">{submission?.barangay?.name || 'N/A'}</strong>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">Barangay Captain:</span>
                                    <span className="text-slate-700 dark:text-slate-300">{submission?.barangay?.captain_name || 'Not set'}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">Barangay Secretary:</span>
                                    <span className="text-slate-700 dark:text-slate-300 font-semibold">{submission?.barangay?.secretary_name || 'Not set'}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">Submitted By:</span>
                                    <span className="text-slate-700 dark:text-slate-300">{submission?.user?.name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">Area / Category:</span>
                                    <span className="badge badge-ghost badge-sm">{submission?.category?.name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">Submission Date:</span>
                                    <span className="text-slate-700 dark:text-slate-300">{submission?.submitted_at ? new Date(submission.submitted_at).toLocaleDateString() : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-500">Timeliness:</span>
                                    {submission?.is_late ? (
                                        <span className="badge badge-error badge-xs font-bold text-white">LATE (-10 pts)</span>
                                    ) : (
                                        <span className="badge badge-success badge-xs font-bold text-white">ON-TIME</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Checklist */}
                        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                                Validation Checklist
                            </h3>

                            <div className="space-y-1.5">
                                {(submission?.checklists || []).map((c, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 text-xs dark:bg-slate-800/40"
                                    >
                                        <CheckCircle2 className={`size-3.5 ${c.is_checked ? 'text-emerald-500' : 'text-slate-300'}`} />
                                        <span className={`font-medium ${c.is_checked ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                                            {c.requirement_name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
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
