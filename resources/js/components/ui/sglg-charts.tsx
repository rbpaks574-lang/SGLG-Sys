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
