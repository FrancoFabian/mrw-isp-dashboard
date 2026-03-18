"use client"

import React, { useEffect, useId, useMemo, useRef, useState, memo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from "@/lib/utils";
import { MiniMenu } from './mini-menu';

const clamp01 = (n: number) => Math.max(0, Math.min(100, n));

export interface Point {
    x: number;
    y: number;
}

const toLine = (points: Point[], width: number, height: number) => {
    if (!points || !points.length || width <= 0 || height <= 0) return "";
    const sx = (x: number) => (clamp01(x) / 100) * width;
    const sy = (y: number) => height - (clamp01(y) / 100) * height;
    return points.map((p, i) => `${i ? "L" : "M"}${sx(p.x)},${sy(p.y)}`).join("");
};

const toArea = (points: Point[], width: number, height: number) => {
    if (!points || !points.length || width <= 0 || height <= 0) return "";
    const line = toLine(points, width, height);
    return `${line} L${width},${height} L0,${height} Z`;
};

const toneMap = {
    success: { chip: "bg-[#142e1d] text-[#4ade80]", hex: "#4ade80" },
    danger: { chip: "bg-[#33181c] text-[#fb7185]", hex: "#fb7185" },
    warning: { chip: "bg-[#332216] text-[#fbbf24]", hex: "#fbbf24" },
    info: {
        chip: "bg-[oklch(53.8%_0.243_264.376_/_0.18)] text-[oklch(53.8%_0.243_264.376)]",
        hex: "oklch(53.8% 0.243 264.376)",
    },
    purple: {
        chip: "bg-[oklch(45.7%_0.24_277.023_/_0.18)] text-[oklch(45.7%_0.24_277.023)]",
        hex: "oklch(45.7% 0.24 277.023)",
    },
    muted: { chip: "bg-[#27272a] text-[#a1a1aa]", hex: "#a1a1aa" },
} as const;

export type Tone = keyof typeof toneMap;

export interface KpiStatCardProps {
    title: string;
    subtitle?: string;
    value: React.ReactNode;
    deltaPct?: number;
    points?: Point[];
    tone?: Tone;
    icon?: React.ReactNode;
    className?: string;
    isActive?: boolean;
}

export const KpiStatCard = memo(({
    title,
    subtitle,
    value,
    deltaPct,
    points = [],
    tone,
    icon,
    className,
    isActive = false,
}: KpiStatCardProps) => {
    const uid = useId();
    const containerRef = useRef<HTMLDivElement>(null);
    const [dims, setDims] = useState({ w: 0, h: 75 });

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const measure = () => {
            const rect = el.getBoundingClientRect();
            setDims({ w: Math.floor(rect.width), h: rect.height });
        };
        measure();
        const ro = new ResizeObserver(() => measure());
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const chosenTone = useMemo(() => tone || ((deltaPct ?? 0) >= 0 ? "success" : "danger"), [deltaPct, tone]);
    const colors = toneMap[chosenTone];
    const lineD = useMemo(() => toLine(points, dims.w, dims.h), [points, dims.w, dims.h]);
    const areaD = useMemo(() => toArea(points, dims.w, dims.h), [points, dims.w, dims.h]);
    const isPositive = (deltaPct ?? 0) >= 0;
    const canRender = dims.w > 0 && dims.h > 0 && points?.length > 0;

    return (
        <article className={cn(
            "bg-linear-to-br from-zinc-800/40 to-black border border-white/5 rounded-2xl flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors h-[150px]",
            className
        )}>
            <div className="relative z-10 h-full flex flex-col pointer-events-none">
                <div className="h-[75px] px-5 pt-5 min-h-0 overflow-hidden flex flex-col">
                    <div className="flex justify-between items-start pointer-events-auto">
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                                {icon && <span className="text-zinc-400">{icon}</span>}
                                <h3 className="text-xs font-semibold text-zinc-200 tracking-wide truncate">{title}</h3>
                            </div>
                            {subtitle && (
                                <span className="text-[9px] text-zinc-500 font-medium uppercase tracking-wider mt-0.5 pointer-events-auto truncate">
                                    {subtitle}
                                </span>
                            )}
                        </div>
                        <MiniMenu active={isActive} />
                    </div>
                    <div className="mt-auto flex items-center gap-2 pointer-events-auto min-h-0">
                        <div className="text-[18px] font-semibold text-white tracking-tight leading-[1]">
                            {value}
                        </div>
                        {typeof deltaPct === "number" && (
                            <span className={cn(
                                "px-2 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1 leading-none",
                                colors.chip
                            )}>
                                {isPositive ? <TrendingUp size={12} strokeWidth={2.5} /> : <TrendingDown size={12} strokeWidth={2.5} />}
                                {Math.abs(deltaPct)}%
                            </span>
                        )}
                    </div>
                </div>
                <div ref={containerRef} className="h-[75px] w-full pointer-events-none">
                    <svg width="100%" height="100%" viewBox={`0 0 ${Math.max(dims.w, 1)} ${Math.max(dims.h, 1)}`} preserveAspectRatio="none" className="w-full h-full">
                        <defs>
                            <linearGradient id={`grad-${uid}`} x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor={colors.hex} stopOpacity="0.25" />
                                <stop offset="100%" stopColor={colors.hex} stopOpacity="0.02" />
                            </linearGradient>
                        </defs>
                        <g style={{ color: colors.hex }}>
                            {canRender && (
                                <>
                                    <path d={areaD} fill={`url(#grad-${uid})`} opacity={1} />
                                    <path d={lineD} fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                                </>
                            )}
                        </g>
                    </svg>
                </div>
            </div>
        </article>
    );
});
KpiStatCard.displayName = "KpiStatCard";
