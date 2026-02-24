"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { FeatureCollection, Polygon } from "geojson"
import type { MapNodeProjection } from "@/types/network/mapProjection"
import type { ExpansionCell } from "@/lib/expansion/types"
import { getH3, getH3Resolution } from "@/lib/territory/h3Utils"
import { generateMockLeads } from "@/lib/expansion/generateMockLeads"
import { computeExpansionCells } from "@/lib/expansion/computeExpansion"
import { normalizeExpansion } from "@/lib/expansion/normalizeExpansion"

/** Feature properties for MapLibre data-driven styling */
export interface ExpansionFeatureProperties {
    cellId: string
    resolution: number
    normalized: number
    opportunityScore: number
    tier: string
    leadsNoCoverage: number
    nearestNodeDistanceM: number
    potentialMRR: number
}

function buildExpansionGeoJSON(
    cells: Map<string, ExpansionCell>,
): FeatureCollection<Polygon, ExpansionFeatureProperties> {
    const features: FeatureCollection<Polygon, ExpansionFeatureProperties>["features"] = []

    for (const cell of cells.values()) {
        const ring = [...cell.boundary]
        if (ring.length > 0) {
            const first = ring[0]
            const last = ring[ring.length - 1]
            if (first[0] !== last[0] || first[1] !== last[1]) {
                ring.push([...first] as [number, number])
            }
        }

        // Read the _normalized value set by normalizeExpansion
        const norm = (cell as ExpansionCell & { _normalized?: number })._normalized ?? (cell.opportunityScore / 100)

        features.push({
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [ring],
            },
            properties: {
                cellId: cell.h3Index,
                resolution: cell.resolution,
                normalized: norm,
                opportunityScore: cell.opportunityScore,
                tier: cell.opportunityTier,
                leadsNoCoverage: cell.metrics.leadsNoCoverage,
                nearestNodeDistanceM: cell.metrics.nearestNodeDistanceM,
                potentialMRR: cell.metrics.potentialMRR,
            },
        })
    }

    return { type: "FeatureCollection", features }
}

interface UseExpansionHeatmapResult {
    geoJson: FeatureCollection<Polygon, ExpansionFeatureProperties> | null
    cells: Map<string, ExpansionCell>
    ranking: ExpansionCell[]
    loading: boolean
    error: string | null
}

const EMPTY_MAP = new Map<string, ExpansionCell>()
const EMPTY_RANKING: ExpansionCell[] = []

/**
 * Compute expansion opportunity heatmap.
 *
 * Behavior:
 * - Returns null when disabled (zero CPU)
 * - Loads h3-js lazily on first enable
 * - Generates mock leads once per nodes reference
 * - Recomputes only on resolution bucket change
 * - Ranking sorted desc by opportunityScore
 */
export function useExpansionHeatmap(
    nodes: MapNodeProjection[],
    zoom: number,
    enabled: boolean,
): UseExpansionHeatmapResult {
    const [h3Module, setH3Module] = useState<typeof import("h3-js") | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Memoize mock leads (stable per nodes ref)
    const leads = useMemo(() => {
        if (!enabled || nodes.length === 0) return []
        return generateMockLeads(nodes, 3)
    }, [nodes, enabled])

    // Resolution bucket
    const resolution = getH3Resolution(zoom)
    const prevResRef = useRef<number>(-1)
    const prevNodesRef = useRef<MapNodeProjection[]>([])
    const cachedCellsRef = useRef<Map<string, ExpansionCell>>(EMPTY_MAP)
    const cachedGeoJsonRef = useRef<FeatureCollection<Polygon, ExpansionFeatureProperties> | null>(null)
    const cachedRankingRef = useRef<ExpansionCell[]>(EMPTY_RANKING)

    // Load H3 when enabled
    useEffect(() => {
        if (!enabled || h3Module) return
        setLoading(true)
        getH3()
            .then(setH3Module)
            .catch(() => setError("H3 no disponible"))
            .finally(() => setLoading(false))
    }, [enabled, h3Module])

    // Compute expansion cells
    const needsRecompute = enabled && h3Module && leads.length > 0 && (
        resolution !== prevResRef.current ||
        nodes !== prevNodesRef.current
    )

    if (needsRecompute && h3Module) {
        prevResRef.current = resolution
        prevNodesRef.current = nodes

        const cells = computeExpansionCells(leads, nodes, resolution, h3Module)
        normalizeExpansion(cells)

        // Build ranking
        const ranking = Array.from(cells.values())
            .sort((a, b) => b.opportunityScore - a.opportunityScore)

        cachedCellsRef.current = cells
        cachedGeoJsonRef.current = buildExpansionGeoJSON(cells)
        cachedRankingRef.current = ranking
    }

    if (!enabled) {
        return {
            geoJson: null,
            cells: EMPTY_MAP,
            ranking: EMPTY_RANKING,
            loading: false,
            error: null,
        }
    }

    return {
        geoJson: cachedGeoJsonRef.current,
        cells: cachedCellsRef.current,
        ranking: cachedRankingRef.current,
        loading,
        error,
    }
}
