type BarData = {
    rank: number;
    name: string;
    score: number;
};

type DonutData = {
    label: string;
    value: number;
    color: string;
};

export function BarChartTop10({ data = [] }: { data?: BarData[] }) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-500">
                No ranking data available.
            </div>
        );
    }

    const maxScore = 100;

    return (
        <div className="space-y-2.5">
            {data.map((item, idx) => {
                const percentage = Math.min(100, Math.max(0, ((item?.score || 0) / maxScore) * 100));
                const rankNum = item?.rank || idx + 1;
                return (
                    <div key={idx} className="flex items-center gap-3 text-xs">
                        <span className={`w-5 text-right font-mono font-semibold ${rankNum <= 3 ? 'text-slate-900 font-bold dark:text-slate-100' : 'text-slate-400'}`}>
                            #{rankNum}
                        </span>
                        <span className="w-28 truncate font-medium text-slate-700 dark:text-slate-300" title={item?.name || ''}>
                            {item?.name || 'Barangay'}
                        </span>
                        <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden dark:bg-slate-800">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                    rankNum === 1
                                        ? 'bg-slate-800 dark:bg-sky-500'
                                        : rankNum <= 3
                                        ? 'bg-slate-700 dark:bg-sky-600'
                                        : 'bg-slate-500 dark:bg-slate-600'
                                }`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <span className="w-12 text-right font-semibold font-mono text-slate-800 dark:text-slate-200">
                            {(item?.score || 0).toFixed(1)}%
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

export function DonutChart({
    data = [],
    size = 140,
    centerLabel = 'Total',
}: {
    data?: DonutData[];
    size?: number;
    centerLabel?: string;
}) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-500">
                No data available.
            </div>
        );
    }

    const total = data.reduce((acc, curr) => acc + (curr?.value || 0), 0);

    if (total === 0) {
        return (
            <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-500">
                No data available.
            </div>
        );
    }

    const strokeWidth = 18;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    let accumulatedOffset = 0;

    return (
        <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90 transform">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        className="stroke-slate-100 dark:stroke-slate-800"
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                    {data.map((slice, index) => {
                        const val = slice?.value || 0;
                        const sliceFraction = val / total;
                        const strokeDasharray = `${circumference * sliceFraction} ${circumference}`;
                        const strokeDashoffset = -accumulatedOffset;
                        accumulatedOffset += circumference * sliceFraction;

                        return (
                            <circle
                                key={index}
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                stroke={slice?.color || '#94a3b8'}
                                strokeWidth={strokeWidth}
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                fill="none"
                                strokeLinecap="butt"
                                className="transition-all duration-500"
                            />
                        );
                    })}
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100 font-mono">
                        {total}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{centerLabel}</span>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-3 text-xs">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: item?.color || '#94a3b8' }} />
                        <span className="text-[11px] font-medium">{item?.label || 'Item'}</span>
                        <span className="text-[11px] text-slate-400 font-mono">({item?.value || 0})</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export type PillarData = {
    id: number;
    code: string;
    name: string;
    is_core: boolean;
    weight: number;
    avgScore: number;
    totalSubmissions: number;
    verifiedCount: number;
};

export function PillarComplianceBars({ pillars = [] }: { pillars?: PillarData[] }) {
    if (!pillars || pillars.length === 0) {
        return (
            <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-500">
                No governance area data available.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {pillars.map((pillar) => {
                const score = pillar.avgScore || 0;
                const isCore = pillar.is_core;

                // Color based on score
                const barColor = score >= 85
                    ? 'bg-emerald-500'
                    : score >= 70
                    ? 'bg-amber-500'
                    : score > 0
                    ? 'bg-rose-500'
                    : 'bg-slate-300 dark:bg-slate-700';

                return (
                    <div key={pillar.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 truncate">
                                <span className={`badge ${isCore ? 'badge-neutral' : 'badge-ghost'} badge-xs font-mono font-bold uppercase`}>
                                    {isCore ? 'Core' : 'Essential'}
                                </span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={pillar.name}>
                                    {pillar.name}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] text-slate-400">
                                    {pillar.verifiedCount}/{pillar.totalSubmissions} verified
                                </span>
                                <span className="font-mono font-bold text-slate-900 dark:text-white">
                                    {score.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                style={{ width: `${Math.min(100, Math.max(score, score > 0 ? 4 : 0))}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export type SglgEligibilityType = {
    passers: number;
    nearPassers: number;
    needsAction: number;
    total: number;
    passRate: number;
};

export function SglgEligibilityCard({ data }: { data?: SglgEligibilityType }) {
    const stats = data || { passers: 0, nearPassers: 0, needsAction: 64, total: 64, passRate: 0 };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 dark:bg-emerald-950/20">
                <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <div>
                        <span className="font-bold text-xs text-emerald-900 dark:text-emerald-300">SGLGB Award Qualified</span>
                        <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/70">Passed 3 Core + &ge;1 Essential Area</p>
                    </div>
                </div>
                <div className="text-right font-mono">
                    <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">{stats.passers}</span>
                    <span className="text-[10px] text-slate-400 ml-1">/ {stats.total}</span>
                </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 dark:bg-amber-950/20">
                <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-amber-500 shrink-0" />
                    <div>
                        <span className="font-bold text-xs text-amber-900 dark:text-amber-300">Near-Passer / Potential</span>
                        <p className="text-[10px] text-amber-700/80 dark:text-amber-400/70">Passed 2 Core Areas (Needs 1 more)</p>
                    </div>
                </div>
                <div className="text-right font-mono">
                    <span className="text-base font-extrabold text-amber-700 dark:text-amber-400">{stats.nearPassers}</span>
                    <span className="text-[10px] text-slate-400 ml-1">/ {stats.total}</span>
                </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 dark:bg-rose-950/20">
                <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-rose-500 shrink-0" />
                    <div>
                        <span className="font-bold text-xs text-rose-900 dark:text-rose-300">Needs Intervention</span>
                        <p className="text-[10px] text-rose-700/80 dark:text-rose-400/70">Failed &ge;2 Core Governance Areas</p>
                    </div>
                </div>
                <div className="text-right font-mono">
                    <span className="text-base font-extrabold text-rose-700 dark:text-rose-400">{stats.needsAction}</span>
                    <span className="text-[10px] text-slate-400 ml-1">/ {stats.total}</span>
                </div>
            </div>
        </div>
    );
}
