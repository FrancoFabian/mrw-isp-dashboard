import type { ImpactTier } from "@/lib/impact/types"
import type { HeatmapMode, TerritoryCell, TerritoryConfig, TerritoryMetrics } from "./types"
import { DEFAULT_TERRITORY_CONFIG } from "./types"

/**
 * Normalize territory cells using percentile-based clamping.
 *
 * Algorithm:
 * 1. Extract metric values for active mode from all cells
 * 2. Sort and compute p99 (or configurable percentile)
 * 3. normalized = clamp(value / p99, 0, 1)
 * 4. Classify tier based on normalized value
 *
 * **Mutates** the `normalized` and `tier` fields in-place for perf.
 * Returns the same Map reference.
 */
export function normalizeTerritory(
    cells: Map<string, TerritoryCell>,
    mode: HeatmapMode,
    config: TerritoryConfig = DEFAULT_TERRITORY_CONFIG,
): Map<string, TerritoryCell> {
    if (cells.size === 0) return cells

    const metricKey = config.modeMetricKey[mode]
    const percentile = config.normalization.clampPercentile

    // ── Extract values for percentile computation ──
    const values: number[] = []
    for (const cell of cells.values()) {
        values.push(cell.metrics[metricKey])
    }

    // ── Compute percentile ceiling ──
    values.sort((a, b) => a - b)
    const pIndex = Math.min(
        Math.floor(values.length * percentile),
        values.length - 1,
    )
    const ceiling = Math.max(values[pIndex], 1) // avoid division by zero

    // ── Normalize + classify ──
    for (const cell of cells.values()) {
        const raw = cell.metrics[metricKey]
        cell.normalized = Math.min(raw / ceiling, 1)
        cell.tier = classifyTier(cell.normalized)
    }

    return cells
}

function classifyTier(normalized: number): ImpactTier {
    if (normalized >= 0.8) return "CRITICAL"
    if (normalized >= 0.6) return "HIGH"
    if (normalized >= 0.35) return "MEDIUM"
    return "LOW"
}
