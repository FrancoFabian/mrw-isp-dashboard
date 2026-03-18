"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { useIsNocPressure } from "@/hooks/use-media-query"
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
import { BaseMapToggle } from "./BaseMapToggle"
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
import { useBaseMapStyle } from "@/hooks/useBaseMapStyle"
import { ModernTabs } from "@/components/ui/tabs-modern"

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
    const [isMobileSheetExpanded, setIsMobileSheetExpanded] = useState(false)
    const isNocPressure = useIsNocPressure() // < 1280px

    /* ── Base map style switcher ── */
    const { currentStyle: baseStyle, styleUrl: baseStyleUrl, isSwitching: isStyleSwitching, setStyle: setBaseStyle, markStyleReady } = useBaseMapStyle()

    const handleStyleError = useCallback(() => {
        // If satellite fails, fall back to dataviz
        if (baseStyle !== "dataviz") {
            console.warn("[NocMapShell] Satellite style failed to load, falling back to DataViz.")
            setBaseStyle("dataviz")
        }
    }, [baseStyle, setBaseStyle])

    // ── Label suppression on pressure viewports ──
    const setLayers = useSetAtom(layersAtom)
    useEffect(() => {
        if (isNocPressure && viewport.zoom < 13) {
            setLayers((prev) => prev.labels ? { ...prev, labels: false } : prev)
        }
    }, [isNocPressure, viewport.zoom, setLayers])

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
        setIsMobileSheetExpanded(false)
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

    const handleNodeClick = useCallback((id: string) => {
        setSelectedNodeId((prev) => (prev === id ? null : id))
    }, [setSelectedNodeId])

    const handleNodeHover = useCallback((id: string, point: { x: number; y: number }) => {
        setHoveredNodeId(id)
        setHoveredNodePos(point)
    }, [])

    const handleNodeLeave = useCallback(() => {
        setHoveredNodeId(null)
        setHoveredNodePos(null)
    }, [])

    const handleHexHoverSafe = useMemo(() => layers.heatmap ? handleHexHover : undefined, [layers.heatmap, handleHexHover])
    const handleHexLeaveSafe = useMemo(() => layers.heatmap ? handleHexLeave : undefined, [layers.heatmap, handleHexLeave])

    const renderCanvas = () => (
        <NocMapCanvas
            nodes={nodes}
            impactMap={impactMap}
            clientImpactMap={clientImpactMap}
            selectedNodeId={selectedNodeId}
            hexGeoJson={activeGeoJson}
            hexLayerMode={overlay}
            mapStyleUrl={baseStyleUrl}
            currentBaseStyle={baseStyle}
            onStyleReady={markStyleReady}
            onStyleError={handleStyleError}
            onNodeClick={handleNodeClick}
            onNodeHover={handleNodeHover}
            onNodeLeave={handleNodeLeave}
            onHexHover={handleHexHoverSafe}
            onHexLeave={handleHexLeaveSafe}
        />
    )

    return (
        <div className="relative flex max-md:-mx-4 max-md:-my-4 max-md:h-[calc(100dvh-6rem)] md:h-[calc(100vh-9rem)] flex-col overflow-hidden rounded-2xl max-md:rounded-none border border-white/8 max-md:border-none bg-slate-950/70 shadow-2xl shadow-black/35">
            <div className="pointer-events-none absolute left-0 right-0 top-3 z-20 flex items-start justify-between gap-3 p-3">
                <NocMapToolbar
                    onFocusMyNodes={handleFocusMyNodes}
                    inlineMessage={toolbarMessage}
                />

                <div className="flex shrink-0 flex-col items-end gap-2">
                    {/* Health summary card — hidden below lg */}
                    <div className="pointer-events-auto hidden lg:block">
                        <NetworkHealthCard health={health} onFilterByStatus={handleFilterByStatus} forceCollapsed={isNocPressure} />
                    </div>
                    {/* Base map style toggle */}
                    <div className="pointer-events-auto">
                        <BaseMapToggle
                            currentStyle={baseStyle}
                            isSwitching={isStyleSwitching}
                            onSwitch={setBaseStyle}
                        />
                    </div>
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
                    renderCanvas()
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
                    <div className="absolute bottom-16 left-4 z-20">
                        <ExpansionRanking ranking={ranking} visible={isExpansionOverlay} />
                    </div>
                )}

                {/* ROI Simulator panel (right side) */}
                {roiCell && (
                    <div className="absolute right-4 top-1/2 z-20 -translate-y-1/2">
                        <RoiSimulatorPanel
                            cell={roiCell}
                            onClose={() => setRoiCell(null)}
                        />
                    </div>
                )}
            </div>

            {/* Heatmap legend (bottom-left or bottom-center when ranking is showing) */}
            {layers.heatmap && (
                <div className={`absolute z-20 ${isExpansionOverlay ? "bottom-14 left-80" : "bottom-14 left-4"}`}>
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
                    <aside className="absolute right-4 top-1/2 z-500 hidden -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-zinc-800/60 bg-gradient-to-br from-zinc-900/40 via-[#050505]/90 to-black/95 text-zinc-300 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl lg:flex"
                        style={{ maxHeight: "75vh", width: "clamp(280px, 22vw, 380px)" }}
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
                            <ModernTabs
                                tabs={[
                                    { id: "summary", label: "Resumen" },
                                    { id: "clients", label: "Clientes" }
                                ]}
                                value={panelTab}
                                onChange={(id) => setPanelTab(id as "summary" | "clients")}
                            />
                        </div>

                        {/* ── CONTENT with slide animation ── */}
                        <div className="relative z-10 min-h-0 overflow-hidden">

                            {/* ═══════ TAB 1: RESUMEN ═══════ */}
                            <div className={`w-full space-y-4 overflow-y-auto px-3.5 pb-3.5 pt-3 noc-scrollbar transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${panelTab === "summary" ? "relative translate-x-0 opacity-100 max-h-[60vh]" : "absolute top-0 left-0 -translate-x-8 opacity-0 pointer-events-none"
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
                                    className="mt-4 max-h-[340px] space-y-2 overflow-y-auto pr-2 pb-4 noc-scrollbar"
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

                    {/* ── MOBILE/TABLET BOTTOM SHEET ── */}
                    <aside
                        className={`absolute bottom-0 left-0 right-0 z-25 flex flex-col rounded-t-2xl border-t border-zinc-800/60 bg-linear-to-b from-zinc-900/98 to-black/98 shadow-[0_-8px_32px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all duration-300 ease-in-out lg:hidden touch-pan-y ${isMobileSheetExpanded ? "h-[85dvh]" : "h-auto"
                            }`}
                        onClick={() => !isMobileSheetExpanded && setIsMobileSheetExpanded(true)}
                        onTouchStart={(e) => {
                            e.currentTarget.dataset.startY = e.touches[0].clientY.toString()
                        }}
                        onTouchEnd={(e) => {
                            const startY = parseFloat(e.currentTarget.dataset.startY || "0")
                            const endY = e.changedTouches[0].clientY
                            const deltaY = endY - startY

                            if (Math.abs(deltaY) > 30) {
                                if (deltaY < 0 && !isMobileSheetExpanded) {
                                    setIsMobileSheetExpanded(true)
                                } else if (deltaY > 0 && isMobileSheetExpanded) {
                                    setIsMobileSheetExpanded(false)
                                }
                            }
                        }}
                    >
                        {/* Drag Handle */}
                        <div
                            className="flex w-full cursor-pointer items-center justify-center pt-3 pb-2 touch-none"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMobileSheetExpanded(!isMobileSheetExpanded);
                            }}
                        >
                            <div className="h-1.5 w-12 rounded-full bg-zinc-600/60" />
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col px-4 pb-4">
                            <div className="mb-3 flex items-start justify-between">
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-zinc-100">
                                            {selectedDetail.label || selectedDetail.id}
                                        </span>
                                        <PanelStatusBadge status={selectedDetail.status} />
                                    </div>
                                    {isMobileSheetExpanded && (
                                        <div className="text-xs text-zinc-500">
                                            {isClientEdgeNode ? "Cliente" : "Sitio"}:{" "}
                                            <span className="text-zinc-300">
                                                {isClientEdgeNode
                                                    ? (nodeDetails?.customer?.name || "Sin datos")
                                                    : (nodeDetails?.infrastructure?.siteName || selectedDetail.label || "Sin datos")}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedNodeId(null);
                                    }}
                                    className="rounded-md p-1.5 -mr-1.5 -mt-1.5 text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-300"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Compact health bar ALWAYS VISIBLE */}
                            <div className="mb-3 flex h-1.5 w-full shrink-0 overflow-hidden rounded-full border border-zinc-800 bg-[#09090b]">
                                <div style={{ width: `${onlinePct}%` }} className="bg-gradient-to-r from-emerald-700 to-emerald-400" />
                                <div style={{ width: `${degradedPct}%` }} className="bg-gradient-to-r from-amber-600 to-yellow-400" />
                                <div style={{ width: `${affectedPct}%` }} className="bg-gradient-to-r from-red-800 to-rose-400" />
                            </div>

                            {!isMobileSheetExpanded ? (
                                /* COMPACT VIEW (when not expanded) */
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px] text-zinc-400">
                                    <div className="flex justify-between"><span>Tipo:</span> <span className="text-zinc-200">{selectedDetail.type?.toUpperCase() || "-"}</span></div>
                                    <div className="flex justify-between"><span>Score:</span> <span className="font-medium text-emerald-400">{selectedImpact?.impactScore ?? "-"}</span></div>
                                    <div className="flex justify-between"><span>Afectados:</span> <span className="text-zinc-200">{affectedClients}</span></div>
                                    <div className="flex justify-between"><span>MRR:</span> <span className="font-medium text-amber-400">${(selectedClientImpact?.affectedMRR ?? 0).toLocaleString()}</span></div>
                                    <div className="col-span-2 mt-1 truncate border-t border-white/5 pt-2">
                                        {isClientEdgeNode ? "Cliente" : "Sitio"}:{" "}
                                        <span className="text-zinc-200">
                                            {isClientEdgeNode
                                                ? (nodeDetails?.customer?.name || "Sin datos")
                                                : (nodeDetails?.infrastructure?.siteName || selectedDetail.label || "Sin datos")}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                /* EXPANDED VIEW */
                                <div className="flex-1 overflow-y-auto noc-scrollbar space-y-4 pr-1 pb-4">
                                    {/* Tabs for OLT/NAP */}
                                    {!isClientEdgeNode && (
                                        <div className="flex rounded-lg bg-black p-1 shrink-0 mb-2">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setPanelTab("summary");
                                                }}
                                                className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${panelTab === "summary"
                                                    ? "border border-zinc-800 bg-[#18181b] text-zinc-100 shadow-sm"
                                                    : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                                                    }`}
                                            >
                                                Resumen
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setPanelTab("clients");
                                                }}
                                                className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${panelTab === "clients"
                                                    ? "border border-zinc-800 bg-[#18181b] text-zinc-100 shadow-sm"
                                                    : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                                                    }`}
                                            >
                                                Clientes
                                            </button>
                                        </div>
                                    )}

                                    {/* TAB: SUMMARY / Default ONU view */}
                                    {(isClientEdgeNode || panelTab === "summary") && (
                                        <>
                                            <div className="grid grid-cols-2 gap-3 shrink-0">
                                                <div className="rounded-lg border border-white/5 bg-black/40 p-3">
                                                    <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Afectados</div>
                                                    <div className="text-xl font-bold text-red-500">{affectedClients}</div>
                                                    <div className="text-xs text-zinc-500">De {totalClients} totales</div>
                                                </div>
                                                <div className="rounded-lg border border-white/5 bg-black/40 p-3">
                                                    <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">MRR en Riesgo</div>
                                                    <div className="text-xl font-bold text-amber-500">${(selectedClientImpact?.affectedMRR ?? 0).toLocaleString()}</div>
                                                    <div className="text-xs text-zinc-500">Impacto Mensual</div>
                                                </div>
                                            </div>

                                            {/* Additional info for OLT/NAP */}
                                            {!isClientEdgeNode && (
                                                <div className="space-y-3 shrink-0">
                                                    {/* Infra */}
                                                    <div className="rounded-lg border border-white/5 bg-black/40 p-3.5">
                                                        <div className="mb-3 flex items-center gap-2">
                                                            <Server size={14} className="text-zinc-400" />
                                                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">Infraestructura</h3>
                                                        </div>
                                                        <div className="space-y-2 text-[13px]">
                                                            <div className="flex justify-between"><span className="text-zinc-500">Sitio</span><span className="font-medium text-zinc-200">{nodeDetails?.infrastructure?.siteName || selectedDetail.label || selectedDetail.id}</span></div>
                                                            <div className="flex justify-between"><span className="text-zinc-500">Capacidad</span><span className="text-zinc-200">{nodeDetails?.infrastructure?.capacityLabel || "Sin datos"}</span></div>
                                                            <div className="flex justify-between"><span className="text-zinc-500">Uplink</span><span className="text-zinc-200">{nodeDetails?.infrastructure?.uplink || "Sin datos"}</span></div>
                                                        </div>
                                                    </div>

                                                    {/* Dispositivo */}
                                                    <div className="rounded-lg border border-white/5 bg-black/40 p-3.5">
                                                        <div className="mb-3 flex items-center gap-2">
                                                            <Wifi size={14} className="text-zinc-400" />
                                                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">Equipo</h3>
                                                        </div>
                                                        <div className="space-y-2 text-[13px]">
                                                            <div className="flex justify-between"><span className="text-zinc-500">Modelo</span><span className="text-zinc-200">{nodeDetails?.device.model || "Sin datos"}</span></div>
                                                            <div className="flex justify-between"><span className="text-zinc-500">Vendor</span><span className="text-zinc-200">{nodeDetails?.device.vendor || "Sin datos"}</span></div>
                                                            <div className="flex justify-between"><span className="text-zinc-500">IP</span><span className="font-mono text-zinc-300 bg-white/5 px-1.5 py-0.5 rounded text-xs border border-white/10">{nodeDetails?.device.ip || "0.0.0.0"}</span></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Additional info for ONU */}
                                            {isClientEdgeNode && (
                                                <div className="space-y-3 shrink-0">
                                                    {/* Cliente Asignado */}
                                                    <div className="rounded-lg border border-white/5 bg-black/40 p-3.5">
                                                        <div className="mb-3 flex items-center gap-2">
                                                            <Users size={14} className="text-zinc-400" />
                                                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">Cliente Asignado</h3>
                                                        </div>
                                                        <div className="space-y-2 text-[13px]">
                                                            <div className="flex justify-between"><span className="text-zinc-500">Nombre</span><span className="font-medium text-zinc-200">{nodeDetails?.customer?.name || "Sin datos"}</span></div>
                                                            <div className="flex justify-between"><span className="text-zinc-500">Usuario</span><span className="text-zinc-200">{nodeDetails?.customer?.username || "Sin usuario"}</span></div>
                                                            <div className="flex justify-between"><span className="text-zinc-500">Plan</span><span className="text-zinc-200">{nodeDetails?.customer?.plan || "Sin plan"}</span></div>
                                                        </div>
                                                    </div>

                                                    {/* CPE */}
                                                    <div className="rounded-lg border border-white/5 bg-black/40 p-3.5">
                                                        <div className="mb-3 flex items-center gap-2">
                                                            <Wifi size={14} className="text-zinc-400" />
                                                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">Equipo (CPE)</h3>
                                                        </div>
                                                        <div className="space-y-2 text-[13px]">
                                                            <div className="flex justify-between"><span className="text-zinc-500">Modelo</span><span className="text-zinc-200">{nodeDetails?.device.model || "Sin datos"}</span></div>
                                                            <div className="flex justify-between"><span className="text-zinc-500">Vendor</span><span className="text-zinc-200">{nodeDetails?.device.vendor || "Sin datos"}</span></div>
                                                            <div className="flex justify-between"><span className="text-zinc-500">IP</span><span className="font-mono text-zinc-300 bg-white/5 px-1.5 py-0.5 rounded text-xs border border-white/10">{nodeDetails?.device.ip || "0.0.0.0"}</span></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* TAB: CLIENTES VIEW (Only for non-ONU nodes) */}
                                    {!isClientEdgeNode && panelTab === "clients" && (
                                        <div className="flex flex-col gap-3 shrink-0">
                                            {/* Filters */}
                                            <div className="flex shrink-0 gap-2 pb-1 overflow-x-auto no-scrollbar">
                                                {(["all", "affected", "degraded"] as const).map((f) => (
                                                    <button
                                                        key={f}
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setClientFilter(f);
                                                        }}
                                                        disabled={panelLoading}
                                                        className={`rounded-full border px-3 py-1.5 text-[11px] font-medium capitalize whitespace-nowrap transition-colors ${clientFilter === f
                                                            ? "border-zinc-700 bg-[#18181b] text-zinc-100"
                                                            : "border-white/5 bg-black text-zinc-500 hover:border-white/10 hover:text-zinc-300 disabled:opacity-50"
                                                            }`}
                                                    >
                                                        {f === "all" ? "Todos" : f === "affected" ? "Solo Afectados" : "Solo Degradados"}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Mobile Client List Container */}
                                            <div className="flex flex-col gap-2 relative">
                                                {/* Empty State */}
                                                {!panelLoading && filteredClients.length === 0 && (
                                                    <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-zinc-500">
                                                        <CheckCircle2 size={24} className="text-emerald-500/50" />
                                                        No hay clientes en este estado.
                                                    </div>
                                                )}

                                                {/* Actual Data */}
                                                {!panelLoading && paginatedClients.map((client) => (
                                                    <div key={client.clientId} className="rounded-lg border border-white/5 bg-black p-3.5 flex flex-col gap-2">
                                                        <div className="flex items-center justify-between">
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

                                                {/* Mobile Pagination */}
                                                {!panelLoading && totalClientPages > 1 && (
                                                    <div className="mt-4 flex shrink-0 items-center justify-center gap-2 pt-2">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setClientPage((p) => Math.max(1, p - 1));
                                                            }}
                                                            disabled={clientPage === 1}
                                                            className="rounded-full border border-white/5 bg-black px-4 py-2 text-xs font-medium text-zinc-400 disabled:opacity-40"
                                                        >
                                                            Atrás
                                                        </button>

                                                        <span className="text-xs text-zinc-500">
                                                            {clientPage} de {totalClientPages}
                                                        </span>

                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setClientPage((p) => Math.min(totalClientPages, p + 1));
                                                            }}
                                                            disabled={clientPage === totalClientPages}
                                                            className="rounded-full border border-white/5 bg-black px-4 py-2 text-xs font-medium text-zinc-400 disabled:opacity-40"
                                                        >
                                                            Siguiente
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </aside>
                </>
            )}


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
