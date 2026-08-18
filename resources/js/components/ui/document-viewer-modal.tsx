import { Download, ExternalLink, FileText, Image as ImageIcon, X } from 'lucide-react';

type FileProp = {
    id?: number;
    name: string;
    type?: string;
    size?: number;
    url?: string;
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    file: FileProp | null;
};

export default function DocumentViewerModal({ isOpen, onClose, file }: Props) {
    if (!isOpen || !file) return null;

    const fileUrl = file.url || (file.id ? `/files/${file.id}/preview` : '#');
    const downloadUrl = file.id ? `/files/${file.id}/download` : fileUrl;
    const isImage = file.type?.includes('image') || file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    const isPdf = file.type?.includes('pdf') || file.name.match(/\.pdf$/i);

    const formatBytes = (bytes?: number) => {
        if (!bytes) return '';
        const kb = bytes / 1024;
        if (kb < 1024) return `${kb.toFixed(1)} KB`;
        return `${(kb / 1024).toFixed(1)} MB`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 animate-in fade-in duration-150">
            <div className="flex flex-col w-full max-w-5xl h-[88vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-900 text-white shrink-0">
                    <div className="flex items-center gap-2.5 truncate">
                        {isImage ? (
                            <ImageIcon className="size-4.5 text-amber-400 shrink-0" />
                        ) : (
                            <FileText className="size-4.5 text-sky-400 shrink-0" />
                        )}
                        <div className="truncate">
                            <span className="font-semibold text-xs truncate block max-w-md">{file.name}</span>
                            {file.size && (
                                <span className="text-[10px] text-slate-400 block">{formatBytes(file.size)} • Official Compliance Attachment</span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {/* Open in New Tab */}
                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-xs btn-outline text-white hover:bg-white hover:text-slate-900 gap-1 rounded-lg text-xs"
                            title="Open full document in a new browser tab"
                        >
                            <ExternalLink className="size-3" /> Open in New Tab
                        </a>

                        {/* Download */}
                        <a
                            href={downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-xs btn-neutral bg-slate-800 hover:bg-slate-700 text-white gap-1 rounded-lg text-xs"
                            title="Download file to computer"
                        >
                            <Download className="size-3" /> Download
                        </a>

                        {/* Close button */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-ghost btn-circle btn-xs text-slate-300 hover:text-white"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                </div>

                {/* Modal Body / Viewer */}
                <div className="flex-1 bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden relative">
                    {isImage ? (
                        <div className="w-full h-full p-4 flex items-center justify-center overflow-auto">
                            <img
                                src={fileUrl}
                                alt={file.name}
                                className="max-h-full max-w-full rounded-lg shadow-md object-contain"
                            />
                        </div>
                    ) : isPdf ? (
                        <iframe
                            src={fileUrl}
                            title={file.name}
                            className="w-full h-full border-0 bg-white"
                        />
                    ) : (
                        <div className="text-center p-8 space-y-3 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 max-w-md mx-4">
                            <FileText className="size-12 text-slate-400 mx-auto" />
                            <div>
                                <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                                    DOCX / Office Document
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    This document format can be opened directly or downloaded to view in Microsoft Word or Google Docs.
                                </p>
                            </div>
                            <div className="flex items-center justify-center gap-2 pt-2">
                                <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-xs btn-outline text-xs gap-1"
                                >
                                    <ExternalLink className="size-3" /> View Online
                                </a>
                                <a
                                    href={downloadUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-sm btn-neutral text-xs font-semibold gap-1.5 rounded-lg inline-flex"
                                >
                                    <Download className="size-3.5" /> Download {file.name}
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
