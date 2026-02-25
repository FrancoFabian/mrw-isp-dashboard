import type { MapNodeProjection } from "@/types/network/mapProjection"
import type { NetworkHealthSummary, NetworkStatus, HealthConfig } from "./types"
import { DEFAULT_HEALTH_CONFIG } from "./types"

/**
 * Compute global network health in a single O(n) pass.
 *
 * Pure function. No side effects.
 */
export function computeHealth(
    nodes: MapNodeProjection[],
    config: HealthConfig = DEFAULT_HEALTH_CONFIG,
): NetworkHealthSummary {
    const totalNodes = nodes.length

    if (totalNodes === 0) {
        return {
            totalNodes: 0,
            online: 0,
            offline: 0,
            degraded: 0,
            unknown: 0,
            healthScore: 100,
            status: "OK",
        }
    }

    let online = 0
    let offline = 0
    let degraded = 0
    let unknown = 0

    for (const node of nodes) {
        switch (node.status) {
            case "ONLINE": online++; break
            case "OFFLINE": offline++; break
            case "DEGRADED": degraded++; break
            default: unknown++; break
        }
    }

    // Weighted score
    const weightedSum =
        online * config.weights.online +
        degraded * config.weights.degraded +
        offline * config.weights.offline +
        unknown * config.weights.unknown

    const healthScore = Math.round((weightedSum / totalNodes) * 100)

    // Classify status
    const status: NetworkStatus =
        healthScore >= config.thresholds.ok ? "OK" :
            healthScore >= config.thresholds.warning ? "WARNING" :
                "CRITICAL"

    return {
        totalNodes,
        online,
        offline,
        degraded,
        unknown,
        healthScore,
        status,
    }
}
