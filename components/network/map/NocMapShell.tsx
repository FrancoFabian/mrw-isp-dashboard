"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import {
    X,
    Server,
    Clock,
    Users,
    DollarSign,
    Wifi,
    Ticket,
    CheckCircle2,
} from "lucide-react"
import {
    mapFocusRequestAtom,
    mapNodesAtom,
    nocScopeAtom,
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
import { useNetworkHealth } from "@/hooks/use-network-health"
import { NocMapCanvas } from "./NocMapCanvas"
import { NocMapToolbar } from "./NocMapToolbar"
import { HeatmapLegend } from "./HeatmapLegend"
import { HexTooltip } from "./HexTooltip"
import { ExpansionTooltip } from "./ExpansionTooltip"
import { NodeImpactTooltip } from "./NodeImpactTooltip"
import { ExpansionRanking } from "./ExpansionRanking"
import { RoiSimulatorPanel } from "./RoiSimulatorPanel"
import { NetworkHealthCard } from "./NetworkHealthCard"
import type { MapNodeProjection, MapNodeStatus } from "@/types/network/mapProjection"
import { DEFAULT_CLIENT_IMPACT_CONFIG } from "@/lib/impact/config"
import type { ClientImpactFilter, ImpactTier } from "@/lib/impact/types"
import type { TerritoryCell } from "@/lib/territory/types"
import type { ExpansionCell } from "@/lib/expansion/types"

/* ══════════════════════════════════════════════════════════
   Auxiliary visual components (example-style)
   ══════════════════════════════════════════════════════════ */

function ShellSkeleton({ className = "" }: { className?: string }) {
    return <div className={`animate-pulse rounded bg-zinc-800/80 ${className}`} />
}

function HeartbeatLine({
    className = "text-emerald-500",
    width = 28,
    height = 16,
}: {
    className?: string
    width?: number
    height?: number
}) {
    return (
        <div className={`relative flex items-center transition-colors duration-500 ${className}`} style={{ width, height }}>
            <svg viewBox="0 0 100 30" className="h-full w-full overflow-visible" preserveAspectRatio="none">
                <path
                    d="M 0 15 L 20 15 L 25 5 L 35 25 L 40 10 L 45 15 L 100 15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength="100"
                    className="ecg-line motion-reduce:!animate-none"
                />
            </svg>
        </div>
    )
}

function PanelStatusBadge({ status, loading }: { status?: string; loading?: boolean }) {
    if (loading) return <ShellSkeleton className="h-5 w-14" />
    const styles: Record<string, string> = {
        ONLINE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        OFFLINE: "bg-red-500/10 text-red-500 border-red-500/20",
        DEGRADED: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        UNKNOWN: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    }
    return (
        <span
            className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${styles[status ?? "UNKNOWN"] ?? styles.UNKNOWN}`}
        >
            {status}
        </span>
    )
}

const PANEL_GLOBAL_STYLES = `
@keyframes sweep {
  0% { stroke-dashoffset: 100; }
  100% { stroke-dashoffset: -100; }
}
.ecg-line {
  stroke-dasharray: 25 75;
  animation: sweep 2.5s linear infinite;
}
.panel-scrollbar::-webkit-scrollbar { width: 4px; }
.panel-scrollbar::-webkit-scrollbar-track { background: transparent; }
.panel-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 4px; }
.panel-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
`

/* ══════════════════════════════════════════════════════════
   MAIN SHELL
   ══════════════════════════════════════════════════════════ */

export function NocMapShell() {
    const viewport = useAtomValue(viewportAtom)
    const [selectedNodeId, setSelectedNodeId] = useAtom(selectedNodeIdAtom)
    const selectedDetail = useAtomValue(selectedNodeAtom)
    const nocScope = useAtomValue(nocScopeAtom)
    const setMapNodes = useSetAtom(mapNodesAtom)
    const setMapFocusRequest = useSetAtom(mapFocusRequestAtom)
    const layers = useAtomValue(layersAtom)
    const heatmapMode = useAtomValue(heatmapModeAtom)
    const overlay = useAtomValue(mapOverlayAtom)
    const [roiCell, setRoiCell] = useAtom(roiSimulationAtom)
    const [toolbarMessage, setToolbarMessage] = useState<string | null>(null)
    const [panelTab, setPanelTab] = useState<"summary" | "clients">("summary")
    const [clientFilter, setClientFilter] = useState<ClientImpactFilter>("affected")
    const [clientPage, setClientPage] = useState(1)

    const CLIENTS_PER_PAGE = 10

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
    const { impactMap, clientImpactMap, stats, getNodeClientsByFilter } = useNodeImpact(nodes, nocScope)
    const selectedImpact = selectedNodeId ? impactMap.get(selectedNodeId) : undefined
    const selectedClientImpact = selectedNodeId ? clientImpactMap.get(selectedNodeId) : undefined

    /* ── Network health ── */
    const health = useNetworkHealth(nodes)

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

    const { data: nodeDetails, isLoading: nodeDetailsLoading } = useNetworkNodeDetails(selectedNodeId)

    const nodeById = useMemo(
        () => new Map(nodes.map((node) => [node.id, node])),
        [nodes],
    )

    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
    const [hoveredNodePos, setHoveredNodePos] = useState<{ x: number; y: number } | null>(null)

    const hoveredNode = hoveredNodeId ? nodeById.get(hoveredNodeId) ?? null : null
    const hoveredImpact = hoveredNodeId ? impactMap.get(hoveredNodeId) : undefined
    const hoveredClientImpact = hoveredNodeId ? clientImpactMap.get(hoveredNodeId) : undefined

    const scopedNodeIds = useMemo(() => {
        if (!nocScope.nodeIds || nocScope.nodeIds.length === 0) {
            return nodes.map((node) => node.id)
        }

        const visibleNodeIds = new Set(nodes.map((node) => node.id))
        return nocScope.nodeIds.filter((id) => visibleNodeIds.has(id))
    }, [nocScope.nodeIds, nodes])

    const selectedNodeClients = useMemo(
        () => (selectedNodeId ? getNodeClientsByFilter(selectedNodeId, "all") : []),
        [getNodeClientsByFilter, selectedNodeId],
    )
    const isClientEdgeNode = selectedDetail?.type === "onu"

    useEffect(() => {
        setPanelTab("summary")
        setClientFilter("affected")
        setClientPage(1)
    }, [selectedNodeId])

    useEffect(() => {
        setClientPage(1)
    }, [clientFilter])

    function handleFocusMyNodes() {
        if (scopedNodeIds.length === 0) {
            setToolbarMessage("No hay nodos para centrar en el mapa actual.")
            return
        }
        setToolbarMessage(null)
        setMapFocusRequest({
            token: Date.now(),
            nodeIds: scopedNodeIds,
        })
    }

    const handleFilterByStatus = useCallback((status: MapNodeStatus) => {
        const filtered = nodes.filter((n) => n.status === status)
        if (filtered.length === 0) return
        setMapFocusRequest({
            token: Date.now(),
            nodeIds: filtered.map((n) => n.id),
        })
    }, [nodes, setMapFocusRequest])

    /* ── Panel computed values ── */
    const totalClients = selectedClientImpact?.totalClients ?? 0
    const onlineClients = selectedClientImpact?.onlineClients ?? 0
    const degradedClients = selectedClientImpact?.degradedClients ?? 0
    const affectedClients = selectedClientImpact?.affectedClients ?? 0
    const onlinePct = totalClients > 0 ? (onlineClients / totalClients) * 100 : 0
    const degradedPct = totalClients > 0 ? (degradedClients / totalClients) * 100 : 0
    const affectedPct = totalClients > 0 ? (affectedClients / totalClients) * 100 : 0

    const panelLoading = nodeDetailsLoading || (!selectedImpact && !!selectedNodeId)

    // Heartbeat & Glow color based on dominant status
    let heartbeatColor = "text-zinc-600"
    let healthGlow = "bg-zinc-500"
    if (!panelLoading && selectedClientImpact) {
        const max = Math.max(onlineClients, degradedClients, affectedClients)
        if (max === affectedClients && affectedClients > 0) {
            heartbeatColor = "text-rose-500"
            healthGlow = "bg-rose-500"
        } else if (max === degradedClients && degradedClients > 0) {
            heartbeatColor = "text-amber-500"
            healthGlow = "bg-amber-500"
        } else {
            heartbeatColor = "text-emerald-500"
            healthGlow = "bg-emerald-500"
        }
    }

    // Filtered clients for Clientes tab
    const filteredClients = useMemo(() => {
        return selectedNodeClients.filter((c) => {
            if (clientFilter === "affected") return c.status === "OFFLINE" || c.status === "UNKNOWN"
            if (clientFilter === "degraded") return c.status === "DEGRADED"
            return true // "all"
        })
    }, [selectedNodeClients, clientFilter])

    const totalClientPages = Math.max(1, Math.ceil(filteredClients.length / CLIENTS_PER_PAGE))
    const paginatedClients = filteredClients.slice(
        (clientPage - 1) * CLIENTS_PER_PAGE,
        clientPage * CLIENTS_PER_PAGE,
    )

    return (
        <div className="relative flex h-[calc(100vh-9rem)] flex-col overflow-hidden rounded-2xl border border-white/8 bg-slate-950/70 shadow-2xl shadow-black/35">
            {/* Health summary card */}
            <div className="pointer-events-none absolute left-5/8 top-3 z-510 -translate-x-1/2">
                <NetworkHealthCard health={health} onFilterByStatus={handleFilterByStatus} />
            </div>

            <div className="pointer-events-none absolute left-0 right-0 top-6 z-500 flex items-start justify-between p-3">
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
                        clientImpactMap={clientImpactMap}
                        selectedNodeId={selectedNodeId}
                        hexGeoJson={activeGeoJson}
                        hexLayerMode={overlay}
                        onNodeClick={(id) => setSelectedNodeId((prev) => (prev === id ? null : id))}
                        onNodeHover={(id, point) => {
                            setHoveredNodeId(id)
                            setHoveredNodePos(point)
                        }}
                        onNodeLeave={() => {
                            setHoveredNodeId(null)
                            setHoveredNodePos(null)
                        }}
                        onHexHover={layers.heatmap ? handleHexHover : undefined}
                        onHexLeave={layers.heatmap ? handleHexLeave : undefined}
                    />
                )}

                <NodeImpactTooltip
                    node={hoveredNode}
                    impact={hoveredImpact}
                    clientImpact={hoveredClientImpact}
                    position={hoveredNodePos}
                />

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
                    <div className="absolute right-4 top-1/2 z-500 -translate-y-1/2">
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

            {/* ═══════════════════════════════════════════════════
                DETAIL PANEL — examplestyles design
               ═══════════════════════════════════════════════════ */}
            {selectedDetail && (
                <>
                    {/* Inject panel-scoped keyframes */}
                    <style>{PANEL_GLOBAL_STYLES}</style>

                    {/* ── DESKTOP ASIDE ── */}
                    <aside className="absolute right-4 top-1/2 z-500 hidden w-[350px] -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-zinc-800/60 bg-gradient-to-br from-zinc-900/40 via-[#050505]/90 to-black/95 text-zinc-300 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:flex"
                        style={{ maxHeight: "75vh" }}
                    >
                        {/* Subtle top gradient overlay */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />

                        {/* ── HEADER ── */}
                        <div className="relative z-10 flex flex-shrink-0 items-center justify-between border-b border-white/5 bg-black/40 p-3.5">
                            <div className="flex items-center gap-3">
                                <h2 className="text-base font-semibold text-zinc-100">
                                    {panelLoading
                                        ? <ShellSkeleton className="h-6 w-32" />
                                        : (selectedDetail.label || selectedDetail.id)}
                                </h2>
                                <PanelStatusBadge status={selectedDetail.status} loading={panelLoading} />
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedNodeId(null)}
                                className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-300"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* ── TABS ── */}
                        <div className="relative z-10 flex-shrink-0 px-3.5 pt-3">
                            <div className="flex rounded-lg bg-black p-1">
                                <button
                                    type="button"
                                    onClick={() => setPanelTab("summary")}
                                    className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${panelTab === "summary"
                                        ? "border border-zinc-800 bg-[#18181b] text-zinc-100 shadow-sm"
                                        : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                                        }`}
                                >
                                    Resumen
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPanelTab("clients")}
                                    className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${panelTab === "clients"
                                        ? "border border-zinc-800 bg-[#18181b] text-zinc-100 shadow-sm"
                                        : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                                        }`}
                                >
                                    Clientes
                                </button>
                            </div>
                        </div>

                        {/* ── CONTENT with slide animation ── */}
                        <div className="relative z-10 min-h-0 overflow-hidden">

                            {/* ═══════ TAB 1: RESUMEN ═══════ */}
                            <div className={`w-full space-y-4 overflow-y-auto px-3.5 pb-3.5 pt-3 panel-scrollbar transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${panelTab === "summary" ? "relative translate-x-0 opacity-100 max-h-[60vh]" : "absolute top-0 left-0 -translate-x-8 opacity-0 pointer-events-none"
                                }`}>

                                {/* Basic Info Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-lg border border-white/5 bg-black p-3">
                                        <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Tipo de Nodo</div>
                                        <div className="flex items-center gap-2 font-medium text-zinc-200">
                                            <Server size={14} className="text-blue-400" />
                                            {panelLoading
                                                ? <ShellSkeleton className="h-4 w-12" />
                                                : (selectedDetail.type?.toUpperCase() || "-")}
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-white/5 bg-black p-3">
                                        <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Última vez visto</div>
                                        <div className="flex items-center gap-2 font-medium text-zinc-200">
                                            <Clock size={14} className="text-zinc-400" />
                                            {panelLoading
                                                ? <ShellSkeleton className="h-4 w-20" />
                                                : new Date(selectedDetail.lastSeenAt).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>

                                {/* IMPACT / HEALTH ANALYSIS CARD */}
                                <div className="relative overflow-hidden rounded-lg border border-zinc-800/60 bg-black/40 p-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                                    {/* Glow orb */}
                                    <div className={`pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-[0.25] transition-colors duration-700 ${healthGlow}`} />
                                    {/* Impact badge top-right */}
                                    <div className="absolute right-4 top-4 flex items-center gap-1.5">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Impacto</span>
                                        {panelLoading ? (
                                            <ShellSkeleton className="h-5 w-10" />
                                        ) : (
                                            <span className="rounded border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                                                {selectedImpact ? TIER_LABELS[selectedImpact.impactTier] : "-"}
                                            </span>
                                        )}
                                    </div>

                                    {/* Title with heartbeat */}
                                    <div className="mb-4 flex items-center gap-2">
                                        <HeartbeatLine className={heartbeatColor} width={28} height={16} />
                                        <h3 className="text-sm font-semibold text-zinc-200">Análisis de Salud</h3>
                                    </div>

                                    {/* Main metrics: Score + MRR */}
                                    <div className="mb-5 grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Score</div>
                                            <div className="flex items-baseline gap-1 text-2xl font-bold">
                                                {panelLoading ? (
                                                    <ShellSkeleton className="h-8 w-16" />
                                                ) : (
                                                    <>
                                                        <span className={heartbeatColor}>{selectedImpact?.impactScore ?? "-"}</span>
                                                        <span className="text-xs font-normal text-zinc-600">/100</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">MRR en Riesgo</div>
                                            <div className={`flex items-center gap-1 text-2xl font-bold ${heartbeatColor}`}>
                                                <DollarSign size={18} />
                                                {panelLoading
                                                    ? <ShellSkeleton className="h-8 w-16" />
                                                    : (selectedClientImpact?.affectedMRR ?? 0).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Client distribution bar */}
                                    <div className="mb-2">
                                        <div className="mb-2 flex justify-between text-xs text-zinc-400">
                                            <span className="flex items-center gap-1">
                                                Total Clientes:{" "}
                                                {panelLoading
                                                    ? <ShellSkeleton className="ml-1 h-3 w-6" />
                                                    : <strong className="text-zinc-200">{totalClients}</strong>}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Ticket size={12} className="text-zinc-500" />
                                                {panelLoading
                                                    ? <ShellSkeleton className="h-3 w-14" />
                                                    : `${selectedImpact?.openTickets ?? 0} Tickets`}
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="flex h-2 w-full overflow-hidden rounded-full border border-zinc-800 bg-[#09090b] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                                            {panelLoading ? (
                                                <div className="w-full animate-pulse bg-zinc-800/50" />
                                            ) : (
                                                <>
                                                    <div
                                                        style={{ width: `${onlinePct}%` }}
                                                        className="relative border-r border-black/30 bg-gradient-to-r from-emerald-800 via-emerald-500 to-emerald-300"
                                                        title={`Online: ${onlineClients}`}
                                                    >
                                                        <div className="absolute inset-0 bg-white/20 mix-blend-overlay" />
                                                    </div>
                                                    <div
                                                        style={{ width: `${degradedPct}%` }}
                                                        className="relative border-r border-black/30 bg-gradient-to-r from-amber-700 via-amber-500 to-yellow-300"
                                                        title={`Degradados: ${degradedClients}`}
                                                    >
                                                        <div className="absolute inset-0 bg-white/20 mix-blend-overlay" />
                                                    </div>
                                                    <div
                                                        style={{ width: `${affectedPct}%` }}
                                                        className="relative bg-gradient-to-r from-red-900 via-red-600 to-rose-400"
                                                        title={`Afectados: ${affectedClients}`}
                                                    >
                                                        <div className="absolute inset-0 bg-white/20 mix-blend-overlay" />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Legend */}
                                    <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3 text-[11px]">
                                        <div className="flex items-center gap-1.5 text-zinc-400">
                                            <div className="h-2 w-2 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                                            Online {panelLoading ? <ShellSkeleton className="h-3 w-4" /> : `(${onlineClients})`}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-zinc-400">
                                            <div className="h-2 w-2 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
                                            Degradado {panelLoading ? <ShellSkeleton className="h-3 w-4" /> : `(${degradedClients})`}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-zinc-400">
                                            <div className="h-2 w-2 rounded-full bg-gradient-to-br from-rose-400 to-red-600 shadow-[0_0_8px_rgba(244,63,94,0.7)]" />
                                            Afectado {panelLoading ? <ShellSkeleton className="h-3 w-4" /> : `(${affectedClients})`}
                                        </div>
                                    </div>
                                </div>

                                {/* ── ONU-specific sections ── */}
                                {isClientEdgeNode ? (
                                    <>
                                        {/* CLIENTE ASIGNADO */}
                                        <div className="rounded-lg border border-white/5 bg-black p-4">
                                            <div className="mb-3 flex items-center gap-2">
                                                <Users size={14} className="text-zinc-400" />
                                                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Cliente Asignado</h3>
                                            </div>
                                            <div className="space-y-3 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-zinc-500">Nombre</span>
                                                    {panelLoading
                                                        ? <ShellSkeleton className="h-4 w-24" />
                                                        : <span className="font-medium text-zinc-200">{nodeDetails?.customer?.name || "Sin datos"}</span>}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-zinc-500">Usuario</span>
                                                    {panelLoading
                                                        ? <ShellSkeleton className="h-4 w-20" />
                                                        : <span className="text-zinc-200">{nodeDetails?.customer?.username || "Sin usuario"}</span>}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-zinc-500">Plan</span>
                                                    {panelLoading
                                                        ? <ShellSkeleton className="h-4 w-12" />
                                                        : <span className="text-zinc-200">{nodeDetails?.customer?.plan || "Sin plan"}</span>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* EQUIPO (CPE) */}
                                        <div className="rounded-lg border border-white/5 bg-black p-4">
                                            <div className="mb-3 flex items-center gap-2">
                                                <Wifi size={14} className="text-zinc-400" />
                                                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Equipo (CPE)</h3>
                                            </div>
                                            <div className="space-y-3 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-zinc-500">Modelo</span>
                                                    {panelLoading
                                                        ? <ShellSkeleton className="h-4 w-16" />
                                                        : <span className="text-zinc-200">{nodeDetails?.device.model || "Sin datos"}</span>}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-zinc-500">Vendor</span>
                                                    {panelLoading
                                                        ? <ShellSkeleton className="h-4 w-12" />
                                                        : <span className="text-zinc-200">{nodeDetails?.device.vendor || "Sin datos"}</span>}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-zinc-500">IP</span>
                                                    {panelLoading ? (
                                                        <ShellSkeleton className="h-5 w-24" />
                                                    ) : (
                                                        <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-xs text-zinc-300">
                                                            {nodeDetails?.device.ip || "0.0.0.0"}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    /* ── OLT / NAP sections ── */
                                    <>
                                        {/* INFRAESTRUCTURA */}
                                        <div className="rounded-lg border border-white/5 bg-black p-4">
                                            <div className="mb-3 flex items-center gap-2">
                                                <Server size={14} className="text-zinc-400" />
                                                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Infraestructura</h3>
                                            </div>
                                            <div className="space-y-3 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-zinc-500">Sitio</span>
                                                    {panelLoading
                                                        ? <ShellSkeleton className="h-4 w-28" />
                                                        : <span className="font-medium text-zinc-200">{nodeDetails?.infrastructure?.siteName || selectedDetail.label || selectedDetail.id}</span>}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-zinc-500">Capacidad</span>
                                                    {panelLoading
                                                        ? <ShellSkeleton className="h-4 w-20" />
                                                        : <span className="text-zinc-200">{nodeDetails?.infrastructure?.capacityLabel || "Sin datos"}</span>}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-zinc-500">Uplink</span>
                                                    {panelLoading
                                                        ? <ShellSkeleton className="h-4 w-16" />
                                                        : <span className="text-zinc-200">{nodeDetails?.infrastructure?.uplink || "Sin datos"}</span>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* EQUIPO DE INFRAESTRUCTURA */}
                                        <div className="rounded-lg border border-white/5 bg-black p-4">
                                            <div className="mb-3 flex items-center gap-2">
                                                <Wifi size={14} className="text-zinc-400" />
                                                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Equipo de Infraestructura</h3>
                                            </div>
                                            <div className="space-y-3 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-zinc-500">Modelo</span>
                                                    {panelLoading
                                                        ? <ShellSkeleton className="h-4 w-16" />
                                                        : <span className="text-zinc-200">{nodeDetails?.device.model || "Sin datos"}</span>}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-zinc-500">Vendor</span>
                                                    {panelLoading
                                                        ? <ShellSkeleton className="h-4 w-12" />
                                                        : <span className="text-zinc-200">{nodeDetails?.device.vendor || "Sin datos"}</span>}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-zinc-500">IP</span>
                                                    {panelLoading ? (
                                                        <ShellSkeleton className="h-5 w-24" />
                                                    ) : (
                                                        <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-xs text-zinc-300">
                                                            {nodeDetails?.device.ip || "0.0.0.0"}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Updated at footer */}
                                <div className="flex justify-center pb-2">
                                    {panelLoading ? (
                                        <ShellSkeleton className="h-3 w-32" />
                                    ) : (
                                        <div className="text-center text-[10px] text-zinc-600">
                                            Actualizado: {selectedClientImpact?.lastComputedAt
                                                ? new Date(selectedClientImpact.lastComputedAt).toLocaleTimeString()
                                                : "-"}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ═══════ TAB 2: CLIENTES ═══════ */}
                            <div className={`w-full flex-col px-3.5 pb-3.5 pt-3 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${panelTab === "clients" ? "relative flex translate-x-0 opacity-100" : "absolute flex top-0 left-0 translate-x-8 opacity-0 pointer-events-none"
                                }`}>

                                {/* Filter pills */}
                                <div className="flex flex-shrink-0 gap-2">
                                    {(["all", "affected", "degraded"] as const).map((f) => (
                                        <button
                                            key={f}
                                            type="button"
                                            onClick={() => setClientFilter(f)}
                                            disabled={panelLoading}
                                            className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${clientFilter === f
                                                ? "border-zinc-700 bg-[#18181b] text-zinc-100"
                                                : "border-white/5 bg-black text-zinc-500 hover:border-white/10 hover:text-zinc-300 disabled:opacity-50"
                                                }`}
                                        >
                                            {f === "all" ? "Todos" : f === "affected" ? "Solo Afectados" : "Solo Degradados"}
                                        </button>
                                    ))}
                                </div>

                                {/* Client cards list */}
                                <div
                                    className="mt-4 max-h-[340px] space-y-2 overflow-y-auto pr-2 pb-4 panel-scrollbar"
                                    style={{
                                        WebkitMaskImage: (!panelLoading && paginatedClients.length > 4) || panelLoading
                                            ? "linear-gradient(to bottom, black 85%, transparent 100%)"
                                            : "none",
                                        maskImage: (!panelLoading && paginatedClients.length > 4) || panelLoading
                                            ? "linear-gradient(to bottom, black 85%, transparent 100%)"
                                            : "none",
                                    }}
                                >
                                    {/* Skeleton cards */}
                                    {panelLoading && Array.from({ length: 5 }).map((_, idx) => (
                                        <div key={`skel-${idx}`} className="rounded-lg border border-white/5 bg-black p-3">
                                            <div className="mb-3 flex items-center justify-between">
                                                <ShellSkeleton className="h-4 w-24" />
                                                <ShellSkeleton className="h-5 w-14" />
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 text-xs">
                                                <div>
                                                    <div className="mb-1 text-zinc-500">IP</div>
                                                    <ShellSkeleton className="h-3 w-20" />
                                                </div>
                                                <div>
                                                    <div className="mb-1 text-zinc-500">Plan</div>
                                                    <ShellSkeleton className="h-3 w-16" />
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <div className="mb-1 text-zinc-500">Ingreso</div>
                                                    <ShellSkeleton className="h-3 w-10" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Data cards */}
                                    {!panelLoading && paginatedClients.map((client) => (
                                        <div
                                            key={client.clientId}
                                            className="group cursor-pointer rounded-lg border border-white/5 bg-black p-3 transition-colors hover:bg-[#121212]"
                                        >
                                            <div className="mb-2 flex items-center justify-between">
                                                <div className="truncate pr-2 text-sm font-medium text-zinc-200">
                                                    {client.clientName || client.clientId}
                                                </div>
                                                <PanelStatusBadge status={client.status} />
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 text-xs">
                                                <div>
                                                    <div className="mb-0.5 text-zinc-500">IP</div>
                                                    <div className="font-mono text-zinc-300">{client.ip || "-"}</div>
                                                </div>
                                                <div>
                                                    <div className="mb-0.5 text-zinc-500">Plan</div>
                                                    <div className="text-zinc-300">{client.plan || "-"}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="mb-0.5 text-zinc-500">Ingreso</div>
                                                    <div className="font-medium text-amber-500">
                                                        ${(client.monthlyRevenue ?? DEFAULT_CLIENT_IMPACT_CONFIG.defaultArpu).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Empty state */}
                                    {!panelLoading && filteredClients.length === 0 && (
                                        <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-zinc-500">
                                            <CheckCircle2 size={24} className="text-emerald-500/50" />
                                            No hay clientes en este estado.
                                        </div>
                                    )}
                                </div>

                                {/* Pagination */}
                                {!panelLoading && totalClientPages > 1 && (
                                    <div className="mt-2 flex flex-shrink-0 items-center justify-center gap-2 border-t border-white/5 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setClientPage((p) => Math.max(1, p - 1))}
                                            disabled={clientPage === 1}
                                            className="rounded-full border border-white/5 bg-[#121212] px-3 py-1.5 text-[11px] font-medium text-zinc-400 transition-colors hover:text-white disabled:opacity-40 disabled:hover:text-zinc-400"
                                        >
                                            Previous
                                        </button>

                                        {Array.from({ length: totalClientPages }).map((_, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setClientPage(idx + 1)}
                                                className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-medium transition-colors ${clientPage === idx + 1
                                                    ? "bg-zinc-200 text-black"
                                                    : "border border-white/5 bg-[#121212] text-zinc-400 hover:text-white"
                                                    }`}
                                            >
                                                {idx + 1}
                                            </button>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={() => setClientPage((p) => Math.min(totalClientPages, p + 1))}
                                            disabled={clientPage === totalClientPages}
                                            className="rounded-full border border-white/5 bg-[#121212] px-3 py-1.5 text-[11px] font-medium text-zinc-400 transition-colors hover:text-white disabled:opacity-40 disabled:hover:text-zinc-400"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* ── MOBILE BOTTOM SHEET ── */}
                    <aside className="absolute bottom-0 left-0 right-0 z-500 rounded-t-xl border border-zinc-800/60 bg-gradient-to-br from-zinc-900/95 via-[#050505]/95 to-black/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl sm:hidden">
                        <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-zinc-100">
                                    {selectedDetail.label || selectedDetail.id}
                                </span>
                                <PanelStatusBadge status={selectedDetail.status} />
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedNodeId(null)}
                                className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-300"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Compact health bar */}
                        <div className="mb-2 flex h-1.5 w-full overflow-hidden rounded-full border border-zinc-800 bg-[#09090b]">
                            <div style={{ width: `${onlinePct}%` }} className="bg-gradient-to-r from-emerald-700 to-emerald-400" />
                            <div style={{ width: `${degradedPct}%` }} className="bg-gradient-to-r from-amber-600 to-yellow-400" />
                            <div style={{ width: `${affectedPct}%` }} className="bg-gradient-to-r from-red-800 to-rose-400" />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
                            <div>Tipo: <span className="text-zinc-200">{selectedDetail.type?.toUpperCase() || "-"}</span></div>
                            <div>Score: <span className="font-medium text-emerald-400">{selectedImpact?.impactScore ?? "-"}</span></div>
                            <div>Afectados: <span className="text-zinc-200">{affectedClients}</span></div>
                            <div>MRR: <span className="font-medium text-amber-400">${(selectedClientImpact?.affectedMRR ?? 0).toLocaleString()}</span></div>
                            <div className="col-span-2 truncate">
                                {isClientEdgeNode ? "Cliente" : "Sitio"}:{" "}
                                <span className="text-zinc-200">
                                    {isClientEdgeNode
                                        ? (nodeDetails?.customer?.name || "Sin datos")
                                        : (nodeDetails?.infrastructure?.siteName || selectedDetail.label || "Sin datos")}
                                </span>
                            </div>
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

const TIER_STYLES: Record<ImpactTier, string> = {
    CRITICAL: "border border-red-500/35 bg-red-500/15 text-red-200",
    HIGH: "border border-orange-500/35 bg-orange-500/15 text-orange-200",
    MEDIUM: "border border-yellow-500/35 bg-yellow-500/15 text-yellow-200",
    LOW: "border border-slate-500/35 bg-slate-500/20 text-slate-300",
}

const TIER_LABELS: Record<ImpactTier, string> = {
    CRITICAL: "Crítico",
    HIGH: "Alto",
    MEDIUM: "Medio",
    LOW: "Bajo",
}
