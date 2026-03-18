"use client"

import React, { memo } from 'react';
import { Wifi } from 'lucide-react';
import { cn } from "@/lib/utils";
import { MiniMenu } from './mini-menu';

export type NetworkStatus = 'critical' | 'warning' | 'success';

interface NetworkStatusCardProps {
    status?: NetworkStatus;
    className?: string;
    alertsCount?: number;
}

const stateConfig = {
    critical: {
        bg: "from-rose-900/30 via-zinc-900/40 to-black",
        strokeColor: "text-rose-500",
        chipClass: "bg-[#33181c] text-[#fb7185]",
        alerts: 2,
        label: "Revisión requerida"
    },
    warning: {
        bg: "from-amber-900/30 via-zinc-900/40 to-black",
        strokeColor: "text-amber-500",
        chipClass: "bg-[#332216] text-[#fbbf24]",
        alerts: 1,
        label: "Advertencia"
    },
    success: {
        bg: "from-emerald-900/30 via-zinc-900/40 to-black",
        strokeColor: "text-emerald-500",
        chipClass: "bg-[#142e1d] text-[#4ade80]",
        alerts: 0,
        label: "Operación normal"
    }
};

export const NetworkStatusCard = memo(({ status = 'critical', className, alertsCount }: NetworkStatusCardProps) => {
    const current = stateConfig[status];
    const actualAlertsCount = alertsCount !== undefined ? alertsCount : current.alerts;

    return (
        <article className={cn(
            "bg-linear-to-br border border-white/5 rounded-2xl p-5 flex flex-col relative overflow-hidden group transition-colors duration-700 h-[150px]",
            current.bg,
            className
        )}>

            {/* Fondo: Animación de Pulso / Heartbeat SVG */}
            <div className={cn(
                "absolute inset-0 w-full h-full opacity-20 pointer-events-none transition-colors duration-700",
                current.strokeColor
            )}>
                <svg
                    viewBox="0 0 200 100"
                    className="w-full h-full"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M 0 50 L 15 50 L 20 40 L 25 50 L 35 50 L 40 60 L 45 10 L 55 90 L 60 50 L 70 50 L 80 35 L 90 50 L 200 50"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        pathLength="100"
                        style={{
                            strokeDasharray: '60 40',
                            animation: 'heartbeat-flow 3s linear infinite'
                        }}
                    />
                </svg>
            </div>

            <div className="z-10 flex flex-col relative h-full pointer-events-none">
                <div className="flex justify-between items-start pointer-events-auto">
                    <div className="flex items-center gap-2 mb-2">
                        <Wifi size={16} className="text-zinc-400" />
                        <h3 className="text-sm font-semibold text-zinc-200 tracking-wide">Estado de red</h3>
                    </div>
                    <MiniMenu active={false} />
                </div>

                <div className="flex items-baseline gap-1.5 mt-1 pointer-events-auto">
                    <span className="text-[26px] font-bold tracking-tight leading-none text-white">
                        {actualAlertsCount}
                    </span>
                    <span className="text-xs font-medium uppercase tracking-wider bg-clip-text text-transparent bg-linear-to-r from-zinc-200 to-zinc-600">
                        {actualAlertsCount === 1 ? 'Alerta' : 'Alertas'}
                    </span>
                </div>

                <div className="mt-auto z-10 pointer-events-auto">
                    <span className={cn(
                        "px-2 py-1 rounded-md text-[11px] font-semibold tracking-wide border border-transparent inline-block transition-colors duration-500",
                        current.chipClass
                    )}>
                        {current.label}
                    </span>
                </div>
            </div>

            {/* Estilos locales para la animación de 'heartbeat-flow' si no están globales */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes heartbeat-flow {
          0% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }
      `}} />
        </article>
    );
});
NetworkStatusCard.displayName = "NetworkStatusCard";
