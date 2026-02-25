"use client"

import { useMemo } from "react"
import type { MapNodeProjection } from "@/types/network/mapProjection"
import type { NetworkHealthSummary } from "@/lib/health/types"
import { computeHealth } from "@/lib/health/computeHealth"

/**
 * Memoized network health summary.
 * Recomputes only when nodes array reference changes.
 */
export function useNetworkHealth(nodes: MapNodeProjection[]): NetworkHealthSummary {
    return useMemo(() => computeHealth(nodes), [nodes])
}
