"use client"

import { useState, useEffect, useMemo } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { useAtomValue } from "jotai"
import { filtersAtom, type MapViewport } from "@/components/network/map/state/mapAtoms"
import type { MapNodeProjection, MapNodeStatus, MapNodeType } from "@/types/network/mapProjection"

function useDebouncedValue<T>(value: T, ms = 300): T {
    const [debounced, setDebounced] = useState(value)
    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), ms)
        return () => clearTimeout(id)
    }, [value, ms])
    return debounced
}

interface ApiMapNodeDto {
    id: string
    lat?: number
    lng?: number
    latitude?: number
    longitude?: number
    status?: string
    lastSeenAt?: string
    last_seen_at?: string
    health?: number
    label?: string
    name?: string
    type?: string
    badge?: string
    customerId?: string
    customer_id?: string
    deviceId?: string
    device_id?: string
}

interface Bbox {
    west: number
    south: number
    east: number
    north: number
}

interface Locality {
    name: string
    lat: number
    lng: number
}

const NODE_PLAN: Record<MapNodeType, number> = {
    olt: 6,
    nap: 34,
    onu: 120,
}

const LOCALITIES: Locality[] = [
    { name: "Oaxaca Centro", lat: 17.0732, lng: -96.7266 },
    { name: "Santa Cruz Xoxocotlan", lat: 17.0295, lng: -96.7358 },
    { name: "San Martin Tilcajete", lat: 16.8628, lng: -96.6937 },
    { name: "Santo Tomas Jalieza", lat: 16.8476, lng: -96.6715 },
    { name: "San Pedro Gegorexe", lat: 16.8189, lng: -96.7051 },
    { name: "San Jacinto Chilateca", lat: 16.5818, lng: -96.7386 },
    { name: "Ocotlan de Morelos", lat: 16.791, lng: -96.6742 },
    { name: "Zaachila", lat: 16.9501, lng: -96.7508 },
    { name: "San Bartolo Coyotepec", lat: 16.9552, lng: -96.7287 },
    { name: "Cuilapam de Guerrero", lat: 16.992, lng: -96.7781 },
]

function normalizeStatus(value?: string): MapNodeStatus {
    switch ((value || "").toUpperCase()) {
        case "ONLINE":
            return "ONLINE"
        case "OFFLINE":
            return "OFFLINE"
        case "DEGRADED":
            return "DEGRADED"
        default:
            return "UNKNOWN"
    }
}

function normalizeType(value?: string): MapNodeType | undefined {
    const normalized = (value || "").toLowerCase()
    if (normalized === "olt" || normalized === "nap" || normalized === "onu") return normalized
    return undefined
}

function mapApiNodeToProjection(dto: ApiMapNodeDto): MapNodeProjection | null {
    const lat = Number(dto.lat ?? dto.latitude)
    const lng = Number(dto.lng ?? dto.longitude)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

    return {
        id: dto.id,
        lat,
        lng,
        status: normalizeStatus(dto.status),
        lastSeenAt: dto.lastSeenAt || dto.last_seen_at || new Date().toISOString(),
        health: Number.isFinite(Number(dto.health)) ? Number(dto.health) : 0,
        label: dto.label || dto.name,
        type: normalizeType(dto.type),
        badge: dto.badge,
        customerId: dto.customerId || dto.customer_id,
        deviceId: dto.deviceId || dto.device_id,
    }
}

function parseBbox(bbox: string): Bbox | null {
    const parts = bbox.split(",").map((value) => Number(value))
    if (parts.length !== 4 || parts.some((value) => Number.isNaN(value))) return null
    const [west, south, east, north] = parts
    return { west, south, east, north }
}

function inBbox(node: MapNodeProjection, bbox: Bbox): boolean {
    return node.lng >= bbox.west && node.lng <= bbox.east && node.lat >= bbox.south && node.lat <= bbox.north
}

function seeded(seed: number): number {
    const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
    return x - Math.floor(x)
}

function jitterByType(type: MapNodeType): { lat: number; lng: number } {
    if (type === "olt") return { lat: 0.003, lng: 0.003 }
    if (type === "nap") return { lat: 0.007, lng: 0.008 }
    return { lat: 0.012, lng: 0.014 }
}

