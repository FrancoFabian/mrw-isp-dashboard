"use client"

import { useCallback, useEffect, useMemo, useRef } from "react"
import { useAtomValue, useSetAtom } from "jotai"
import type { GeoJSONSource, Map as MapLibreMap, MapLayerMouseEvent } from "maplibre-gl"
import MapView, { Layer, Source, type LayerProps, type MapRef } from "react-map-gl/maplibre"
import { mapFocusRequestAtom, viewportAtom } from "@/components/network/map/state/mapAtoms"
import type { MapNodeProjection } from "@/types/network/mapProjection"
import type { FeatureCollection, Polygon } from "geojson"
import { buildNocGeoJson } from "./buildNocGeoJson"
import { cn } from "@/lib/utils"
import type { MapOverlay } from "./state/mapAtoms"

const styleUrl = `https://api.maptiler.com/maps/${process.env.NEXT_PUBLIC_MAPTILER_STYLE}/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`

const INTERACTIVE_LAYER_IDS = ["noc-clusters", "noc-unclustered-points"]
const NOC_ROAD_CASING_LAYER_ID = "noc-road-casing"

/* ── Fintech dark palette (Tailwind Slate scale) ───────────────────── */
const P = {
    bg: "#020617",
    water: "#0b1220",
    waterShadow: "#000509",
    landAlt: "#0f172a",
    building: "#111827",
    roadCasing: "#020617",
    labelHalo: "#020617",
    labelCity: "#e2e8f0",
    labelTown: "#cbd5e1",
    labelVillage: "#94a3b8",
    labelPlace: "#64748b",
    labelRoad: "#94a3b8",
    labelWater: "#1e3a5f",
} as const

/* ── Road color by class ───────────────────────────────────────────── */
const ROAD_COLOR_EXPR = [
    "match",
    ["coalesce", ["get", "class"], ["get", "type"], ""],
    "motorway", "#64748b",
    "trunk", "#5b6a80",
    "primary", "#475569",
    "secondary", "#3d4d61",
    "tertiary", "#334155",
    "residential", "#2a3649",
    "minor", "#2a3649",
    "service", "#1e293b",
    "#1e293b",
] as const

/* ── Road width factor by class ────────────────────────────────────── */
const ROAD_CLASS_FACTOR_EXPR = [
    "match",
    ["coalesce", ["get", "class"], ["get", "type"], ""],
    "motorway", 1.8,
    "trunk", 1.55,
    "primary", 1.3,
    "secondary", 1.1,
    "tertiary", 0.95,
    "residential", 0.8,
    "minor", 0.7,
    "service", 0.6,
    0.6,
] as const

const ROAD_MAIN_WIDTH_EXPR = [
    "interpolate", ["linear"], ["zoom"],
    8, ["*", 0.7, ROAD_CLASS_FACTOR_EXPR],
    10, ["*", 1.4, ROAD_CLASS_FACTOR_EXPR],
    13, ["*", 3.6, ROAD_CLASS_FACTOR_EXPR],
    16, ["*", 7.0, ROAD_CLASS_FACTOR_EXPR],
    20, ["*", 14.0, ROAD_CLASS_FACTOR_EXPR],
] as const

const ROAD_CASING_WIDTH_EXPR = [
    "interpolate", ["linear"], ["zoom"],
    8, ["*", 1.4, ROAD_CLASS_FACTOR_EXPR],
    10, ["*", 2.2, ROAD_CLASS_FACTOR_EXPR],
    13, ["*", 4.6, ROAD_CLASS_FACTOR_EXPR],
    16, ["*", 9.5, ROAD_CLASS_FACTOR_EXPR],
    20, ["*", 17.0, ROAD_CLASS_FACTOR_EXPR],
] as const

const ROAD_BLUR_EXPR = [
    "interpolate", ["linear"], ["zoom"],
    8, 0.15,
    13, 0.25,
    16, 0.35,
] as const

/* ── Layers to hide entirely ───────────────────────────────────────── */
const BASEMAP_HIDE_PATTERNS: RegExp[] = [
    /boundary/i,
    /admin/i,
    /transit/i,
    /aeroway/i,
    /housenumber/i,
    /building-number/i,
    /landuse-label/i,
    /natural-label/i,
    /road-shield/i,
]

