import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo({ isDark = true }: { isDark?: boolean }) {
    return (
        <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-slate-800 text-white shadow-sm border border-slate-700">
                <AppLogoIcon className="size-5" />
            </div>
            <div className="flex flex-col text-left">
                <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                    SGLG-SYS
                    <span className="badge bg-slate-800 text-white border border-slate-700 badge-xs font-mono text-[9px] px-1.5 py-0.5 font-semibold">
                        SILANG
                    </span>
                </span>
                <span className="text-[10px] text-slate-300 font-medium">
                    Document Compliance Portal
                </span>
            </div>
        </div>
    );
}
