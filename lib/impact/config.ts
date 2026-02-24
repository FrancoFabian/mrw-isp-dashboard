import type { ImpactConfig } from "./types"

/**
 * Default Impact Score configuration.
 *
 * All values are tunable — swap this for an admin-panel override
 * or per-tenant config when migrating to backend compute.
 */
export const DEFAULT_IMPACT_CONFIG: ImpactConfig = {
    /* ── Sub-score weights (must sum to 1.0) ── */
    weights: {
        technical: 0.40,
        customer: 0.30,
        revenue: 0.20,
        ticket: 0.10,
    },

    /* ── Normalization ceilings (value / ceiling → 0-1) ── */
    normalization: {
        clients: 200,       // 200 affected clients → factor = 1.0
        mrr: 50_000,    // $50k MRR at risk → factor = 1.0
        tickets: 10,        // 10 open tickets → factor = 1.0
    },

    /* ── Tier thresholds (impactScore 0-100) ── */
    thresholds: {
        critical: 80,
        high: 60,
        medium: 35,
    },

    /* ── Technical severity by node status ── */
    statusSeverity: {
        OFFLINE: 1.0,
        DEGRADED: 0.6,
        UNKNOWN: 0.4,
        ONLINE: 0,
    },
} as const