const ROAD_INCLUDE_PATTERNS: RegExp[] = [
    /transportation/i,
    /road/i,
    /street/i,
    /motorway/i,
    /trunk/i,
    /primary/i,
    /secondary/i,
    /tertiary/i,
    /residential/i,
]

const ROAD_EXCLUDE_PATTERNS: RegExp[] = [
    /rail/i,
    /ferry/i,
    /path/i,
    /pedestrian/i,
    /footway/i,
    /boundary/i,
    /admin/i,
]

const CLUSTER_LAYER: LayerProps = {
    id: "noc-clusters",
    type: "circle",
    filter: ["has", "point_count"],
    paint: {
        "circle-color": ["step", ["get", "point_count"], "#172554", 20, "#1e3a8a", 100, "#1d4ed8"],
        "circle-radius": ["step", ["get", "point_count"], 17, 20, 23, 100, 30],
        "circle-stroke-color": "rgba(148,163,184,0.7)",
        "circle-stroke-width": 1.4,
        "circle-opacity": 0.96,
    },
}

const CLUSTER_HALO_LAYER: LayerProps = {
    id: "noc-cluster-halo",
    type: "circle",
    filter: ["has", "point_count"],
    paint: {
        "circle-color": "rgba(56,189,248,0.18)",
        "circle-radius": ["step", ["get", "point_count"], 25, 20, 32, 100, 40],
        "circle-blur": 0.35,
        "circle-opacity": 0.6,
    },
}

const CLUSTER_COUNT_LAYER: LayerProps = {
    id: "noc-cluster-count",
    type: "symbol",
    filter: ["has", "point_count"],
    layout: {
        "text-field": "{point_count_abbreviated}",
        "text-font": ["Open Sans Bold"],
        "text-size": 11,
    },
    paint: {
        "text-color": "#f8fafc",
    },
}

const UNCLUSTERED_ALERT_LAYER: LayerProps = {
    id: "noc-unclustered-alert",
    type: "circle",
    filter: ["!", ["has", "point_count"]],
    paint: {
        "circle-color": [
            "match",
            ["coalesce", ["get", "status"], "UNKNOWN"],
            "OFFLINE",
            "rgba(248,113,113,0.20)",
            "DEGRADED",
            "rgba(251,191,36,0.18)",
            "rgba(148,163,184,0.0)",
        ],
        "circle-radius": [
            "match",
            ["coalesce", ["get", "status"], "UNKNOWN"],
            "OFFLINE",
            13,
            "DEGRADED",
            11,
            0,
        ],
        "circle-blur": 0.25,
        "circle-opacity": 0.65,
    },
}

const UNCLUSTERED_LAYER: LayerProps = {
    id: "noc-unclustered-points",
    type: "circle",
    filter: ["!", ["has", "point_count"]],
    paint: {
        "circle-color": [
            "match",
            ["coalesce", ["get", "status"], "UNKNOWN"],
            "ONLINE",
            "#34d399",
            "OFFLINE",
            "#f87171",
            "DEGRADED",
            "#fbbf24",
            "UNKNOWN",
            "#9ca3af",
            "#9ca3af",
        ],
        "circle-radius": ["match", ["coalesce", ["get", "status"], "UNKNOWN"], "OFFLINE", 8.4, "DEGRADED", 7.6, 6.4],
        "circle-stroke-color": [
            "match",
            ["coalesce", ["get", "impactTier"], "LOW"],
            "CRITICAL", "#ef4444",
            "HIGH", "#f97316",
            "MEDIUM", "#eab308",
            "LOW", "rgba(15,23,42,0.9)",
            "rgba(15,23,42,0.9)",
        ],
        "circle-stroke-width": [
            "match",
            ["coalesce", ["get", "impactTier"], "LOW"],
            "CRITICAL", 2.8,
            "HIGH", 2.2,
            "MEDIUM", 1.8,
            1.5,
        ],
        "circle-opacity": 0.97,
    },
}

/* ── Territory hex layers ─────────────────────────────────── */

