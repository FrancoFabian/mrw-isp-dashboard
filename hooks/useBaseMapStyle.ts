"use client"

import { useState, useCallback, useRef } from "react"
import {
    type BaseMapStyle,
    getBaseStyleUrl,
    readPersistedStyle,
    persistStyle,
} from "@/components/network/map/baseMapStyles"

/**
 * Hook to manage the base map style (DataViz ↔ Satellite).
 *
 * Design decisions:
 * - NO timeouts: isSwitching is flipped by the *real* map lifecycle via markStyleReady().
 * - Hard guard: calling setStyle while isSwitching=true is a no-op.
 * - localStorage persistence wrapped in try/catch (will not crash on failure).
 * - styleUrl is derived from currentStyle so it's always in sync.
 */
export function useBaseMapStyle() {
    const [currentStyle, setCurrentStyle] = useState<BaseMapStyle>(readPersistedStyle)
    const [isSwitching, setIsSwitching] = useState(false)
    const switchingRef = useRef(false)

    const styleUrl = getBaseStyleUrl(currentStyle)

    const setStyle = useCallback((next: BaseMapStyle) => {
        // Guard: no-op if same style or already mid-switch
        if (next === currentStyle || switchingRef.current) return

        switchingRef.current = true
        setIsSwitching(true)
        persistStyle(next)
        setCurrentStyle(next)
    }, [currentStyle])

    const markStyleReady = useCallback(() => {
        // Only flip if we're actually in switching state (idempotent)
        if (!switchingRef.current) return
        switchingRef.current = false
        setIsSwitching(false)
    }, [])

    return {
        currentStyle,
        styleUrl,
        isSwitching,
        setStyle,
        markStyleReady,
    } as const
}
