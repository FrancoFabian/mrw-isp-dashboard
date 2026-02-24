import type { ImpactConfig, ImpactTier, NodeImpact, NodeImpactInput, ImpactStats } from "./types"
import { DEFAULT_IMPACT_CONFIG } from "./config"

/* ── Single-node scoring (pure, O(1)) ── */

export function computeNodeImpact(
    input: NodeImpactInput,
    config: ImpactConfig = DEFAULT_IMPACT_CONFIG,
): NodeImpact {
    const { weights, normalization, thresholds, statusSeverity } = config

    const technicalSeverity = statusSeverity[input.status] ?? 0
    const customerFactor = Math.min(input.affectedClients / Math.max(normalization.clients, 1), 1)
    const revenueFactor = Math.min(input.affectedMRR / Math.max(normalization.mrr, 1), 1)
    const ticketFactor = Math.min(input.openTickets / Math.max(normalization.tickets, 1), 1)

    const rawScore =
        (technicalSeverity * weights.technical) +
        (customerFactor * weights.customer) +
        (revenueFactor * weights.revenue) +
        (ticketFactor * weights.ticket)

    const impactScore = Math.round(Math.min(rawScore, 1) * 100)

    let impactTier: ImpactTier = "LOW"
    if (impactScore >= thresholds.critical) impactTier = "CRITICAL"
    else if (impactScore >= thresholds.high) impactTier = "HIGH"
    else if (impactScore >= thresholds.medium) impactTier = "MEDIUM"

    return {
        ...input,
        technicalSeverity,
        customerFactor,
        revenueFactor,
        ticketFactor,
        impactScore,
        impactTier,
        lastComputedAt: new Date().toISOString(),
    }
}

/* ── Batch scoring (pure, O(n)) ── */

export function computeImpactBatch(
    inputs: NodeImpactInput[],
    config: ImpactConfig = DEFAULT_IMPACT_CONFIG,
): Map<string, NodeImpact> {
    const result = new Map<string, NodeImpact>()
    for (const input of inputs) {
        result.set(input.nodeId, computeNodeImpact(input, config))
    }
    return result
}

/* ── Aggregate stats (pure, O(n)) ── */

export function computeImpactStats(
    impactMap: Map<string, NodeImpact>,
    computeTimeMs: number = 0,
): ImpactStats {
    const stats: ImpactStats = {
        byTier: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
        maxScore: 0,
        totalAffectedMRR: 0,
        totalAffectedClients: 0,
        nodeCount: impactMap.size,
        computeTimeMs,
    }

    for (const impact of impactMap.values()) {
        stats.byTier[impact.impactTier]++
        if (impact.impactScore > stats.maxScore) stats.maxScore = impact.impactScore
        stats.totalAffectedMRR += impact.affectedMRR
        stats.totalAffectedClients += impact.affectedClients
    }

    return stats
}
