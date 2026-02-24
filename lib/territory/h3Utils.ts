import type { FeatureCollection, Polygon } from "geojson"
import type { TerritoryCell, TerritoryConfig, ResolutionEntry } from "./types"
import { DEFAULT_TERRITORY_CONFIG } from "./types"

/* ── Lazy-load h3-js (WASM ~170KB gzipped) ── */
type H3Module = typeof import("h3-js")
let _h3: H3Module | null = null
let _h3Promise: Promise<H3Module> | null = null

export async function getH3(): Promise<H3Module> {
    if (_h3) return _h3
    if (!_h3Promise) {
        _h3Promise = import("h3-js").then((mod) => {
            _h3 = mod
            return mod
        })
    }
    return _h3Promise
}

/** Check if H3 is already loaded (sync check for guards) */
export function isH3Loaded(): boolean {
    return _h3 !== null
}

/* ── Zoom → H3 resolution ── */
export function getH3Resolution(
    zoom: number,
    config: TerritoryConfig = DEFAULT_TERRITORY_CONFIG,
): number {
    for (const entry of config.resolutionMap) {
        if (zoom <= entry.maxZoom) return entry.resolution
    }
    // Fallback to finest resolution
    return config.resolutionMap[config.resolutionMap.length - 1]?.resolution ?? 8
}

/* ── latLng → H3 index (sync, requires h3 already loaded) ── */
export function latLngToH3(
    h3: H3Module,
    lat: number,
    lng: number,
    resolution: number,
): string {
    return h3.latLngToCell(lat, lng, resolution)
}

/* ── H3 cell → polygon boundary ── */
export function cellToBoundary(
    h3: H3Module,
    cellIndex: string,
): [number, number][] {
    // h3.cellToBoundary returns [[lat, lng], ...] — we need [[lng, lat], ...] for GeoJSON
    const boundary = h3.cellToBoundary(cellIndex, true) as [number, number][]
    return boundary
}

/* ── H3 cell → centroid ── */
export function cellToCentroid(
    h3: H3Module,
    cellIndex: string,
): [number, number] {
    const [lat, lng] = h3.cellToLatLng(cellIndex)
    return [lng, lat]  // GeoJSON order
}

/* ── Build GeoJSON FeatureCollection from territory cells ── */

export interface HexFeatureProperties {
    cellId: string
    resolution: number
    normalized: number
    tier: string
    impactSum: number
    impactMax: number
    affectedClients: number
    affectedMRR: number
    openTickets: number
    degradedClients: number
    nodeCount: number
}

export function buildHexGeoJSON(
    cells: Map<string, TerritoryCell>,
): FeatureCollection<Polygon, HexFeatureProperties> {
    const features: FeatureCollection<Polygon, HexFeatureProperties>["features"] = []

    for (const cell of cells.values()) {
        // Close the polygon ring
        const ring = [...cell.boundary]
        if (ring.length > 0) {
            const first = ring[0]
            const last = ring[ring.length - 1]
            if (first[0] !== last[0] || first[1] !== last[1]) {
                ring.push([...first] as [number, number])
            }
        }

        features.push({
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [ring],
            },
            properties: {
                cellId: cell.id,
                resolution: cell.resolution,
                normalized: cell.normalized,
                tier: cell.tier,
                impactSum: cell.metrics.impactSum,
                impactMax: cell.metrics.impactMax,
                affectedClients: cell.metrics.affectedClients,
                affectedMRR: cell.metrics.affectedMRR,
                openTickets: cell.metrics.openTickets,
                degradedClients: cell.metrics.degradedClients,
                nodeCount: cell.metrics.nodeCount,
            },
        })
    }

    return { type: "FeatureCollection", features }
}
