import type { ExpansionCell, ExpansionConfig, OpportunityTier } from "./types"
import { DEFAULT_EXPANSION_CONFIG } from "./types"

/**
 * Re-normalize expansion cells using percentile-based clamping on opportunityScore.
 *
 * This is optional post-processing — the raw scores from computeExpansion
 * are already 0–100, but this adjusts the distribution to prevent outlier
 * cells from compressing the visual scale.
 *
 * Mutates cells in-place for performance. Returns same Map reference.
 */
export function normalizeExpansion(
    cells: Map<string, ExpansionCell>,
    config: ExpansionConfig = DEFAULT_EXPANSION_CONFIG,
): Map<string, ExpansionCell> {
    if (cells.size === 0) return cells

    const percentile = config.normalization.clampPercentile

    // Extract scores
    const scores: number[] = []
    for (const cell of cells.values()) {
        scores.push(cell.opportunityScore)
    }

    // Compute percentile ceiling
    scores.sort((a, b) => a - b)
    const pIndex = Math.min(
        Math.floor(scores.length * percentile),
        scores.length - 1,
    )
    const ceiling = Math.max(scores[pIndex], 1)

    // Re-normalize and re-classify
    for (const cell of cells.values()) {
        // Normalized value for fill-color (0–1)
        const normalizedValue = Math.min(cell.opportunityScore / ceiling, 1)
            // Store as a property for GeoJSON
            ; (cell as ExpansionCell & { _normalized: number })._normalized = normalizedValue

        // Re-classify tier using config thresholds
        cell.opportunityTier = classifyTier(cell.opportunityScore, config)
    }

    return cells
}

function classifyTier(score: number, config: ExpansionConfig): OpportunityTier {
    if (score >= config.tierThresholds.priority) return "PRIORITY"
    if (score >= config.tierThresholds.high) return "HIGH"
    if (score >= config.tierThresholds.medium) return "MEDIUM"
    return "LOW"
}
