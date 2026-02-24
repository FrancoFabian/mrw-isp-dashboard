import type { MapNodeProjection } from "@/types/network/mapProjection"
import type { MockLead, ExpansionCell, ExpansionConfig } from "./types"
import { DEFAULT_EXPANSION_CONFIG } from "./types"
import { haversineMeters } from "./haversine"
import { latLngToH3, cellToBoundary, cellToCentroid } from "@/lib/territory/h3Utils"

type H3Module = typeof import("h3-js")

/** Accumulator used during lead aggregation */
interface CellAccumulator {
    leadsNoCoverage: number
    potentialMRR: number
    leadLats: number[]  // for centroid averaging if needed
    leadLngs: number[]
}

/**
 * Aggregate mock leads into H3 cells and compute expansion scores.
 *
 * Pipeline:
 * 1. Group leads by H3 cell → count + sum MRR
 * 2. For each cell centroid, find nearest existing node (haversine)
 * 3. Compute 4-factor score per cell
 *
 * O(leads) for aggregation + O(cells × nodes) for distance (acceptable for <50k)
 */
export function computeExpansionCells(
    leads: MockLead[],
    nodes: MapNodeProjection[],
    resolution: number,
    h3: H3Module,
    config: ExpansionConfig = DEFAULT_EXPANSION_CONFIG,
): Map<string, ExpansionCell> {
    // ── Step 1: Aggregate leads by H3 cell ──
    const accumulators = new Map<string, CellAccumulator>()

    for (const lead of leads) {
        if (!Number.isFinite(lead.lat) || !Number.isFinite(lead.lng)) continue

        const cellId = latLngToH3(h3, lead.lat, lead.lng, resolution)
        let acc = accumulators.get(cellId)
        if (!acc) {
            acc = { leadsNoCoverage: 0, potentialMRR: 0, leadLats: [], leadLngs: [] }
            accumulators.set(cellId, acc)
        }

        acc.leadsNoCoverage++
        acc.potentialMRR += lead.estimatedMRR
    }

    // ── Step 2: Build cells with distance + scoring ──
    const now = new Date().toISOString()
    const result = new Map<string, ExpansionCell>()

    // Pre-filter nodes with valid coords for distance calc
    const validNodes = nodes.filter((n) => Number.isFinite(n.lat) && Number.isFinite(n.lng))

    for (const [cellId, acc] of accumulators) {
        const centroid = cellToCentroid(h3, cellId)
        const boundary = cellToBoundary(h3, cellId)
        const centLat = centroid[1] // centroid is [lng, lat]
        const centLng = centroid[0]

        // Find nearest nodes (top 3)
        const nodeDistances: { nodeId: string; label: string; distanceM: number }[] = []
        for (const node of validNodes) {
            const d = haversineMeters(centLat, centLng, node.lat, node.lng)
            // Insert into sorted array, keep max 3
            if (nodeDistances.length < 3 || d < nodeDistances[nodeDistances.length - 1].distanceM) {
                nodeDistances.push({ nodeId: node.id, label: node.label || node.id, distanceM: Math.round(d) })
                nodeDistances.sort((a, b) => a.distanceM - b.distanceM)
                if (nodeDistances.length > 3) nodeDistances.length = 3
            }
        }

        const nearestDist = nodeDistances.length > 0 ? nodeDistances[0].distanceM : config.distanceMaxMeters

        // ── Compute factors ──
        const demandFactor = Math.min(acc.leadsNoCoverage / config.demandNormalization, 1)
        const distanceFactor = 1 - Math.min(nearestDist / config.distanceMaxMeters, 1)
        const revenueFactor = Math.min(acc.potentialMRR / (config.demandNormalization * config.arpuEstimated), 1)
        const capacityFactor = 0.5 // neutral fallback for v1

        // ── Composite score ──
        const raw =
            demandFactor * config.weights.demand +
            distanceFactor * config.weights.distance +
            revenueFactor * config.weights.revenue +
            capacityFactor * config.weights.capacity

        const opportunityScore = Math.round(raw * 100)

        // ── Tier ──
        const opportunityTier =
            opportunityScore >= config.tierThresholds.priority ? "PRIORITY" as const :
                opportunityScore >= config.tierThresholds.high ? "HIGH" as const :
                    opportunityScore >= config.tierThresholds.medium ? "MEDIUM" as const :
                        "LOW" as const

        result.set(cellId, {
            h3Index: cellId,
            resolution,
            centroid,
            boundary,
            metrics: {
                leadsNoCoverage: acc.leadsNoCoverage,
                nearestNodeDistanceM: nearestDist,
                potentialMRR: acc.potentialMRR,
                nearbyCapacityScore: capacityFactor,
            },
            normalized: {
                demandFactor,
                distanceFactor,
                revenueFactor,
                capacityFactor,
            },
            opportunityScore,
            opportunityTier,
            nearestNodes: nodeDistances,
            lastComputedAt: now,
        })
    }

    return result
}
