import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            {/* Minimalist Shield with Document & Check */}
            <path
                d="M16 3L5 7v9c0 7.5 5 12.5 11 14 6-1.5 11-6.5 11-14V7L16 3z"
                className="fill-slate-800 stroke-slate-700 dark:fill-slate-900 dark:stroke-slate-600"
            />
            <path
                d="M11 15.5l3.5 3.5 7-7"
                className="stroke-sky-400 stroke-[2.5]"
            />
        </svg>
    );
}
