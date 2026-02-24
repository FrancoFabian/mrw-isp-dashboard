"use client"

import { useState, useEffect, useMemo } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { useAtomValue } from "jotai"
import { filtersAtom, type MapViewport } from "@/components/network/map/state/mapAtoms"
import type { MapNodeProjection, MapNodeStatus } from "@/types/network/mapProjection"

function useDebouncedValue<T>(value: T, ms = 300): T {
    const [debounced, setDebounced] = useState(value)
    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), ms)
        return () => clearTimeout(id)
    }, [value, ms])
    return debounced
}

interface BboxBounds {
    west: number
    south: number
    east: number
    north: number
}

const OAXACA_MOCK_NODES: MapNodeProjection[] = [
    {
        id: "oax-tilcajete-olt-01",
        lat: 16.8615,
        lng: -96.6735,
        status: "ONLINE",
        lastSeenAt: "2026-02-24T15:30:00.000Z",
        health: 96,
        label: "San Martin Tilcajete",
        type: "olt",
    },
    {
        id: "oax-tilcajete-nap-01",
        lat: 16.8581,
        lng: -96.6689,
        status: "ONLINE",
        lastSeenAt: "2026-02-24T15:28:00.000Z",
        health: 91,
        label: "San Martin Tilcajete - NAP Centro",
        type: "nap",
    },
    {
        id: "oax-tilcajete-onu-01",
        lat: 16.8651,
        lng: -96.6792,
        status: "DEGRADED",
        lastSeenAt: "2026-02-24T15:24:00.000Z",
        health: 58,
        label: "San Martin Tilcajete - ONU 01",
        type: "onu",
        badge: "Atenuacion alta",
    },
    {
        id: "oax-jalieza-olt-01",
        lat: 16.8472,
        lng: -96.6747,
        status: "ONLINE",
        lastSeenAt: "2026-02-24T15:31:00.000Z",
        health: 94,
        label: "Santo Tomas Jalieza",
        type: "olt",
    },
    {
        id: "oax-jalieza-nap-01",
        lat: 16.8437,
        lng: -96.6695,
        status: "ONLINE",
        lastSeenAt: "2026-02-24T15:25:00.000Z",
        health: 89,
        label: "Santo Tomas Jalieza - NAP Norte",
        type: "nap",
    },
    {
        id: "oax-jalieza-onu-01",
        lat: 16.8514,
        lng: -96.6815,
        status: "OFFLINE",
        lastSeenAt: "2026-02-24T14:58:00.000Z",
        health: 0,
        label: "Santo Tomas Jalieza - ONU 01",
        type: "onu",
        badge: "LOS",
    },
    {
        id: "oax-guegorexe-olt-01",
        lat: 16.7893,
        lng: -96.7442,
        status: "ONLINE",
        lastSeenAt: "2026-02-24T15:27:00.000Z",
        health: 92,
        label: "San Pedro Gegorexe",
        type: "olt",
    },
    {
        id: "oax-guegorexe-nap-01",
        lat: 16.7948,
        lng: -96.7379,
        status: "DEGRADED",
        lastSeenAt: "2026-02-24T15:19:00.000Z",
        health: 63,
        label: "San Pedro Gegorexe - NAP Sur",
        type: "nap",
        badge: "Intermitencia",
    },
    {
        id: "oax-guegorexe-onu-01",
        lat: 16.7844,
        lng: -96.7484,
        status: "ONLINE",
        lastSeenAt: "2026-02-24T15:30:00.000Z",
        health: 86,
        label: "San Pedro Gegorexe - ONU 01",
        type: "onu",
    },
    {
        id: "oax-chilateca-olt-01",
        lat: 16.5867,
        lng: -96.7426,
        status: "ONLINE",
        lastSeenAt: "2026-02-24T15:29:00.000Z",
        health: 93,
        label: "San Jacinto Chilateca",
        type: "olt",
    },
    {
        id: "oax-chilateca-nap-01",
        lat: 16.5812,
        lng: -96.7361,
        status: "ONLINE",
        lastSeenAt: "2026-02-24T15:22:00.000Z",
        health: 88,
        label: "San Jacinto Chilateca - NAP Centro",
        type: "nap",
    },
    {
        id: "oax-chilateca-onu-01",
        lat: 16.5921,
        lng: -96.7493,
        status: "UNKNOWN",
        lastSeenAt: "2026-02-24T14:40:00.000Z",
        health: 40,
        label: "San Jacinto Chilateca - ONU 01",
        type: "onu",
        badge: "Sin telemetria",
    },
]

function parseBbox(bbox: string): BboxBounds | null {
    const parts = bbox.split(",").map((value) => Number(value))
    if (parts.length !== 4 || parts.some((value) => Number.isNaN(value))) return null
    const [west, south, east, north] = parts
    return { west, south, east, north }
}

function inBbox(node: MapNodeProjection, bounds: BboxBounds): boolean {
    return (
        node.lng >= bounds.west &&
        node.lng <= bounds.east &&
        node.lat >= bounds.south &&
        node.lat <= bounds.north
    )
}

function filterMockNodes(
    nodes: MapNodeProjection[],
    bbox: string,
    filters: { statuses: MapNodeStatus[]; types: string[]; search: string },
): MapNodeProjection[] {
    const bounds = parseBbox(bbox)
    const query = filters.search.trim().toLowerCase()

    return nodes.filter((node) => {
        if (bounds && !inBbox(node, bounds)) return false
        if (filters.statuses.length > 0 && !filters.statuses.includes(node.status)) return false
        if (filters.types.length > 0 && node.type && !filters.types.includes(node.type)) return false
        if (query) {
            const haystack = `${node.label || ""} ${node.id}`.toLowerCase()
            if (!haystack.includes(query)) return false
        }
        return true
    })
}

async function fetchMapNodes(
    bbox: string,
    zoom: number,
    filters: { statuses: MapNodeStatus[]; types: string[]; search: string },
    signal?: AbortSignal,
): Promise<MapNodeProjection[]> {
    const params = new URLSearchParams({
        bbox,
        zoom: String(zoom),
        statuses: filters.statuses.join(","),
        types: filters.types.join(","),
        ...(filters.search ? { q: filters.search } : {}),
    })

    try {
        const res = await fetch(`/api/noc/map/nodes?${params}`, { signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
    } catch {
        return filterMockNodes(OAXACA_MOCK_NODES, bbox, filters)
    }
}

export interface UseNetworkMapDataParams {
    viewport: MapViewport
}

export function useNetworkMapDataOaxaca({ viewport }: UseNetworkMapDataParams) {
    const filters = useAtomValue(filtersAtom)
    const debouncedBounds = useDebouncedValue(viewport.bounds, 300)
    const debouncedZoom = useDebouncedValue(viewport.zoom, 300)

    const bbox = useMemo(() => {
        if (!debouncedBounds) return null
        return `${debouncedBounds.west},${debouncedBounds.south},${debouncedBounds.east},${debouncedBounds.north}`
    }, [debouncedBounds])

    return useQuery<MapNodeProjection[]>({
        queryKey: ["noc-map-nodes-oaxaca", bbox, debouncedZoom, filters],
        queryFn: ({ signal }) =>
            bbox ? fetchMapNodes(bbox, debouncedZoom, filters, signal) : Promise.resolve([]),
        enabled: bbox !== null,
        placeholderData: keepPreviousData,
    })
}
