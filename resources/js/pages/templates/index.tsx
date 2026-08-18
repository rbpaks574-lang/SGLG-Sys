import { FormEvent, useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import {
    FileCode2,
    Plus,
    Download,
    Trash2,
    CheckCircle2,
    FileText,
    X,
} from 'lucide-react';
import AlertModal from '@/components/ui/alert-modal';

type TemplateItem = {
    id: number;
    name: string;
    description?: string;
    file_name: string;
    file_size: number;
    created_at: string;
    category?: { id: number; name: string };
    user?: { name: string };
};

type Props = {
    templates: {
        data: TemplateItem[];
        current_page: number;
        last_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    categories: Array<{ id: number; name: string; code: string }>;
    canManage: boolean;
};

export default function TemplatesIndex({ templates, categories, canManage }: Props) {
    const page = usePage();
    const flash = page.props.flash as { success?: string; error?: string };

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [deletingTemplate, setDeletingTemplate] = useState<TemplateItem | null>(null);

    // New Template Form
    const { data, setData, post, processing, errors, reset, delete: destroy } = useForm({
        name: '',
        description: '',
        category_id: categories[0]?.id || '',
        file: null as File | null,
    });

    const handleCreate = (e: FormEvent) => {
        e.preventDefault();
        post('/templates', {
            forceFormData: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            },
        });
    };

    const handleDelete = () => {
        if (!deletingTemplate) return;
        destroy(`/templates/${deletingTemplate.id}`, {
            onSuccess: () => setDeletingTemplate(null),
        });
    };

    const formatBytes = (bytes: number) => {
        const kb = bytes / 1024;
        if (kb < 1024) return `${kb.toFixed(1)} KB`;
        return `${(kb / 1024).toFixed(1)} MB`;
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Document Templates', href: '/templates' }]}>
            <Head title="Document Templates - SGLG-SYS" />

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
                            <FileCode2 className="size-5 text-slate-600 dark:text-slate-300" /> SGLG Document Templates
                        </h1>
                        <p className="text-xs text-slate-500">
                            Download standardized DILG formats (DOCX/PDF) to draft your barangay compliance reports
                        </p>
                    </div>

                    {canManage && (
                        <button
                            type="button"
                            onClick={() => setIsCreateOpen(true)}
                            className="btn btn-sm btn-neutral text-xs font-semibold gap-1.5 rounded-lg px-4"
                        >
                            <Plus className="size-3.5" /> New Template
                        </button>
                    )}
                </div>

                {/* Data Table */}
                <div className="rounded-xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table table-sm w-full">
                            <thead className="bg-slate-50 border-b border-slate-200 dark:bg-slate-800/60 dark:border-slate-700 text-slate-500 text-[10px] uppercase tracking-wider">
                                <tr>
                                    <th>Template Name</th>
                                    <th>Category</th>
                                    <th>Description</th>
                                    <th>Format & Size</th>
                                    <th>Created By</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                {templates.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-10 text-center text-slate-400">
                                            No document templates available yet.
                                        </td>
                                    </tr>
                                ) : (
                                    templates.data.map((t) => (
                                        <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                                            <td className="font-semibold text-slate-900 dark:text-slate-100 max-w-[200px]">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="size-4 text-slate-500 shrink-0" />
                                                    <span className="truncate">{t.name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge badge-ghost badge-sm text-[10px]">
                                                    {t.category?.name || 'General'}
                                                </span>
                                            </td>
                                            <td className="text-slate-500 dark:text-slate-400 max-w-xs truncate">
                                                {t.description || 'Standard form'}
                                            </td>
                                            <td>
                                                <span className="badge badge-neutral badge-xs font-mono text-[9px]">
                                                    {t.file_name.endsWith('.docx') ? 'DOCX' : 'PDF'} • {formatBytes(t.file_size)}
                                                </span>
                                            </td>
                                            <td className="text-slate-500 text-[11px]">
                                                {t.user?.name || 'DILG Admin'}
                                            </td>
                                            <td className="text-right space-x-1">
                                                <a
                                                    href={`/templates/${t.id}/download`}
                                                    className="btn btn-xs btn-outline text-xs gap-1"
                                                >
                                                    <Download className="size-3" /> Download
                                                </a>
                                                {canManage && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeletingTemplate(t)}
                                                        className="btn btn-ghost btn-xs text-rose-500 hover:text-rose-700"
                                                    >
                                                        <Trash2 className="size-3" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* New Template Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 animate-in fade-in duration-150">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800 flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-4 bg-slate-900 text-white shrink-0">
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                <FileCode2 className="size-4 text-sky-400" /> New Document Template
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsCreateOpen(false)}
                                className="btn btn-ghost btn-circle btn-xs text-white"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-5 space-y-3.5 text-xs overflow-y-auto flex-1">
                            {/* Template Name */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Template Name *
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    placeholder="e.g. 2026 Budget Ordinance Form"
                                    className="input input-sm input-bordered w-full text-xs font-medium bg-slate-50 border-slate-200 focus:bg-white dark:bg-slate-800 dark:border-slate-700"
                                />
                                {errors.name && <p className="text-rose-500 text-[10px] mt-0.5">{errors.name}</p>}
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Category *
                                </label>
                                <select
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', e.target.value)}
                                    required
                                    className="select select-sm select-bordered w-full text-xs font-medium bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                                >
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={2}
                                    placeholder="Brief template description..."
                                    className="textarea textarea-bordered w-full text-xs font-medium bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                                />
                            </div>

                            {/* Upload DOCX File */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Upload DOCX / PDF File *
                                </label>
                                <input
                                    type="file"
                                    accept=".docx,.doc,.pdf"
                                    required
                                    onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)}
                                    className="file-input file-input-bordered file-input-sm w-full text-xs"
                                />
                                {errors.file && <p className="text-rose-500 text-[10px] mt-0.5">{errors.file}</p>}
                            </div>

                            {/* Form Actions */}
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
                                    className="btn btn-sm btn-neutral text-xs font-semibold rounded-lg px-4"
                                >
                                    {processing ? <span className="loading loading-spinner loading-xs" /> : 'Create Template'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deletingTemplate && (
                <AlertModal
                    isOpen={Boolean(deletingTemplate)}
                    onClose={() => setDeletingTemplate(null)}
                    onConfirm={handleDelete}
                    type="error"
                    title="Delete Template"
                    description={`Are you sure you want to delete "${deletingTemplate.name}"?`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    showCancel={true}
                />
            )}
        </AppSidebarLayout>
    );
}
