import { AlertCircle, CheckCircle2, Info, LogOut, X } from 'lucide-react';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title: string;
    description: string;
    type?: 'info' | 'success' | 'warning' | 'error' | 'logout';
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
};

export default function AlertModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    type = 'info',
    confirmText = 'OK',
    cancelText = 'Cancel',
    showCancel = false,
}: Props) {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle2 className="size-5 text-emerald-500" />;
            case 'error':
                return <AlertCircle className="size-5 text-rose-500" />;
            case 'warning':
                return <AlertCircle className="size-5 text-amber-500" />;
            case 'logout':
                return <LogOut className="size-5 text-slate-700 dark:text-slate-300" />;
            default:
                return <Info className="size-5 text-slate-700 dark:text-slate-300" />;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 animate-in fade-in duration-150">
            <div className="w-full max-w-sm bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800 animate-in zoom-in-95 duration-150">
                <div className="p-5 space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                            {getIcon()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                                {title}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed whitespace-pre-line">
                                {description}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 dark:border-slate-800 dark:bg-slate-800/40">
                    {showCancel && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-xs btn-ghost text-xs text-slate-600 dark:text-slate-400"
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => {
                            if (onConfirm) onConfirm();
                            onClose();
                        }}
                        className={`btn btn-xs font-semibold text-xs rounded-lg px-3 ${
                            type === 'error'
                                ? 'btn-error text-white'
                                : 'btn-neutral'
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
