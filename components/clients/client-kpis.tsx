"use client";

import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { GripHorizontal } from 'lucide-react';

export type KpiType = 'total' | 'success' | 'danger' | 'warning';

export interface KpiData {
    id: string;
    title: string;
    value: string | number;
    type: KpiType;
    icon: React.ElementType;
}

// --- FLIP ANIMATION HOOK ---
export function useFluidAnimations(items: any[]) {
    const containerRef = useRef<HTMLDivElement>(null);
    const prevRects = useRef<Record<string, DOMRect>>({});

    useLayoutEffect(() => {
        if (!containerRef.current) return;
        const nodes = Array.from(containerRef.current.childNodes) as HTMLElement[];

        const currentRects: Record<string, DOMRect> = {};
        nodes.forEach(node => {
            if (node.dataset && node.dataset.id) {
                currentRects[node.dataset.id] = node.getBoundingClientRect();
            }
        });

        nodes.forEach(node => {
            if (node.dataset && node.dataset.id) {
                if (node.dataset.dragging === 'true') {
                    node.style.transition = 'none';
                    node.style.transform = '';
                    return;
                }

                const id = node.dataset.id;
                const prevRect = prevRects.current[id];
                const currentRect = currentRects[id];

                if (prevRect && currentRect) {
                    const dx = prevRect.left - currentRect.left;
                    const dy = prevRect.top - currentRect.top;

                    if (dx !== 0 || dy !== 0) {
                        node.style.transform = `translate(${dx}px, ${dy}px)`;
                        node.style.transition = 'none';

                        void node.offsetHeight;

                        node.style.transform = '';
                        node.style.transition = 'transform 250ms cubic-bezier(0.25, 1, 0.5, 1)';
                    }
                }
            }
        });

        prevRects.current = currentRects;
    }, [items]);

    return containerRef;
}

interface KpiCardProps {
    title: string;
    value: string | number;
    type: KpiType;
    icon: React.ElementType;
    isDragging: boolean;
    onHandleEnter: () => void;
    onHandleLeave: () => void;
}

export const KpiCard = ({ title, value, type, icon: Icon, isDragging, onHandleEnter, onHandleLeave }: KpiCardProps) => {
    const styles = {
        total: {
            boxBg: 'bg-white/[0.03]', iconColor: 'text-gray-400', watermark: 'text-white/[0.02]', hoverBorder: 'group-hover:border-gray-600/50',
        },
        success: {
            boxBg: 'bg-emerald-500/[0.08]', iconColor: 'text-emerald-500', watermark: 'text-emerald-500/[0.03]', hoverBorder: 'group-hover:border-emerald-500/30',
        },
        danger: {
            boxBg: 'bg-rose-500/[0.08]', iconColor: 'text-rose-500', watermark: 'text-rose-500/[0.03]', hoverBorder: 'group-hover:border-rose-500/30',
        },
        warning: {
            boxBg: 'bg-amber-500/[0.08]', iconColor: 'text-amber-500', watermark: 'text-amber-500/[0.03]', hoverBorder: 'group-hover:border-amber-500/30',
        }
    };

    const currentStyle = styles[type] || styles.total;

    return (
        <div className={`
      group relative overflow-hidden rounded-xl p-4
      transition-colors duration-200 ease-in-out
      flex flex-col justify-between min-h-[100px] h-full
      ${isDragging
                ? 'opacity-30 border-2 border-dashed border-gray-600/60 bg-transparent'
                : `opacity-100 bg-[#121212] border border-[#262626] hover:bg-[#161616] ${currentStyle.hoverBorder}`
            }
    `}>
            <div className={`transition-opacity duration-300 ${isDragging ? 'opacity-0' : 'opacity-100'}`}>
                <div className="flex items-start justify-between z-10 relative">
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${currentStyle.boxBg} border border-white/[0.05]`}>
                            <Icon size={16} className={currentStyle.iconColor} />
                        </div>
                        <span className="text-sm font-medium text-gray-400 select-none">
                            {title}
                        </span>
                    </div>

                    <button
                        className="text-[#404040] hover:text-gray-200 transition-colors cursor-grab active:cursor-grabbing p-2 -mr-2 -mt-2"
                        onMouseEnter={onHandleEnter}
                        onMouseLeave={onHandleLeave}
                        onTouchStart={onHandleEnter}
                        onTouchEnd={onHandleLeave}
                    >
                        <GripHorizontal size={18} />
                    </button>
                </div>

                <div className="mt-2 z-10 relative select-none">
                    <h3 className="text-3xl font-semibold text-gray-100 tracking-tight">
                        {value}
                    </h3>
                </div>

                <Icon
                    className={`absolute -bottom-4 -right-4 w-24 h-24 ${currentStyle.watermark} pointer-events-none transition-transform duration-500 group-hover:scale-110`}
                    strokeWidth={1}
                />
            </div>
        </div>
    );
};

interface DraggableKpiGridProps {
    initialKpis: KpiData[];
}

export function DraggableKpiGrid({ initialKpis }: DraggableKpiGridProps) {
    const [kpis, setKpis] = useState<KpiData[]>(initialKpis);

    // Update kpis if initialKpis changes (e.g. data updates)
    useEffect(() => {
        // Keep the current order but update values if needed, 
        // or just reset. For simplicity, we just reset to new data but try to preserve order if ids match.
        setKpis(prev => {
            const newOrder = prev.map(p => initialKpis.find(i => i.id === p.id)).filter(Boolean) as KpiData[];
            // Append any new ones that weren't in prev
            const adding = initialKpis.filter(i => !prev.find(p => p.id === i.id));
            return [...newOrder, ...adding];
        });
    }, [initialKpis]);

    const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
    const [dragEnabled, setDragEnabled] = useState(false);

    const swapLock = useRef(false);
    const gridRef = useFluidAnimations(kpis);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setTimeout(() => {
            setDraggedIdx(index);
        }, 0);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", index.toString());
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";

        if (draggedIdx === null || draggedIdx === index) return;

        if (swapLock.current) return;

        const newKpis = [...kpis];
        const draggedItem = newKpis[draggedIdx];
        newKpis.splice(draggedIdx, 1);
        newKpis.splice(index, 0, draggedItem);

        setDraggedIdx(index);
        setKpis(newKpis);

        swapLock.current = true;
        setTimeout(() => {
            swapLock.current = false;
        }, 150);
    };

    const handleDragEnd = () => {
        setDraggedIdx(null);
        setDragEnabled(false);
        swapLock.current = false;
    };

    return (
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            {kpis.map((kpi, index) => (
                <div
                    key={kpi.id}
                    data-id={kpi.id}
                    data-dragging={draggedIdx === index}
                    draggable={dragEnabled}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`${dragEnabled ? 'cursor-grab active:cursor-grabbing' : ''}`}
                >
                    <KpiCard
                        title={kpi.title}
                        value={kpi.value}
                        type={kpi.type}
                        icon={kpi.icon}
                        isDragging={draggedIdx === index}
                        onHandleEnter={() => setDragEnabled(true)}
                        onHandleLeave={() => setDragEnabled(false)}
                    />
                </div>
            ))}
        </div>
    );
}
