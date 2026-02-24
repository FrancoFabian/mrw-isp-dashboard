"use client"

import { useCallback, useMemo, useState } from "react"
import type { ExpansionCell } from "@/lib/expansion/types"
import type { RoiAssumptions, RoiSimulationResult } from "@/lib/roi/types"
import { DEFAULT_ROI_ASSUMPTIONS } from "@/lib/roi/types"
import { simulateRoi } from "@/lib/roi/simulateRoi"

interface UseRoiSimulatorResult {
    result: RoiSimulationResult | null
    assumptions: RoiAssumptions
    setAssumption: <K extends keyof RoiAssumptions>(key: K, value: RoiAssumptions[K]) => void
    resetAssumptions: () => void
}

/**
 * Stateful ROI simulator hook.
 *
 * Takes an ExpansionCell (or null) and manages editable assumptions.
 * Recalculates synchronously on any change — O(1), no debounce needed.
 */
export function useRoiSimulator(cell: ExpansionCell | null): UseRoiSimulatorResult {
    const [assumptions, setAssumptions] = useState<RoiAssumptions>({ ...DEFAULT_ROI_ASSUMPTIONS })

    const setAssumption = useCallback(<K extends keyof RoiAssumptions>(key: K, value: RoiAssumptions[K]) => {
        setAssumptions((prev) => ({ ...prev, [key]: value }))
    }, [])

    const resetAssumptions = useCallback(() => {
        setAssumptions({ ...DEFAULT_ROI_ASSUMPTIONS })
    }, [])

    const result = useMemo<RoiSimulationResult | null>(() => {
        if (!cell) return null

        return simulateRoi({
            location: cell.centroid,
            h3Index: cell.h3Index,
            leadsNoCoverage: cell.metrics.leadsNoCoverage,
            potentialMRR: cell.metrics.potentialMRR,
            nearestNodeDistanceM: cell.metrics.nearestNodeDistanceM,
            assumptions,
        })
    }, [cell, assumptions])

    return { result, assumptions, setAssumption, resetAssumptions }
}
