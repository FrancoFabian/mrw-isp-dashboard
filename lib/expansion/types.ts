/* ── Opportunity tier classification ── */
export type OpportunityTier = "LOW" | "MEDIUM" | "HIGH" | "PRIORITY"

export const OPPORTUNITY_TIER_LABELS: Record<OpportunityTier, string> = {
    PRIORITY: "Prioritario",
    HIGH: "Alto",
    MEDIUM: "Medio",
    LOW: "Bajo",
}

/* ── Mock lead ── */
export interface MockLead {
    id: string
    lat: number
    lng: number
    estimatedMRR: number
}

/* ── Expansion cell metrics ── */
export interface ExpansionMetrics {
    leadsNoCoverage: number
    nearestNodeDistanceM: number
    potentialMRR: number
    nearbyCapacityScore: number
}

/* ── Normalized factors ── */
export interface ExpansionFactors {
    demandFactor: number
    distanceFactor: number
    revenueFactor: number
    capacityFactor: number
}

/* ── Single expansion cell ── */
export interface ExpansionCell {
    h3Index: string
    resolution: number
    centroid: [number, number]  // [lng, lat]
    boundary: [number, number][]
    metrics: ExpansionMetrics
    normalized: ExpansionFactors
    opportunityScore: number
    opportunityTier: OpportunityTier
    /** Closest existing nodes to this cell */
    nearestNodes: { nodeId: string; label: string; distanceM: number }[]
    lastComputedAt: string
}

/* ── Configurable weights & parameters ── */
export interface ExpansionConfig {
    weights: {
        demand: number
        distance: number
        revenue: number
        capacity: number
    }
    distanceMaxMeters: number
    arpuEstimated: number
    demandNormalization: number
    normalization: {
        clampPercentile: number
    }
    tierThresholds: {
        priority: number
        high: number
        medium: number
    }
}

/* ── Defaults ── */
export const DEFAULT_EXPANSION_CONFIG: ExpansionConfig = {
    weights: {
        demand: 0.40,
        distance: 0.30,
        revenue: 0.20,
        capacity: 0.10,
    },
    distanceMaxMeters: 3000,
    arpuEstimated: 450,         // MXN monthly
    demandNormalization: 20,    // leads per cell for max factor
    normalization: {
        clampPercentile: 0.99,
    },
    tierThresholds: {
        priority: 80,
        high: 60,
        medium: 35,
    },
}
