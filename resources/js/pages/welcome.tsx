import { Head, Link } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import {
    FileCheck2,
    Shield,
    Building2,
    ArrowRight,
    Lock,
    Landmark,
    HeartHandshake,
    Store,
    Trees,
    ShieldAlert,
    CheckCircle2,
} from 'lucide-react';

export default function Welcome() {
    const areas = [
        { code: 'FIN', name: 'Financial Administration', desc: 'Full Disclosure Policy & transparent barangay budgets' },
        { code: 'DIS', name: 'Disaster Preparedness', desc: 'BDRRM plan, emergency equipment, and evacuation readiness' },
        { code: 'PNO', name: 'Peace and Order', desc: 'BPOPS plan, Katarungang Pambarangay, and BADAC functionality' },
        { code: 'SOC', name: 'Social Protection', desc: 'GAD budget, VAWC desk intake, and BCPC child welfare programs' },
        { code: 'BUS', name: 'Business Friendliness', desc: 'Streamlined barangay clearances & Ease of Doing Business' },
        { code: 'ENV', name: 'Environmental Management', desc: 'Materials Recovery Facility & solid waste segregation' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between dark:bg-slate-950 dark:text-slate-100">
            <Head title="SGLG-SYS - Seal of Good Local Governance Portal" />

            {/* Navbar */}
            <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between dark:bg-slate-900 dark:border-slate-800">
                <AppLogo />

                <div className="flex items-center gap-3">
                    <Link
                        href="/login"
                        className="btn btn-sm btn-outline border-slate-300 hover:bg-slate-100 text-xs font-semibold gap-1.5 rounded-lg text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <Lock className="size-3.5" /> Portal Login
                    </Link>
                </div>
            </header>

            {/* Hero */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12 flex-1 flex flex-col justify-center">
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/70 border border-slate-300/80 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                        <Shield className="size-3.5 text-slate-600 dark:text-slate-400" />
                        <span>Municipality of Silang, Cavite • DILG Compliance</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                        Seal of Good Local Governance for Barangays
                    </h1>

                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Official document submission, verification, and analytics portal for the 64 component barangays of Silang.
                    </p>

                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                        <Link
                            href="/login"
                            className="btn btn-sm bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-6 rounded-lg shadow-sm border-none gap-2 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
                        >
                            Access Document Portal <ArrowRight className="size-3.5" />
                        </Link>
                    </div>
                </div>

                {/* 6 Governance Areas Grid */}
                <div>
                    <div className="text-center mb-6">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            6 SGLGB Assessment Areas
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {areas.map((area, idx) => (
                            <div
                                key={idx}
                                className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-1.5"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                                        {area.name}
                                    </h3>
                                    <span className="badge badge-ghost badge-xs font-mono font-bold text-[9px]">
                                        {area.code}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {area.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 dark:bg-slate-900 dark:border-slate-800">
                <span>&copy; 2026 Department of the Interior and Local Government — Municipality of Silang, Cavite</span>
            </footer>
        </div>
    );
}