const HEX_FILL_LAYER: LayerProps = {
    id: "territory-hex-fill",
    type: "fill",
    paint: {
        "fill-color": [
            "interpolate",
            ["linear"],
            ["get", "normalized"],
            0, "#065f46",
            0.35, "#a16207",
            0.6, "#92400e",
            0.8, "#b91c1c",
            1.0, "#dc2626",
        ],
        "fill-opacity": [
            "interpolate", ["linear"], ["zoom"],
            8, 0.45,
            13, 0.35,
            16, 0.25,
        ],
    },
}

const EXPANSION_FILL_LAYER: LayerProps = {
    id: "expansion-hex-fill",
    type: "fill",
    paint: {
        "fill-color": [
            "interpolate",
            ["linear"],
            ["get", "normalized"],
            0, "#0f172a",
            0.3, "#115e59",
            0.55, "#a16207",
            0.75, "#c2410c",
            1.0, "#dc2626",
        ],
        "fill-opacity": [
            "interpolate", ["linear"], ["zoom"],
            8, 0.45,
            13, 0.35,
            16, 0.25,
        ],
    },
}

const HEX_LINE_LAYER: LayerProps = {
    id: "territory-hex-line",
    type: "line",
    paint: {
        "line-color": "rgba(148,163,184,0.15)",
        "line-width": 0.5,
    },
}

function isRoadLineLayer(layer: { type?: string; id?: string;[key: string]: unknown }): boolean {
    if (layer.type !== "line") return false

    const sourceLayer = typeof layer["source-layer"] === "string" ? layer["source-layer"] : ""
    const id = typeof layer.id === "string" ? layer.id : ""
    const haystack = `${id} ${sourceLayer}`.toLowerCase()

    return ROAD_INCLUDE_PATTERNS.some((pattern) => pattern.test(haystack))
        && !ROAD_EXCLUDE_PATTERNS.some((pattern) => pattern.test(haystack))
}

function isRoadOutlineLayer(layer: { id?: string;[key: string]: unknown }): boolean {
    const lid = (layer.id ?? "").toLowerCase()
    return lid.includes("road") && lid.includes("outline")
}

/* ── Label tuning map (layer id substring → [text-color, halo-width]) */
const LABEL_TUNING: Record<string, [string, number]> = {
    "city": [P.labelCity, 1.4],
    "town": [P.labelTown, 1.3],
    "village": [P.labelVillage, 1.2],
    "state": [P.labelVillage, 1.2],
    "country": [P.labelTown, 1.4],
    "continent": [P.labelPlace, 1.2],
    "place": [P.labelPlace, 1.0],
}

