import type { ImpactTier } from "@/lib/impact/types"

/* ── Heatmap visualization mode ── */
export type HeatmapMode = "impact" | "revenue" | "clients" | "tickets"

export const HEATMAP_MODE_LABELS: Record<HeatmapMode, string> = {
    impact: "Impacto Operacional",
    revenue: "MRR en Riesgo",
    clients: "Clientes Afectados",
    tickets: "Presión de Tickets",
}

export const HEATMAP_MODE_UNITS: Record<HeatmapMode, string> = {
    impact: "score",
    revenue: "MXN",
    clients: "clientes",
    tickets: "tickets",
}

/* ── Aggregated hex metrics ── */
export interface TerritoryMetrics {
    impactSum: number
    impactMax: number
    affectedClients: number
    affectedMRR: number
    openTickets: number
    degradedClients: number
    nodeCount: number
}

/* ── Top contributor inside a hex ── */
export interface TopContributor {
    nodeId: string
    label: string
    impactScore: number
}

/* ── Single hex cell ── */
export interface TerritoryCell {
    id: string              // h3 index
    resolution: number
    centroid: [number, number]  // [lng, lat]
    boundary: [number, number][]  // polygon ring [[lng, lat], ...]
    metrics: TerritoryMetrics
    normalized: number      // 0–1 for active mode
    tier: ImpactTier
    topContributors: TopContributor[]  // max 3
    lastUpdatedAt: string
}

/* ── Zoom → H3 resolution mapping entry ── */
export interface ResolutionEntry {
    maxZoom: number
    resolution: number
}

/* ── Configurable parameters ── */
export interface TerritoryConfig {
    resolutionMap: ResolutionEntry[]
    normalization: {
        clampPercentile: number  // 0–1, e.g. 0.99 = p99
    }
    modeMetricKey: Record<HeatmapMode, keyof TerritoryMetrics>
}

/* ── Default config ── */
export const DEFAULT_TERRITORY_CONFIG: TerritoryConfig = {
    resolutionMap: [
        { maxZoom: 8, resolution: 6 },
        { maxZoom: 11, resolution: 7 },
        { maxZoom: 14, resolution: 8 },
        { maxZoom: 99, resolution: 9 },
    ],
    normalization: {
        clampPercentile: 0.99,
    },
    modeMetricKey: {
        impact: "impactSum",
        revenue: "affectedMRR",
        clients: "affectedClients",
        tickets: "openTickets",
    },
}
