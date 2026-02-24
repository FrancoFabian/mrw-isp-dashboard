import type { MapNodeStatus } from "@/types/network/mapProjection"

/* ── Impact tier classification ── */
export type ImpactTier = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

/* ── Raw input for scoring a single node ── */
export interface NodeImpactInput {
    nodeId: string
    status: MapNodeStatus
    affectedClients: number
    affectedMRR: number          // base currency (MXN)
    openTickets: number
    degradedClients: number
}

/* ── Computed impact result ── */
export interface NodeImpact extends NodeImpactInput {
    technicalSeverity: number    // 0–1
    customerFactor: number       // 0–1
    revenueFactor: number        // 0–1
    ticketFactor: number         // 0–1
    impactScore: number          // 0–100 normalised
    impactTier: ImpactTier
    lastComputedAt: string
}

/* ── Tunable scoring configuration ── */
export interface ImpactWeights {
    technical: number
    customer: number
    revenue: number
    ticket: number
}

export interface ImpactNormalization {
    clients: number
    mrr: number
    tickets: number
}

export interface ImpactThresholds {
    critical: number
    high: number
    medium: number
}

export interface ImpactConfig {
    weights: ImpactWeights
    normalization: ImpactNormalization
    thresholds: ImpactThresholds
    statusSeverity: Record<MapNodeStatus, number>
}

/* ── Aggregate stats for observability ── */
export interface ImpactStats {
    byTier: Record<ImpactTier, number>
    maxScore: number
    totalAffectedMRR: number
    totalAffectedClients: number
    nodeCount: number
    computeTimeMs: number
}