function statusByType(type: MapNodeType, seed: number): MapNodeStatus {
    const r = seeded(seed)
    if (type === "olt") {
        if (r < 0.9) return "ONLINE"
        if (r < 0.95) return "DEGRADED"
        if (r < 0.985) return "OFFLINE"
        return "UNKNOWN"
    }
    if (type === "nap") {
        if (r < 0.8) return "ONLINE"
        if (r < 0.9) return "DEGRADED"
        if (r < 0.97) return "OFFLINE"
        return "UNKNOWN"
    }
    if (r < 0.72) return "ONLINE"
    if (r < 0.86) return "DEGRADED"
    if (r < 0.97) return "OFFLINE"
    return "UNKNOWN"
}

function healthByStatus(status: MapNodeStatus, seed: number): number {
    const noise = seeded(seed)
    if (status === "ONLINE") return Math.round(84 + noise * 16)
    if (status === "DEGRADED") return Math.round(38 + noise * 28)
    if (status === "UNKNOWN") return Math.round(20 + noise * 18)
    return 0
}

function buildLabel(type: MapNodeType, locality: Locality, serial: number): string {
    const localityTag = locality.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 3)
        .toUpperCase()
    return `${type.toUpperCase()}-${localityTag}-${String(serial).padStart(3, "0")}`
}

function generateMockNodes(_center: [number, number], bbox: string): MapNodeProjection[] {
    const bounds = parseBbox(bbox)
    const nodes: MapNodeProjection[] = []

        ; (["olt", "nap", "onu"] as MapNodeType[]).forEach((type) => {
            const total = NODE_PLAN[type]

            for (let index = 0; index < total; index++) {
                const globalSeed = index + (type === "olt" ? 1000 : type === "nap" ? 3000 : 6000)
                const locality = LOCALITIES[Math.floor(seeded(globalSeed) * LOCALITIES.length) % LOCALITIES.length]
                const jitter = jitterByType(type)

                const node: MapNodeProjection = {
                    id: `${type}-${String(index + 1).padStart(3, "0")}`,
                    lat: locality.lat + (seeded(globalSeed + 21) - 0.5) * jitter.lat,
                    lng: locality.lng + (seeded(globalSeed + 42) - 0.5) * jitter.lng,
                    status: statusByType(type, globalSeed + 63),
                    lastSeenAt: new Date(Date.now() - Math.round(seeded(globalSeed + 84) * 4_500_000)).toISOString(),
                    health: healthByStatus(statusByType(type, globalSeed + 63), globalSeed + 105),
                    label: buildLabel(type, locality, index + 1),
                    type,
                    badge: statusByType(type, globalSeed + 63) === "OFFLINE"
                        ? "LOS"
                        : statusByType(type, globalSeed + 63) === "DEGRADED"
                            ? "Atenuacion alta"
                            : undefined,
                    customerId: type === "onu" ? `cust-${((index + 1) % 120) + 1}` : undefined,
                    deviceId: `dev-${type}-${String(index + 1).padStart(5, "0")}`,
                }

                if (!bounds || inBbox(node, bounds)) nodes.push(node)
            }
        })

    return nodes
}

async function fetchMapNodes(
    bbox: string,
    zoom: number,
    filters: { statuses: MapNodeStatus[]; types: string[]; search: string },
    center: [number, number],
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

        const raw = (await res.json()) as ApiMapNodeDto[]
        if (!Array.isArray(raw)) return []

        return raw.map(mapApiNodeToProjection).filter((node): node is MapNodeProjection => node !== null)
    } catch {
        return generateMockNodes(center, bbox)
    }
}

export interface UseNetworkMapDataParams {
    viewport: MapViewport
}

export function useNetworkMapData({ viewport }: UseNetworkMapDataParams) {
    const filters = useAtomValue(filtersAtom)

    const debouncedBounds = useDebouncedValue(viewport.bounds, 300)
    const debouncedZoom = useDebouncedValue(viewport.zoom, 300)

    const bbox = useMemo(() => {
        if (!debouncedBounds) return null
        return `${debouncedBounds.west},${debouncedBounds.south},${debouncedBounds.east},${debouncedBounds.north}`
    }, [debouncedBounds])

    return useQuery<MapNodeProjection[]>({
        queryKey: ["noc-map-nodes", bbox, debouncedZoom, filters],
        queryFn: ({ signal }) =>
            bbox
                ? fetchMapNodes(bbox, debouncedZoom, filters, viewport.center, signal)
                : Promise.resolve([]),
        enabled: bbox !== null,
        placeholderData: keepPreviousData,
        staleTime: 60 * 1000, // 1 minute
    })
}
