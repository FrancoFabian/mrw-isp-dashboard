import { atom } from "jotai"
import type { MapNodeStatus, MapNodeType, MapNodeProjection } from "@/types/network/mapProjection"
import type { HeatmapMode } from "@/lib/territory/types"
import type { ExpansionCell } from "@/lib/expansion/types"
import type { NocScope } from "@/lib/impact/types"

/* ── Viewport ── */
export interface MapViewport {
    center: [number, number]
    zoom: number
    bounds: {
        north: number
        south: number
        east: number
        west: number
    } | null
}

export const viewportAtom = atom<MapViewport>({
    center: [16.74, -96.71],   // Oaxaca (Valles Centrales) default
    zoom: 10,
    bounds: null,
})

/* ── Selection ── */
export const mapNodesAtom = atom<MapNodeProjection[]>([])
export const selectedNodeIdAtom = atom<string | null>(null)
export const selectedNodeAtom = atom((get) => {
    const id = get(selectedNodeIdAtom)
    if (!id) return null
    return get(mapNodesAtom).find((node) => node.id === id) ?? null
})

/* NOC scope (tenant + optional node ownership) */
export const nocScopeAtom = atom<NocScope>({
    tenantId: "default",
    nodeIds: undefined,
})

/* ── Filters ── */
export interface MapFilters {
    statuses: MapNodeStatus[]
    types: MapNodeType[]
    search: string
}

export const filtersAtom = atom<MapFilters>({
    statuses: ["ONLINE", "OFFLINE", "DEGRADED", "UNKNOWN"],
    types: ["olt", "nap", "onu"],
    search: "",
})

/* ── Layer visibility ── */
export interface MapLayers {
    clusters: boolean
    heatmap: boolean
    labels: boolean
}

export const layersAtom = atom<MapLayers>({
    clusters: true,
    heatmap: false,
    labels: true,
})

export const heatmapModeAtom = atom<HeatmapMode>("impact")

/* ── Overlay mode (impact vs expansion) ── */
export type MapOverlay = "impact" | "expansion"
export const mapOverlayAtom = atom<MapOverlay>("impact")

/* ── ROI simulation trigger ── */
export const roiSimulationAtom = atom<ExpansionCell | null>(null)

/* ── Focus request ── */
export interface MapFocusRequest {
    token: number
    nodeIds: string[]
}

export const mapFocusRequestAtom = atom<MapFocusRequest | null>(null)

/* ── Realtime delta buffer ── */
export interface NodeDelta {
    id: string
    status?: MapNodeStatus
    health?: number
    lastSeenAt?: string
    badge?: string
}

export const deltaBufferAtom = atom<NodeDelta[]>([])

/* ── Derived: bbox query string for the API ── */
export const bboxQueryAtom = atom((get) => {
    const { bounds, zoom } = get(viewportAtom)
    if (!bounds) return null
    return {
        bbox: `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`,
        zoom,
    }
})
