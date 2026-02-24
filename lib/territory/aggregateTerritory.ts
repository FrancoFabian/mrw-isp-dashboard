import type { MapNodeProjection } from "@/types/network/mapProjection"
import type { NodeImpact } from "@/lib/impact/types"
import type { TerritoryCell, TopContributor, TerritoryMetrics } from "./types"
import { latLngToH3, cellToBoundary, cellToCentroid } from "./h3Utils"

type H3Module = typeof import("h3-js")

/** Mutable accumulator used during aggregation (avoids GC pressure) */
interface CellAccumulator {
    metrics: TerritoryMetrics
    topContributors: TopContributor[]
}

/**
 * Aggregate nodes + impact data into H3 territory cells.
 *
 * **O(n)** single pass over nodes. Top-3 contributors tracked per cell
 * via sorted insert capped at 3 (O(1) amortised per node).
 *
 * @returns Map<h3Index, TerritoryCell> — boundary + centroid populated
 */
export function aggregateTerritory(
    nodes: MapNodeProjection[],
    impactMap: Map<string, NodeImpact>,
    resolution: number,
    h3: H3Module,
): Map<string, TerritoryCell> {
    const accumulators = new Map<string, CellAccumulator>()
    const result = new Map<string, TerritoryCell>()

    // ── Pass 1: accumulate metrics ──
    for (const node of nodes) {
        if (!Number.isFinite(node.lat) || !Number.isFinite(node.lng)) continue

        const cellId = latLngToH3(h3, node.lat, node.lng, resolution)
        const impact = impactMap.get(node.id)

        let acc = accumulators.get(cellId)
        if (!acc) {
            acc = {
                metrics: {
                    impactSum: 0,
                    impactMax: 0,
                    affectedClients: 0,
                    affectedMRR: 0,
                    openTickets: 0,
                    degradedClients: 0,
                    nodeCount: 0,
                },
                topContributors: [],
            }
            accumulators.set(cellId, acc)
        }

        const m = acc.metrics
        m.nodeCount++

        if (impact) {
            m.impactSum += impact.impactScore
            if (impact.impactScore > m.impactMax) m.impactMax = impact.impactScore
            m.affectedClients += impact.affectedClients
            m.affectedMRR += impact.affectedMRR
            m.openTickets += impact.openTickets
            m.degradedClients += impact.degradedClients

            // Track top 3 contributors (sorted desc)
            insertTopContributor(acc.topContributors, {
                nodeId: node.id,
                label: node.label || node.id,
                impactScore: impact.impactScore,
            })
        }
    }

    // ── Pass 2: build cells with boundary + centroid ──
    const now = new Date().toISOString()
    for (const [cellId, acc] of accumulators) {
        const boundary = cellToBoundary(h3, cellId)
        const centroid = cellToCentroid(h3, cellId)

        result.set(cellId, {
            id: cellId,
            resolution,
            centroid,
            boundary,
            metrics: acc.metrics,
            normalized: 0,  // set by normalizer
            tier: "LOW",     // set by normalizer
            topContributors: acc.topContributors,
            lastUpdatedAt: now,
        })
    }

    return result
}

/**
 * Insert contributor into sorted array, keep max 3.
 * O(1) amortised — array is max length 4 before trim.
 */
function insertTopContributor(
    contributors: TopContributor[],
    candidate: TopContributor,
): void {
    // Quick reject: already have 3 and candidate is worse than worst
    if (
        contributors.length >= 3 &&
        candidate.impactScore <= contributors[contributors.length - 1].impactScore
    ) {
        return
    }

    contributors.push(candidate)
    // Sort desc
    contributors.sort((a, b) => b.impactScore - a.impactScore)
    // Cap at 3
    if (contributors.length > 3) contributors.length = 3
}
