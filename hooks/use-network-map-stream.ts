"use client"

import { useEffect, useRef, useCallback } from "react"
import { useAtom } from "jotai"
import { deltaBufferAtom, type NodeDelta } from "@/components/network/map/state/mapAtoms"
import type { MapNodeProjection } from "@/types/network/mapProjection"

const BATCH_INTERVAL_MS = 300

/**
 * Placeholder realtime hook.
 *
 * Future: connect to WebSocket / SSE at /api/noc/map/stream.
 * Currently exposes the delta buffer atom for manual testing
 * and a utility to merge deltas onto the Query snapshot.
 */
export function useNetworkMapStream() {
    const [buffer, setBuffer] = useAtom(deltaBufferAtom)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    /** Push a single delta into the buffer. */
    const pushDelta = useCallback(
        (delta: NodeDelta) => setBuffer((prev) => [...prev, delta]),
        [setBuffer],
    )

    /** Clear the buffer after applying. */
    const clearDeltas = useCallback(() => setBuffer([]), [setBuffer])

    /**
     * Apply buffered deltas onto the current snapshot.
     * Returns a new array — caller replaces the rendered list.
     */
    const applyDeltas = useCallback(
        (snapshot: MapNodeProjection[]): MapNodeProjection[] => {
            if (buffer.length === 0) return snapshot

            const deltaMap = new Map<string, NodeDelta>()
            for (const d of buffer) deltaMap.set(d.id, d)

            const merged = snapshot.map((node) => {
                const d = deltaMap.get(node.id)
                if (!d) return node
                return {
                    ...node,
                    ...(d.status !== undefined && { status: d.status }),
                    ...(d.health !== undefined && { health: d.health }),
                    ...(d.lastSeenAt !== undefined && { lastSeenAt: d.lastSeenAt }),
                    ...(d.badge !== undefined && { badge: d.badge }),
                }
            })

            return merged
        },
        [buffer],
    )

    /* Auto-flush timer (runs only when buffer has items) */
    useEffect(() => {
        if (buffer.length === 0) return

        if (!timerRef.current) {
            timerRef.current = setInterval(() => {
                // Consumers read pendingDeltas and call applyDeltas themselves
            }, BATCH_INTERVAL_MS)
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
        }
    }, [buffer.length])

    return {
        pendingDeltas: buffer,
        pushDelta,
        applyDeltas,
        clearDeltas,
    }
}
