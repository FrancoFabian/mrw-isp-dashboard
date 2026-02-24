"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { FeatureCollection, Polygon } from "geojson"
import type { MapNodeProjection } from "@/types/network/mapProjection"
import type { NodeImpact } from "@/lib/impact/types"
import type { HeatmapMode, TerritoryCell } from "@/lib/territory/types"
import type { HexFeatureProperties } from "@/lib/territory/h3Utils"
import { getH3, getH3Resolution, buildHexGeoJSON } from "@/lib/territory/h3Utils"
import { aggregateTerritory } from "@/lib/territory/aggregateTerritory"
import { normalizeTerritory } from "@/lib/territory/normalizeTerritory"

export interface UseTerritoryHeatmapResult {
    geoJson: FeatureCollection<Polygon, HexFeatureProperties> | null
    cells: Map<string, TerritoryCell>
    loading: boolean
    error: string | null
    resolution: number
}

/**
 * Compute H3 territory heatmap from visible nodes and impact data.
 *
 * Memoization:
 * - Only recomputes when resolution BUCKET changes (not every zoom tick)
 * - Only re-normalizes when mode changes (skips aggregation)
 * - Returns null when disabled (zero CPU)
 * - h3-js loaded async (only when enabled toggled ON)
 */
export function useTerritoryHeatmap(
    nodes: MapNodeProjection[],
    impactMap: Map<string, NodeImpact>,
    zoom: number,
    mode: HeatmapMode,
    enabled: boolean,
): UseTerritoryHeatmapResult {
    const [h3Module, setH3Module] = useState<typeof import("h3-js") | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Resolution bucket — only changes at zoom thresholds
    const resolution = getH3Resolution(zoom)

    // Track previous aggregation inputs to skip re-aggregation on mode-only changes
    const aggregationCacheRef = useRef<{
        nodesRef: MapNodeProjection[]
        resolution: number
        cells: Map<string, TerritoryCell>
    } | null>(null)

    // ── Load h3-js on first enable ──
    useEffect(() => {
        if (!enabled || h3Module) return

        let cancelled = false
        setLoading(true)
        setError(null)

        getH3()
            .then((mod) => {
                if (!cancelled) {
                    setH3Module(mod)
                    setLoading(false)
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setError("H3 no disponible")
                    setLoading(false)
                }
            })

        return () => { cancelled = true }
    }, [enabled, h3Module])

    // ── Compute territory ──
    const result = useMemo((): { geoJson: FeatureCollection<Polygon, HexFeatureProperties> | null; cells: Map<string, TerritoryCell> } => {
        if (!enabled || !h3Module || nodes.length === 0) {
            return { geoJson: null, cells: new Map() }
        }

        // Check if we can reuse cached aggregation (only mode changed)
        let cells: Map<string, TerritoryCell>
        const cache = aggregationCacheRef.current

        if (cache && cache.nodesRef === nodes && cache.resolution === resolution) {
            // Clone cells for normalization (normalizer mutates in-place)
            cells = new Map()
            for (const [id, cell] of cache.cells) {
                cells.set(id, { ...cell })
            }
        } else {
            // Full re-aggregation
            cells = aggregateTerritory(nodes, impactMap, resolution, h3Module)
            aggregationCacheRef.current = { nodesRef: nodes, resolution, cells }
        }

        // Normalize for active mode
        normalizeTerritory(cells, mode)

        // Build GeoJSON
        const geoJson = buildHexGeoJSON(cells)
        return { geoJson, cells }
    }, [enabled, h3Module, nodes, impactMap, resolution, mode])

    return {
        geoJson: result.geoJson,
        cells: result.cells,
        loading,
        error,
        resolution,
    }
}
