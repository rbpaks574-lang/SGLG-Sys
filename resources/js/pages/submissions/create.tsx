import { FormEvent, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import {
    Landmark,
    ShieldAlert,
    ShieldCheck,
    HeartHandshake,
    Store,
    Trees,
    UploadCloud,
    X,
    FileText,
    Image as ImageIcon,
    Calendar,
    ArrowLeft,
} from 'lucide-react';

type CategoryType = {
    id: number;
    code: string;
    name: string;
    description: string;
    icon: string;
    weight: number;
    is_core: boolean;
    document_requirements: Array<{
        id: number;
        name: string;
        frequency: string;
        description: string;
        is_mandatory: boolean;
    }>;
    deadlines: Array<{
        id: number;
        title: string;
        due_date: string;
        target_period: string;
    }>;
};

type Props = {
    categories: CategoryType[];
    userBarangay: {
        id: number;
        name: string;
        code: string;
    } | null;
};

export default function SubmissionCreate({ categories, userBarangay }: Props) {
    const [selectedCategory, setSelectedCategory] = useState<CategoryType>(categories[0] || null);
    const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        category_id: selectedCategory?.id || 1,
        title: '',
        description: '',
        requirements: [] as string[],
        files: [] as File[],
    });

    const getCategoryIcon = (code: string) => {
        switch (code) {
            case 'FIN':
                return <Landmark className="size-5 text-slate-700 dark:text-slate-300" />;
            case 'DIS':
                return <ShieldAlert className="size-5 text-slate-700 dark:text-slate-300" />;
            case 'PNO':
                return <ShieldCheck className="size-5 text-slate-700 dark:text-slate-300" />;
            case 'SOC':
                return <HeartHandshake className="size-5 text-slate-700 dark:text-slate-300" />;
            case 'BUS':
                return <Store className="size-5 text-slate-700 dark:text-slate-300" />;
            case 'ENV':
                return <Trees className="size-5 text-slate-700 dark:text-slate-300" />;
            default:
                return <FileText className="size-5 text-slate-700 dark:text-slate-300" />;
        }
    };

    const handleSelectCategory = (cat: CategoryType) => {
        setSelectedCategory(cat);
        setData('category_id', cat.id);
        setSelectedRequirements([]);
    };

    const toggleRequirement = (reqName: string) => {
        const updated = selectedRequirements.includes(reqName)
            ? selectedRequirements.filter((r) => r !== reqName)
            : [...selectedRequirements, reqName];

        setSelectedRequirements(updated);
        setData('requirements', updated);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const combined = [...uploadedFiles, ...newFiles];
            setUploadedFiles(combined);
            setData('files', combined);
        }
    };

    const handleRemoveFile = (index: number) => {
        const updated = uploadedFiles.filter((_, idx) => idx !== index);
        setUploadedFiles(updated);
        setData('files', updated);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/submissions', {
            forceFormData: true,
        });
    };

    const currentDeadline = selectedCategory?.deadlines?.[0];

    const formatBytes = (bytes: number) => {
        const kb = bytes / 1024;
        if (kb < 1024) return `${kb.toFixed(1)} KB`;
        return `${(kb / 1024).toFixed(1)} MB`;
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Submissions', href: '/submissions' }, { title: 'New Submission', href: '/submissions/create' }]}>
            <Head title="Submit Compliance Document - SGLG-SYS" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Link href="/submissions" className="btn btn-ghost btn-xs btn-circle">
                                <ArrowLeft className="size-4" />
                            </Link>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                SGLG Compliance Document Submission
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 ml-8">
                            Select an assessment area and attach your PDF, DOCX, or scanned proofs
                        </p>
                    </div>

                    <span className="badge badge-neutral font-semibold text-xs">
                        {userBarangay?.name || 'Barangay Submitter'}
                    </span>
                </div>

                {/* 2-Column Split */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* LEFT SIDE: 6 SGLGB Category Cards (5 cols) */}
                    <div className="lg:col-span-5 space-y-3">
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                            1. Select Governance Area
                        </div>

                        <div className="space-y-2">
                            {categories.map((cat) => {
                                const isSelected = selectedCategory?.id === cat.id;
                                return (
                                    <div
                                        key={cat.id}
                                        onClick={() => handleSelectCategory(cat)}
                                        className={`p-3.5 rounded-xl cursor-pointer transition-colors border text-left ${
                                            isSelected
                                                ? 'bg-slate-900 text-white border-slate-900 shadow-sm dark:bg-slate-800 dark:border-slate-700'
                                                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`p-2 rounded-lg ${isSelected ? 'bg-slate-800 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                                    {getCategoryIcon(cat.code)}
                                                </div>
                                                <div>
                                                    <h3 className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                                                        {cat.name}
                                                    </h3>
                                                    <span className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                                                        {cat.is_core ? `Core Area (${cat.weight}%)` : `Essential Area (${cat.weight}%)`}
                                                    </span>
                                                </div>
                                            </div>

                                            {isSelected && (
                                                <span className="badge badge-xs bg-slate-700 text-slate-200 font-semibold border-none">
                                                    SELECTED
                                                </span>
                                            )}
                                        </div>

                                        <p className={`text-[11px] mt-1.5 line-clamp-2 leading-relaxed ${isSelected ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {cat.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* RIGHT SIDE: Form (7 cols) */}
                    <div className="lg:col-span-7">
                        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
                            <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
                                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <span>2. Submission Details & Upload</span>
                                </h2>
                                <p className="text-[11px] text-slate-500">
                                    Selected Area: <strong className="text-slate-800 dark:text-slate-200">{selectedCategory?.name}</strong>
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                                {/* Fixed DILG Deadline Display (Non-Editable) */}
                                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="size-4 text-slate-500 shrink-0" />
                                        <div>
                                            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                                                Official DILG Deadline (Non-Editable)
                                            </span>
                                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                                {currentDeadline?.title || 'Q1 SGLG Compliance Submission'}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="badge badge-neutral badge-sm font-semibold">
                                        {currentDeadline ? new Date(currentDeadline.due_date).toLocaleDateString() : 'March 31, 2026'}
                                    </span>
                                </div>

                                {/* Required Documents Checklist (Checkboxes) */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Included Document Types (Tick all that apply):
                                    </label>
                                    <div className="space-y-1.5 max-h-48 overflow-y-auto p-2.5 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-800/40 dark:border-slate-700">
                                        {selectedCategory?.document_requirements?.map((req) => {
                                            const isChecked = selectedRequirements.includes(req.name);
                                            return (
                                                <label
                                                    key={req.id}
                                                    className="flex items-start gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleRequirement(req.name)}
                                                        className="checkbox checkbox-xs checkbox-neutral mt-0.5"
                                                    />
                                                    <div className="text-xs">
                                                        <span className="font-medium text-slate-800 dark:text-slate-200">
                                                            {req.name}
                                                        </span>
                                                        <span className="badge badge-ghost badge-xs ml-1.5 uppercase text-[9px]">
                                                            {req.frequency}
                                                        </span>
                                                        <p className="text-[10px] text-slate-400">{req.description}</p>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Submission Title */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Submission Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        required
                                        placeholder={`e.g. ${userBarangay?.name || 'Barangay'} ${selectedCategory?.name} Compliance Report`}
                                        className="input input-sm input-bordered w-full text-xs font-medium"
                                    />
                                    {errors.title && <p className="text-rose-500 text-[10px] mt-0.5">{errors.title}</p>}
                                </div>

                                {/* Description (Optional) */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Description & Notes (Optional)
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={2}
                                        placeholder="Add notes for DILG validators..."
                                        className="textarea textarea-bordered w-full text-xs font-normal"
                                    />
                                </div>

                                {/* Upload Files (Multi-file with individual X remove button) */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Attach Files (PDF, DOCX, JPG/PNG) *
                                    </label>

                                    <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-5 text-center hover:border-slate-400 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/30">
                                        <input
                                            type="file"
                                            multiple
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <UploadCloud className="size-8 text-slate-400 mx-auto mb-1" />
                                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            Click or drag files here to attach
                                        </p>
                                        <p className="text-[10px] text-slate-400">
                                            Supports PDF, DOCX, JPG, and PNG up to 25MB each
                                        </p>
                                    </div>
                                    {errors.files && <p className="text-rose-500 text-[10px] mt-0.5">{errors.files}</p>}

                                    {/* Uploaded File List with individual X button */}
                                    {uploadedFiles.length > 0 && (
                                        <div className="mt-2.5 space-y-1.5">
                                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                                                Attached Files ({uploadedFiles.length})
                                            </span>
                                            {uploadedFiles.map((file, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs dark:bg-slate-800 dark:border-slate-700"
                                                >
                                                    <div className="flex items-center gap-2 truncate">
                                                        {file.type.includes('image') ? (
                                                            <ImageIcon className="size-3.5 text-slate-500 shrink-0" />
                                                        ) : (
                                                            <FileText className="size-3.5 text-slate-500 shrink-0" />
                                                        )}
                                                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                                                            {file.name}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 shrink-0">
                                                            ({formatBytes(file.size)})
                                                        </span>
                                                    </div>

                                                    {/* Individual X button to remove file */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFile(index)}
                                                        className="btn btn-ghost btn-xs btn-circle text-slate-400 hover:text-rose-500"
                                                        title="Remove file"
                                                    >
                                                        <X className="size-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Form Actions */}
                                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <Link href="/submissions" className="btn btn-xs btn-ghost">
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing || uploadedFiles.length === 0}
                                        className="btn btn-sm btn-neutral text-xs font-semibold rounded-lg px-5"
                                    >
                                        {processing ? <span className="loading loading-spinner loading-xs" /> : 'Submit Compliance Report'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
