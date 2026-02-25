"use client"

import type { MapNodeProjection } from "@/types/network/mapProjection"
import type { NodeClientImpact, NodeImpact } from "@/lib/impact/types"

interface NodeImpactTooltipProps {
    node: MapNodeProjection | null
    impact?: NodeImpact
    clientImpact?: NodeClientImpact
    position: { x: number; y: number } | null
}

function formatTime(value?: string): string {
    if (!value) return "-"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "-"
    return date.toLocaleTimeString()
}

export function NodeImpactTooltip({ node, impact, clientImpact, position }: NodeImpactTooltipProps) {
    if (!node || !position) return null

    return (
        <div
            className="pointer-events-none absolute z-520 min-w-64 rounded-xl border border-white/15 bg-slate-950/92 px-3 py-2.5 text-xs text-white/80 shadow-xl shadow-black/40 backdrop-blur-xl"
            style={{
                left: position.x + 12,
                top: position.y + 12,
            }}
        >
            <div className="mb-1 flex items-center justify-between gap-2">
                <span className="font-semibold text-white/90">{node.label || node.id}</span>
                <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">{node.status}</span>
            </div>
            <div className="space-y-1">
                <div className="flex justify-between">
                    <span>Total clientes</span>
                    <span className="font-medium text-white/90">{(clientImpact?.totalClients ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span>Clientes afectados</span>
                    <span className="font-medium text-white/90">{(clientImpact?.affectedClients ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span>Clientes degradados</span>
                    <span className="font-medium text-amber-300">{(clientImpact?.degradedClients ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span>MRR afectado</span>
                    <span className="font-medium text-amber-300">${(clientImpact?.affectedMRR ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span>Impact score</span>
                    <span className="font-mono font-semibold text-white/95">{impact?.impactScore ?? "-"}</span>
                </div>
                <div className="flex justify-between">
                    <span>Última actualización</span>
                    <span className="font-medium text-white/80">{formatTime(clientImpact?.lastComputedAt)}</span>
                </div>
            </div>
        </div>
    )
}
