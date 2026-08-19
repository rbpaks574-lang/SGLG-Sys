import { Head, Link } from '@inertiajs/react';
import {
    Printer,
    ArrowLeft,
    CheckCircle2,
    Clock,
    FileCheck2,
    Shield,
    RotateCcw,
    Building2,
    QrCode,
    Award,
    FileText,
} from 'lucide-react';

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
        barangay: { id: number; name: string; code: string; captain_name?: string; secretary_name?: string };
        category: { id: number; name: string; code: string; weight: number; is_core?: boolean };
        user: { id: number; name: string; email: string };
        deadline?: { id: number; title: string; due_date: string; target_period?: string };
        files: Array<{ id: number; original_name: string; file_type: string; file_size: number; is_revision?: boolean }>;
        checklists: Array<{ id: number; requirement_name: string; is_checked: boolean }>;
        reviews: Array<{ id: number; action: string; remarks: string; created_at: string; checker: { name: string } }>;
    };
};

export default function SubmissionReceipt({ submission }: Props) {
    const handlePrint = () => {
        window.print();
    };

    const refNumber = `SGLG-2026-SIL-${String(submission.id).padStart(5, '0')}`;
    const submitDate = submission.submitted_at
        ? new Date(submission.submitted_at).toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
          })
        : 'N/A';

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-8 px-4 sm:px-6 font-sans text-slate-800 dark:text-slate-200">
            <Head title={`Official Filing E-Receipt - ${refNumber}`} />

            {/* Top Toolbar (Hidden on Print) */}
            <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
                <Link
                    href={`/submissions/${submission.id}`}
                    className="btn btn-sm btn-ghost gap-1.5 text-xs font-semibold"
                >
                    <ArrowLeft className="size-4" /> Back to Submission
                </Link>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="btn btn-sm btn-neutral gap-1.5 text-xs font-semibold shadow-sm"
                    >
                        <Printer className="size-4" /> Print / Save as PDF
                    </button>
                </div>
            </div>

            {/* Official Printable Receipt Certificate Card */}
            <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-lg p-8 sm:p-12 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none">
                {/* Official LGU & DILG Header */}
                <div className="text-center border-b-2 border-slate-800 dark:border-slate-300 pb-5 mb-6">
                    <p className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-serif">
                        Republic of the Philippines • Province of Cavite
                    </p>
                    <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-serif mt-0.5">
                        Municipality of Silang
                    </h2>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Department of the Interior and Local Government (DILG) — MLGOO
                    </p>
                    <div className="inline-block mt-3 px-4 py-1 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-[11px] font-mono font-bold tracking-wider uppercase">
                        Seal of Good Local Governance for Barangays (SGLGB)
                    </div>
                    <h1 className="text-base font-extrabold uppercase tracking-wide text-slate-900 dark:text-slate-100 mt-2 font-serif">
                        Official Electronic Filing Acknowledgment Receipt
                    </h1>
                </div>

                {/* Tracking Reference & Status Banner */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700 mb-6 text-xs">
                    <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                            Document Tracking Reference
                        </span>
                        <span className="font-mono text-base font-extrabold text-slate-900 dark:text-slate-100">
                            {refNumber}
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                            Filing Status
                        </span>
                        <span className="font-bold text-xs uppercase inline-flex items-center gap-1 text-slate-800 dark:text-slate-200">
                            {submission.status === 'verified' && <CheckCircle2 className="size-3.5 text-emerald-500" />}
                            {submission.status === 'returned' && <RotateCcw className="size-3.5 text-rose-500" />}
                            {submission.status === 'pending' && <Clock className="size-3.5 text-amber-500" />}
                            {submission.status.toUpperCase()} ({Number(submission.score || 0).toFixed(1)}%)
                        </span>
                    </div>
                </div>

                {/* 2-Column Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-6 border-b border-slate-200 dark:border-slate-800 pb-6">
                    <div className="space-y-2">
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Submitting LGU</span>
                            <strong className="text-slate-900 dark:text-slate-100 text-sm font-serif">
                                Barangay {submission.barangay?.name}
                            </strong>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Punong Barangay</span>
                            <span className="text-slate-800 dark:text-slate-200 font-medium">
                                Hon. {submission.barangay?.captain_name || 'Not specified'}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Barangay Secretary</span>
                            <span className="text-slate-800 dark:text-slate-200 font-semibold">
                                {submission.barangay?.secretary_name || submission.user?.name || 'Not specified'}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Governance Area / Pillar</span>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                                {submission.category?.name} ({submission.category?.code})
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Target Period / Deadline</span>
                            <span className="text-slate-800 dark:text-slate-200">
                                {submission.deadline?.title || 'Annual Governance Cycle'} ({submission.deadline?.target_period || '2026'})
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Official Timestamp</span>
                            <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
                                {submitDate}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Submitted Files List */}
                <div className="mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5">
                        Attached Document Evidence ({(submission.files || []).length} Files)
                    </h3>
                    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
                        <table className="table table-xs w-full">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                <tr>
                                    <th>#</th>
                                    <th>File Name</th>
                                    <th>Type</th>
                                    <th>Version</th>
                                    <th className="text-right">File Size</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(submission.files || []).map((f, i) => (
                                    <tr key={f.id} className="border-b border-slate-100 dark:border-slate-800">
                                        <td className="font-mono text-slate-400">{i + 1}</td>
                                        <td className="font-semibold text-slate-800 dark:text-slate-200">
                                            {f.original_name}
                                        </td>
                                        <td className="uppercase text-[10px] font-mono text-slate-500">{f.file_type}</td>
                                        <td>
                                            {f.is_revision ? (
                                                <span className="badge badge-warning badge-xs font-bold text-[9px]">v2.0 REVISED</span>
                                            ) : (
                                                <span className="badge badge-ghost badge-xs font-mono text-[9px]">v1.0 INITIAL</span>
                                            )}
                                        </td>
                                        <td className="text-right font-mono text-slate-600 dark:text-slate-400">
                                            {(f.file_size / 1024 / 1024).toFixed(2)} MB
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Compliance Verification Checklist */}
                {(submission.checklists || []).length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5">
                            Verified Governance Requirements
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {submission.checklists.map((c) => (
                                <div
                                    key={c.id}
                                    className="p-2 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 flex items-center justify-between"
                                >
                                    <span className="text-slate-800 dark:text-slate-200 font-medium truncate pr-2">
                                        {c.requirement_name}
                                    </span>
                                    {c.is_checked ? (
                                        <span className="badge badge-success badge-xs font-bold text-white shrink-0">VERIFIED</span>
                                    ) : (
                                        <span className="badge badge-ghost badge-xs text-slate-400 shrink-0">PENDING</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Certification & Signatures */}
                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-300 dark:border-slate-700 mt-8 text-xs">
                    <div className="text-center">
                        <div className="border-b border-slate-400 dark:border-slate-600 pb-1 mb-1 font-semibold text-slate-900 dark:text-slate-100">
                            {submission.barangay?.secretary_name || submission.user?.name || 'Barangay Secretary'}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            Submitting Barangay Secretary / Official
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="border-b border-slate-400 dark:border-slate-600 pb-1 mb-1 font-semibold text-slate-900 dark:text-slate-100">
                            DILG Silang Municipal Validation Officer
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            Authorized SGLGB Validator / Assessor
                        </p>
                    </div>
                </div>

                {/* System Generated Disclaimer */}
                <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-[10px] text-slate-400">
                    <p>
                        This is an official system-generated electronic filing receipt produced by the <strong>SGLG Document Submission & Analytics Portal of Silang, Cavite</strong>. No physical dry-stamp signature required for initial verification archiving.
                    </p>
                </div>
            </div>
        </div>
    );
}
