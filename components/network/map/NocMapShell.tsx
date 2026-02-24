"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import {
    mapFocusRequestAtom,
    mapNodesAtom,
    selectedNodeAtom,
    selectedNodeIdAtom,
    viewportAtom,
    layersAtom,
    heatmapModeAtom,
    mapOverlayAtom,
    roiSimulationAtom,
} from "@/components/network/map/state/mapAtoms"
import { useNetworkMapData } from "@/hooks/use-network-map-data"
import { useNetworkNodeDetails } from "@/hooks/use-network-node-details"
import { useNetworkMapStream } from "@/hooks/use-network-map-stream"
import { useNodeImpact } from "@/hooks/use-node-impact"
import { useTerritoryHeatmap } from "@/hooks/use-territory-heatmap"
import { useExpansionHeatmap } from "@/hooks/use-expansion-heatmap"
import { NocMapCanvas } from "./NocMapCanvas"
import { NocMapToolbar } from "./NocMapToolbar"
import { HeatmapLegend } from "./HeatmapLegend"
import { HexTooltip } from "./HexTooltip"
import { ExpansionTooltip } from "./ExpansionTooltip"
import { ExpansionRanking } from "./ExpansionRanking"
import { RoiSimulatorPanel } from "./RoiSimulatorPanel"
import type { MapNodeProjection } from "@/types/network/mapProjection"
import type { ImpactTier } from "@/lib/impact/types"
import type { TerritoryCell } from "@/lib/territory/types"
import type { ExpansionCell } from "@/lib/expansion/types"

