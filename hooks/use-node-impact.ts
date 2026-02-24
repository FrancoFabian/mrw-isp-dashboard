"use client"

import { useMemo } from "react"
import type { MapNodeProjection } from "@/types/network/mapProjection"
import type { NodeImpact, ImpactStats } from "@/lib/impact/types"
import { computeImpactBatch, computeImpactStats } from "@/lib/impact/computeImpact"
import { generateMockImpactInputs } from "@/lib/impact/generateMockImpactData"
import { DEFAULT_IMPACT_CONFIG } from "@/lib/impact/config"

export interface UseNodeImpactResult {
    impactMap: Map<string, NodeImpact>
    ranking: NodeImpact[]
    stats: ImpactStats
}

/**
 * Compute impact scores for visible nodes.
 *
 * - Memoised on `nodes` array reference (re-computes only when data changes)
 * - Uses mock input data (swappable for real API data in production)
 * - Returns O(1)-lookup Map + desc-sorted ranking array
 */
export function useNodeImpact(nodes: MapNodeProjection[]): UseNodeImpactResult {
    return useMemo(() => {
        const t0 = performance.now()
        const inputs = generateMockImpactInputs(nodes)
        const impactMap = computeImpactBatch(inputs, DEFAULT_IMPACT_CONFIG)
        const computeTimeMs = performance.now() - t0

        // Pre-sorted ranking (desc by impactScore) — used by panel
        const ranking = Array.from(impactMap.values())
            .sort((a, b) => b.impactScore - a.impactScore)

        const stats = computeImpactStats(impactMap, computeTimeMs)

        return { impactMap, ranking, stats }
    }, [nodes])
}