function applyNocBasemapTuning(map: MapLibreMap) {
    const layers = map.getStyle()?.layers ?? []
    const roadLayers = layers.filter((layer) => isRoadLineLayer(layer))

    // Fallback casing: only if the base style lacks a Road network outline
    const hasBaseOutline = layers.some((l) => isRoadOutlineLayer(l))
    if (!hasBaseOutline) {
        const anchor = roadLayers[0]
        const src = anchor?.source
        const srcL = anchor?.["source-layer"]
        if (
            src && typeof src === "string"
            && srcL && typeof srcL === "string"
            && !map.getLayer(NOC_ROAD_CASING_LAYER_ID)
            && anchor?.id
        ) {
            map.addLayer(
                {
                    id: NOC_ROAD_CASING_LAYER_ID,
                    type: "line",
                    source: src,
                    "source-layer": srcL,
                    minzoom: 8,
                    layout: { "line-cap": "round", "line-join": "round" },
                    paint: {
                        "line-color": P.roadCasing,
                        "line-width": ROAD_CASING_WIDTH_EXPR,
                        "line-opacity": 0.72,
                    },
                },
                anchor.id,
            )
        }
    }

    layers.forEach((layer) => {
        const id = layer.id
        const lowerId = id.toLowerCase()

        if (BASEMAP_HIDE_PATTERNS.some((p) => p.test(lowerId))) {
            try { map.setLayoutProperty(id, "visibility", "none") } catch { /* skip */ }
            return
        }

        try {
            // ── Background ───────────────────────────────────────
            if (layer.type === "background") {
                map.setPaintProperty(id, "background-color", P.bg)
            }

            // ── Water ────────────────────────────────────────────
            if (layer.type === "fill" && lowerId.includes("water")) {
                const isWaterShadow = lowerId.includes("shadow")
                map.setPaintProperty(id, "fill-color", isWaterShadow ? P.waterShadow : P.water)
                map.setPaintProperty(id, "fill-opacity", 1.0)
            }

            // ── Land / parks / residential ────────────────────────
            if (layer.type === "fill" && (lowerId.includes("land") || lowerId.includes("park") || lowerId.includes("forest"))) {
                map.setPaintProperty(id, "fill-color", P.landAlt)
                map.setPaintProperty(id, "fill-opacity", 0.4)
            }
            if (layer.type === "fill" && lowerId.includes("residential")) {
                map.setPaintProperty(id, "fill-color", P.bg)
                map.setPaintProperty(id, "fill-opacity", 0.6)
            }

            // ── Buildings ────────────────────────────────────────
            if (layer.type === "fill" && lowerId.includes("building")) {
                map.setPaintProperty(id, "fill-color", P.building)
                map.setPaintProperty(id, "fill-opacity", [
                    "interpolate", ["linear"], ["zoom"],
                    10, 0.35, 13, 0.45, 16, 0.6,
                ])
                if (lowerId.includes("top")) {
                    map.setPaintProperty(id, "fill-outline-color", P.landAlt)
                }
            }

            // ── Road network outline → reuse as casing ──────────
            if (isRoadOutlineLayer(layer)) {
                map.setLayoutProperty(id, "line-cap", "round")
                map.setLayoutProperty(id, "line-join", "round")
                map.setPaintProperty(id, "line-color", P.roadCasing)
                map.setPaintProperty(id, "line-width", ROAD_CASING_WIDTH_EXPR)
                map.setPaintProperty(id, "line-opacity", 0.72)
            }

            // ── Road fills ───────────────────────────────────────
            if (isRoadLineLayer(layer) && id !== NOC_ROAD_CASING_LAYER_ID && !isRoadOutlineLayer(layer)) {
                map.setLayoutProperty(id, "line-cap", "round")
                map.setLayoutProperty(id, "line-join", "round")
                map.setPaintProperty(id, "line-color", ROAD_COLOR_EXPR)
                map.setPaintProperty(id, "line-width", ROAD_MAIN_WIDTH_EXPR)
                map.setPaintProperty(id, "line-blur", ROAD_BLUR_EXPR)
                map.setPaintProperty(id, "line-opacity", 0.92)
            }

            // ── Road labels ──────────────────────────────────────
            if (layer.type === "symbol" && lowerId.includes("road") && lowerId.includes("label")) {
                map.setPaintProperty(id, "text-color", P.labelRoad)
                map.setPaintProperty(id, "text-halo-color", P.labelHalo)
                map.setPaintProperty(id, "text-halo-width", 1.35)
                map.setPaintProperty(id, "text-halo-blur", 0.6)
            }

            // ── Water labels ─────────────────────────────────────
            if (layer.type === "symbol" && lowerId.includes("label") && (lowerId.includes("ocean") || lowerId.includes("sea") || lowerId.includes("lake"))) {
                map.setPaintProperty(id, "text-color", P.labelWater)
                map.setPaintProperty(id, "text-halo-color", P.labelHalo)
                map.setPaintProperty(id, "text-halo-width", 1.0)
            }

            // ── Place labels (class hierarchy) ───────────────────
            if (layer.type === "symbol" && (lowerId.includes("label") || lowerId.includes("place") || lowerId.includes("settlement"))) {
                for (const [key, [color, haloW]] of Object.entries(LABEL_TUNING)) {
                    if (lowerId.includes(key)) {
                        map.setPaintProperty(id, "text-color", color)
                        map.setPaintProperty(id, "text-halo-color", P.labelHalo)
                        map.setPaintProperty(id, "text-halo-width", haloW)
                        map.setPaintProperty(id, "text-halo-blur", 0)
                        break
                    }
                }
            }
        } catch {
            // Ignore style-specific incompatibilities.
        }
    })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyGeoJson = FeatureCollection<Polygon, any>

const EMPTY_HEX_FC: AnyGeoJson = { type: "FeatureCollection", features: [] }

interface NocMapCanvasProps {
    nodes: MapNodeProjection[]
    impactMap?: Map<string, import("@/lib/impact/types").NodeImpact>
    hexGeoJson?: AnyGeoJson | null
    hexLayerMode?: MapOverlay
    onNodeClick?: (id: string) => void
    onHexHover?: (cellId: string, point: { x: number; y: number }) => void
    onHexLeave?: () => void
    className?: string
}

export function NocMapCanvas({ nodes, impactMap, hexGeoJson, hexLayerMode = "impact", onNodeClick, onHexHover, onHexLeave, className }: NocMapCanvasProps) {
    const setViewport = useSetAtom(viewportAtom)
    const setMapFocusRequest = useSetAtom(mapFocusRequestAtom)
    const focusRequest = useAtomValue(mapFocusRequestAtom)
    const mapRef = useRef<MapRef | null>(null)
    const didLogStyleRef = useRef(false)
    const tunedStyleRef = useRef<string | null>(null)
    const geoJson = useMemo(() => buildNocGeoJson(nodes, impactMap), [nodes, impactMap])
    const nodeById = useMemo(
        () => new Map(nodes.map((node) => [node.id, node])),
        [nodes],
    )
    const hasMapTilerEnv = Boolean(process.env.NEXT_PUBLIC_MAPTILER_STYLE && process.env.NEXT_PUBLIC_MAPTILER_KEY)

    const ensureTunedStyle = useCallback(() => {
        const map = mapRef.current?.getMap()
        if (!map) return

        const style = map.getStyle()
        const styleToken = style?.sprite || style?.name || "noc-style"
        if (!styleToken || tunedStyleRef.current === styleToken) return

        applyNocBasemapTuning(map)
        tunedStyleRef.current = styleToken
    }, [])

    useEffect(() => {
        if (process.env.NODE_ENV !== "development" || didLogStyleRef.current) return
        didLogStyleRef.current = true

        if (!hasMapTilerEnv) {
            console.error("[NocMapCanvas] Missing NEXT_PUBLIC_MAPTILER_STYLE / NEXT_PUBLIC_MAPTILER_KEY")
            return
        }

        const host = new URL(styleUrl).host
        console.debug("[NocMapCanvas] MapTiler style resolved", {
            host,
            style: process.env.NEXT_PUBLIC_MAPTILER_STYLE,
        })
    }, [hasMapTilerEnv])

    const syncViewport = useCallback(() => {
        const map = mapRef.current?.getMap()
        if (!map) return

        const bounds = map.getBounds()
        const center = map.getCenter()

        setViewport({
            center: [center.lat, center.lng],
            zoom: map.getZoom(),
            bounds: {
                north: bounds.getNorth(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                west: bounds.getWest(),
            },
        })
    }, [setViewport])

    const handleMapClick = useCallback(
        (event: MapLayerMouseEvent) => {
            const map = mapRef.current?.getMap()
            const feature = event.features?.[0]
            if (!map || !feature || feature.source !== "noc-nodes") return

            if (feature.properties?.cluster) {
                const clusterId = Number(feature.properties.cluster_id)
                if (!Number.isFinite(clusterId) || feature.geometry.type !== "Point") return

                const source = map.getSource("noc-nodes") as GeoJSONSource | undefined
                if (!source) return

                void source
                    .getClusterExpansionZoom(clusterId)
                    .then((zoom) => {
                        map.easeTo({
                            center: [feature.geometry.coordinates[0], feature.geometry.coordinates[1]],
                            zoom: Math.min(zoom, 18),
                            duration: 350,
                        })
                    })
                    .catch(() => undefined)

                return
            }

            const nodeId = feature.properties?.id
            if (nodeId && onNodeClick) onNodeClick(String(nodeId))
        },
        [onNodeClick],
    )

    useEffect(() => {
        if (!focusRequest) return

        const map = mapRef.current?.getMap()
        if (!map) return

        const targetNodes = focusRequest.nodeIds
            .map((id) => nodeById.get(id))
            .filter((node): node is MapNodeProjection => Boolean(node))

        if (targetNodes.length === 0) return

        if (targetNodes.length === 1) {
            map.easeTo({
                center: [targetNodes[0].lng, targetNodes[0].lat],
                zoom: Math.max(map.getZoom(), 13),
                duration: 550,
            })
            setMapFocusRequest(null)
            return
        }

        const lats = targetNodes.map((node) => node.lat)
        const lngs = targetNodes.map((node) => node.lng)
        const south = Math.min(...lats)
        const north = Math.max(...lats)
        const west = Math.min(...lngs)
        const east = Math.max(...lngs)

        map.fitBounds(
            [[west, south], [east, north]],
            { padding: 80, duration: 650, maxZoom: 17 },
        )
        setMapFocusRequest(null)
    }, [focusRequest, nodeById, setMapFocusRequest])

    return (
        <div
            className={cn(
                "relative h-full w-full overflow-hidden rounded-2xl border border-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),0_22px_55px_rgba(2,6,23,0.45)]",
                className,
            )}
        >
            {!hasMapTilerEnv ? (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/90 px-4 text-center text-sm font-medium text-rose-300">
                    Missing NEXT_PUBLIC_MAPTILER_STYLE / NEXT_PUBLIC_MAPTILER_KEY
                </div>
            ) : null}

            {hasMapTilerEnv ? (
                <MapView
                    ref={mapRef}
                    initialViewState={{ latitude: 16.74, longitude: -96.71, zoom: 10 }}
                    mapStyle={styleUrl}
                    minZoom={4}
                    maxZoom={18}
                    interactiveLayerIds={INTERACTIVE_LAYER_IDS}
                    style={{
                        height: "100%",
                        width: "100%",
                        background: "#020617",
                    }}
                    attributionControl={false}
                    onLoad={() => {
                        syncViewport()
                        ensureTunedStyle()
                    }}
                    onStyleData={ensureTunedStyle}
                    onMoveEnd={syncViewport}
                    onClick={handleMapClick}
                    onMouseMove={(e) => {
                        if (!onHexHover) return
                        const map = mapRef.current?.getMap()
                        if (!map) return
                        const queryLayers = hexLayerMode === "expansion" ? ["expansion-hex-fill"] : ["territory-hex-fill"]
                        const features = map.queryRenderedFeatures(e.point, { layers: queryLayers })
                        if (features.length > 0 && features[0].properties?.cellId) {
                            map.getCanvas().style.cursor = "pointer"
                            onHexHover(String(features[0].properties.cellId), { x: e.point.x, y: e.point.y })
                        } else {
                            map.getCanvas().style.cursor = ""
                            onHexLeave?.()
                        }
                    }}
                    onMouseLeave={() => {
                        onHexLeave?.()
                    }}
                    reuseMaps
                >
                    {/* Territory/Expansion hex layer (below nodes) */}
                    <Source
                        id="territory-hex"
                        type="geojson"
                        data={hexGeoJson ?? EMPTY_HEX_FC}
                    >
                        {hexLayerMode === "impact" && <Layer {...HEX_FILL_LAYER} />}
                        {hexLayerMode === "expansion" && <Layer {...EXPANSION_FILL_LAYER} />}
                        <Layer {...HEX_LINE_LAYER} />
                    </Source>

                    {/* Node layers */}
                    <Source
                        id="noc-nodes"
                        type="geojson"
                        data={geoJson}
                        cluster
                        clusterRadius={50}
                        clusterMaxZoom={16}
                    >
                        <Layer {...CLUSTER_HALO_LAYER} />
                        <Layer {...CLUSTER_LAYER} />
                        <Layer {...CLUSTER_COUNT_LAYER} />
                        <Layer {...UNCLUSTERED_ALERT_LAYER} />
                        <Layer {...UNCLUSTERED_LAYER} />
                    </Source>
                </MapView>
            ) : null}

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.06),transparent_58%)]" />
        </div>
    )
}