export function NocMapShell() {
    const viewport = useAtomValue(viewportAtom)
    const [selectedNodeId, setSelectedNodeId] = useAtom(selectedNodeIdAtom)
    const selectedDetail = useAtomValue(selectedNodeAtom)
    const setMapNodes = useSetAtom(mapNodesAtom)
    const setMapFocusRequest = useSetAtom(mapFocusRequestAtom)
    const layers = useAtomValue(layersAtom)
    const heatmapMode = useAtomValue(heatmapModeAtom)
    const overlay = useAtomValue(mapOverlayAtom)
    const [roiCell, setRoiCell] = useAtom(roiSimulationAtom)
    const [toolbarMessage, setToolbarMessage] = useState<string | null>(null)

    const { data: snapshot = [], isLoading, isFetching } = useNetworkMapData({ viewport })
    const { pendingDeltas, applyDeltas, clearDeltas } = useNetworkMapStream()

    const nodes: MapNodeProjection[] = useMemo(() => {
        if (pendingDeltas.length === 0) return snapshot
        const merged = applyDeltas(snapshot)
        clearDeltas()
        return merged
    }, [snapshot, pendingDeltas, applyDeltas, clearDeltas])

    useEffect(() => {
        setMapNodes(nodes)
    }, [nodes, setMapNodes])

    /* ── Impact scoring ── */
    const { impactMap, stats } = useNodeImpact(nodes)
    const selectedImpact = selectedNodeId ? impactMap.get(selectedNodeId) : undefined

    /* ── Territory heatmap (impact overlay) ── */
    const isImpactOverlay = layers.heatmap && overlay === "impact"
    const { geoJson: impactGeoJson, cells: impactCells, loading: impactHexLoading } = useTerritoryHeatmap(
        nodes,
        impactMap,
        viewport.zoom,
        heatmapMode,
        isImpactOverlay,
    )

    /* ── Expansion heatmap ── */
    const isExpansionOverlay = layers.heatmap && overlay === "expansion"
    const { geoJson: expansionGeoJson, cells: expansionCells, ranking, loading: expansionLoading } = useExpansionHeatmap(
        nodes,
        viewport.zoom,
        isExpansionOverlay,
    )

    /* ── Active hex data (whichever overlay is on) ── */
    const activeGeoJson = overlay === "expansion" ? expansionGeoJson : impactGeoJson
    const hexLoading = overlay === "expansion" ? expansionLoading : impactHexLoading

    /* ── Impact Hex tooltip state ── */
    const [hoveredImpactCell, setHoveredImpactCell] = useState<TerritoryCell | null>(null)
    const [hoveredExpansionCell, setHoveredExpansionCell] = useState<ExpansionCell | null>(null)
    const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)

    const handleHexHover = useCallback((cellId: string, point: { x: number; y: number }) => {
        if (overlay === "expansion") {
            const cell = expansionCells.get(cellId)
            if (cell) {
                setHoveredExpansionCell(cell)
                setHoveredImpactCell(null)
                setTooltipPos(point)
            }
        } else {
            const cell = impactCells.get(cellId)
            if (cell) {
                setHoveredImpactCell(cell)
                setHoveredExpansionCell(null)
                setTooltipPos(point)
            }
        }
    }, [overlay, expansionCells, impactCells])

    const handleHexLeave = useCallback(() => {
        setHoveredImpactCell(null)
        setHoveredExpansionCell(null)
        setTooltipPos(null)
    }, [])

    const handleViewNodesInZone = useCallback((cellId: string) => {
        const cell = impactCells.get(cellId)
        if (!cell) return
        setMapFocusRequest({
            token: Date.now(),
            nodeIds: cell.topContributors.map((c) => c.nodeId),
        })
        setHoveredImpactCell(null)
        setTooltipPos(null)
    }, [impactCells, setMapFocusRequest])

    const { data: nodeDetails } = useNetworkNodeDetails(selectedNodeId)

    function handleFocusMyNodes() {
        if (nodes.length === 0) {
            setToolbarMessage("No hay nodos para centrar en el mapa actual.")
            return
        }
        setToolbarMessage(null)
        setMapFocusRequest({
            token: Date.now(),
            nodeIds: nodes.map((node) => node.id),
        })
    }

    return (
        <div className="relative flex h-[calc(100vh-7rem)] flex-col overflow-hidden rounded-2xl border border-white/8 bg-slate-950/70 shadow-2xl shadow-black/35">
            <div className="pointer-events-none absolute left-0 right-0 top-0 z-500 flex items-start justify-between p-3">
                <NocMapToolbar
                    onFocusMyNodes={handleFocusMyNodes}
                    inlineMessage={toolbarMessage}
                />

                <div className="flex items-center gap-2">
                    {/* H3 loading indicator */}
                    {hexLoading && (
                        <div className="pointer-events-auto flex items-center gap-1.5 rounded-xl border border-violet-500/20 bg-violet-950/60 px-2.5 py-1.5 text-xs font-medium text-violet-400 backdrop-blur-xl">
                            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-violet-500" />
                            Cargando H3…
                        </div>
                    )}

                    {/* Impact summary pill */}
                    {stats.byTier.CRITICAL > 0 && (
                        <div className="pointer-events-auto flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-950/60 px-2.5 py-1.5 text-xs font-medium text-red-400 backdrop-blur-xl">
                            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
                            {stats.byTier.CRITICAL} críticos
                        </div>
                    )}

                    {/* Expansion summary pill */}
                    {isExpansionOverlay && ranking.length > 0 && (
                        <div className="pointer-events-auto flex items-center gap-1.5 rounded-xl border border-teal-500/20 bg-teal-950/60 px-2.5 py-1.5 text-xs font-medium text-teal-400 backdrop-blur-xl">
                            <span className="inline-block h-2 w-2 rounded-full bg-teal-500" />
                            {ranking.filter((c) => c.opportunityTier === "PRIORITY").length} prioritarias
                        </div>
                    )}

                    {isFetching && (
                        <div className="pointer-events-auto flex items-center gap-2 rounded-xl border border-white/6 bg-slate-900/70 px-3 py-1.5 text-xs text-sky-400 backdrop-blur-xl">
                            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-sky-400" />
                            Actualizando.
                        </div>
                    )}
                </div>
            </div>

            <div className="relative flex-1">
                {isLoading && nodes.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500/30 border-t-sky-400" />
                            <span className="text-sm text-white/40">Cargando mapa de red.</span>
                        </div>
                    </div>
                ) : (
                    <NocMapCanvas
                        nodes={nodes}
                        impactMap={impactMap}
                        hexGeoJson={activeGeoJson}
                        hexLayerMode={overlay}
                        onNodeClick={(id) => setSelectedNodeId((prev) => (prev === id ? null : id))}
                        onHexHover={layers.heatmap ? handleHexHover : undefined}
                        onHexLeave={layers.heatmap ? handleHexLeave : undefined}
                    />
                )}

                {/* Hex tooltips (impact vs expansion) */}
                {layers.heatmap && overlay === "impact" && (
                    <HexTooltip
                        cell={hoveredImpactCell}
                        position={tooltipPos}
                        mode={heatmapMode}
                        onViewNodes={handleViewNodesInZone}
                    />
                )}
                {layers.heatmap && overlay === "expansion" && (
                    <ExpansionTooltip
                        cell={hoveredExpansionCell}
                        position={tooltipPos}
                    />
                )}

                {/* Expansion ranking panel (left) */}
                {isExpansionOverlay && (
                    <div className="absolute bottom-16 left-4 z-500">
                        <ExpansionRanking ranking={ranking} visible={isExpansionOverlay} />
                    </div>
                )}

                {/* ROI Simulator panel (right side) */}
                {roiCell && (
                    <div className="absolute right-4 top-16 z-500">
                        <RoiSimulatorPanel
                            cell={roiCell}
                            onClose={() => setRoiCell(null)}
                        />
                    </div>
                )}
            </div>

            {/* Heatmap legend (bottom-left or bottom-center when ranking is showing) */}
            {layers.heatmap && (
                <div className={`absolute z-500 ${isExpansionOverlay ? "bottom-14 left-80" : "bottom-14 left-4"}`}>
                    <HeatmapLegend mode={heatmapMode} overlay={overlay} visible={layers.heatmap} />
                </div>
            )}

            {selectedDetail && (
                <>
                    <aside className="absolute right-4 top-16 z-500 hidden w-88 rounded-2xl border border-white/10 bg-slate-900/85 p-4 shadow-xl shadow-black/40 backdrop-blur-xl sm:block">
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-white/90">
                                {selectedDetail.label || selectedDetail.id}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setSelectedNodeId(null)}
                                className="rounded-md p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white/70"
                            >
                                x
                            </button>
                        </div>

                        <div className="space-y-2 text-xs text-white/65">
                            <div className="flex justify-between">
                                <span>Estado</span>
                                <StatusBadge status={selectedDetail.status} />
                            </div>
                            <div className="flex justify-between">
                                <span>Tipo</span>
                                <span className="font-medium text-white/80">{selectedDetail.type?.toUpperCase() || "-"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Ultima vez</span>
                                <span className="font-medium text-white/80">{new Date(selectedDetail.lastSeenAt).toLocaleTimeString()}</span>
                            </div>

                            {/* Impact section */}
                            {selectedImpact && (
                                <div className="mt-2 border-t border-white/10 pt-2">
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <span className="text-[11px] font-semibold uppercase tracking-wide text-white/45">Impacto</span>
                                        <ImpactTierBadge tier={selectedImpact.impactTier} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between">
                                            <span>Score</span>
                                            <span className="font-mono font-semibold text-white/90">{selectedImpact.impactScore}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Clientes afectados</span>
                                            <span className="font-medium text-white/80">{selectedImpact.affectedClients.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>MRR en riesgo</span>
                                            <span className="font-medium text-amber-400/90">${selectedImpact.affectedMRR.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Tickets abiertos</span>
                                            <span className="font-medium text-white/80">{selectedImpact.openTickets}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-2 border-t border-white/10 pt-2">
                                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-white/45">Cliente / Usuario</div>
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span>Nombre</span>
                                        <span className="font-medium text-white/80">{nodeDetails?.customer.name || "Sin datos"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Usuario</span>
                                        <span className="font-medium text-white/80">{nodeDetails?.customer.username || "Sin usuario"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Plan</span>
                                        <span className="font-medium text-white/80">{nodeDetails?.customer.plan || "Sin plan"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-2 border-t border-white/10 pt-2">
                                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-white/45">Modem / Router</div>
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span>Modelo</span>
                                        <span className="font-medium text-white/80">{nodeDetails?.device.model || "Sin datos"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Vendor</span>
                                        <span className="font-medium text-white/80">{nodeDetails?.device.vendor || "Sin datos"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>IP</span>
                                        <span className="font-medium text-white/80">{nodeDetails?.device.ip || "0.0.0.0"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <aside className="absolute bottom-0 left-0 right-0 z-500 rounded-t-2xl border border-white/10 bg-slate-900/92 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl sm:hidden">
                        <div className="mb-1 flex items-center gap-2">
                            <span className="text-sm font-semibold text-white/90">{selectedDetail.label || selectedDetail.id}</span>
                            {selectedImpact && <ImpactTierBadge tier={selectedImpact.impactTier} />}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
                            <div>Estado: {selectedDetail.status}</div>
                            <div>Tipo: {selectedDetail.type?.toUpperCase() || "-"}</div>
                            <div>Score: {selectedImpact?.impactScore ?? "-"}</div>
                            <div>MRR: ${selectedImpact?.affectedMRR.toLocaleString() ?? "0"}</div>
                            <div>Cliente: {nodeDetails?.customer.name || "Sin datos"}</div>
                            <div>IP: {nodeDetails?.device.ip || "0.0.0.0"}</div>
                        </div>
                    </aside>
                </>
            )}

            <div className="absolute bottom-4 right-4 z-500 rounded-xl border border-white/6 bg-slate-900/70 px-3 py-1.5 text-xs text-white/50 backdrop-blur-xl">
                {nodes.length.toLocaleString()} nodos
                {layers.heatmap && activeGeoJson && (
                    <span className={`ml-2 ${overlay === "expansion" ? "text-teal-400/70" : "text-violet-400/70"}`}>
                        · {activeGeoJson.features.length} hex
                    </span>
                )}
            </div>
        </div>
    )
}

/* ── Utility badges ── */

function StatusBadge({ status }: { status: MapNodeProjection["status"] }) {
    const styles: Record<string, string> = {
        ONLINE: "bg-emerald-500/20 text-emerald-400",
        OFFLINE: "bg-red-500/20 text-red-400",
        DEGRADED: "bg-amber-500/20 text-amber-400",
        UNKNOWN: "bg-gray-500/20 text-gray-400",
    }
    return <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${styles[status]}`}>{status}</span>
}

const TIER_STYLES: Record<ImpactTier, string> = {
    CRITICAL: "bg-red-500/20 text-red-400 border-red-500/30",
    HIGH: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    LOW: "bg-slate-500/20 text-slate-400 border-slate-500/30",
}

const TIER_LABELS: Record<ImpactTier, string> = {
    CRITICAL: "Crítico",
    HIGH: "Alto",
    MEDIUM: "Medio",
    LOW: "Bajo",
}

function ImpactTierBadge({ tier }: { tier: ImpactTier }) {
    return (
        <span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${TIER_STYLES[tier]}`}>
            {TIER_LABELS[tier]}
        </span>
    )
}
