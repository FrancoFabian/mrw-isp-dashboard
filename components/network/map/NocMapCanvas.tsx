"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useAtomValue, useSetAtom } from "jotai"
import type { GeoJSONSource, Map as MapLibreMap, MapLayerMouseEvent } from "maplibre-gl"
import MapView, { Layer, Marker, Source, type LayerProps, type MapRef } from "react-map-gl/maplibre"
import { mapFocusRequestAtom, viewportAtom } from "@/components/network/map/state/mapAtoms"
import type { MapNodeProjection } from "@/types/network/mapProjection"
import type { FeatureCollection, Polygon } from "geojson"
import { buildNocGeoJson } from "./buildNocGeoJson"
import { cn } from "@/lib/utils"
import type { MapOverlay } from "./state/mapAtoms"
import type { NodeClientImpact, NodeImpact } from "@/lib/impact/types"
import { OltIcon, type OltState } from "@/components/network/icons/OltIcon"
import { NapIcon, type NapState } from "@/components/network/icons/NpaIcon"
import { OnuIcon, type OnuState } from "@/components/network/icons/OnuIcon"

const styleUrl = `https://api.maptiler.com/maps/${process.env.NEXT_PUBLIC_MAPTILER_STYLE}/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`

const INTERACTIVE_LAYER_IDS = ["noc-clusters", "noc-unclustered-points"]
const NOC_ROAD_CASING_LAYER_ID = "noc-road-casing"
const NODE_CLUSTER_MAX_ZOOM = 15
const NODE_ICON_FALLBACK_ZOOM = 15.25

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
    filter: ["all", ["!", ["has", "point_count"]], ["!=", ["coalesce", ["get", "type"], ""], "olt"], ["!=", ["coalesce", ["get", "type"], ""], "nap"], ["!=", ["coalesce", ["get", "type"], ""], "onu"]],
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

const UNCLUSTERED_AFFECTED_SEVERITY_LAYER: LayerProps = {
    id: "noc-unclustered-affected-severity",
    type: "circle",
    filter: ["all", ["!", ["has", "point_count"]], ["!=", ["coalesce", ["get", "type"], ""], "olt"], ["!=", ["coalesce", ["get", "type"], ""], "nap"], ["!=", ["coalesce", ["get", "type"], ""], "onu"], [">", ["coalesce", ["get", "affectedClients"], 0], 0]],
    paint: {
        "circle-color": [
            "match",
            ["coalesce", ["get", "affectedSeverity"], "NONE"],
            "HIGH", "rgba(248,113,113,0.24)",
            "LOW", "rgba(251,191,36,0.18)",
            "rgba(0,0,0,0)",
        ],
        "circle-radius": [
            "match",
            ["coalesce", ["get", "affectedSeverity"], "NONE"],
            "HIGH", 16,
            "LOW", 13,
            0,
        ],
        "circle-blur": 0.4,
        "circle-opacity": 0.9,
    },
}

const UNCLUSTERED_LAYER: LayerProps = {
    id: "noc-unclustered-points",
    type: "circle",
    filter: ["all", ["!", ["has", "point_count"]], ["!=", ["coalesce", ["get", "type"], ""], "olt"], ["!=", ["coalesce", ["get", "type"], ""], "nap"], ["!=", ["coalesce", ["get", "type"], ""], "onu"]],
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

const UNCLUSTERED_AFFECTED_BADGE_LAYER: LayerProps = {
    id: "noc-unclustered-affected-badge",
    type: "symbol",
    filter: ["all", ["!", ["has", "point_count"]], ["!=", ["coalesce", ["get", "type"], ""], "olt"], ["!=", ["coalesce", ["get", "type"], ""], "nap"], ["!=", ["coalesce", ["get", "type"], ""], "onu"], [">", ["coalesce", ["get", "affectedClients"], 0], 0]],
    minzoom: 9,
    layout: {
        "text-field": ["to-string", ["coalesce", ["get", "affectedClients"], 0]],
        "text-font": ["Open Sans Bold"],
        "text-size": 10,
        "text-offset": [0, -1.3],
        "text-allow-overlap": true,
        "text-ignore-placement": true,
    },
    paint: {
        "text-color": [
            "match",
            ["coalesce", ["get", "affectedSeverity"], "NONE"],
            "HIGH", "#fecaca",
            "LOW", "#fde68a",
            "#f8fafc",
        ],
        "text-halo-color": "rgba(2,6,23,0.95)",
        "text-halo-width": 1.4,
    },
}

const UNCLUSTERED_OLT_HIT_LAYER: LayerProps = {
    id: "noc-unclustered-olt-hit",
    type: "circle",
    filter: ["all", ["!", ["has", "point_count"]], ["==", ["coalesce", ["get", "type"], ""], "olt"]],
    paint: {
        "circle-color": "rgba(0,0,0,0)",
        "circle-radius": 20,
        "circle-opacity": 0,
    },
}

const UNCLUSTERED_NAP_HIT_LAYER: LayerProps = {
    id: "noc-unclustered-nap-hit",
    type: "circle",
    filter: ["all", ["!", ["has", "point_count"]], ["==", ["coalesce", ["get", "type"], ""], "nap"]],
    paint: {
        "circle-color": "rgba(0,0,0,0)",
        "circle-radius": 20,
        "circle-opacity": 0,
    },
}

const UNCLUSTERED_ONU_HIT_LAYER: LayerProps = {
    id: "noc-unclustered-onu-hit",
    type: "circle",
    filter: ["all", ["!", ["has", "point_count"]], ["==", ["coalesce", ["get", "type"], ""], "onu"]],
    paint: {
        "circle-color": "rgba(0,0,0,0)",
        "circle-radius": 16,
        "circle-opacity": 0,
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

function toOltState(status: MapNodeProjection["status"]): OltState {
    if (status === "ONLINE") return "online"
    if (status === "OFFLINE") return "offline"
    if (status === "DEGRADED") return "degraded"
    return "unknown"
}

function toNapState(status: MapNodeProjection["status"]): NapState {
    if (status === "ONLINE") return "online"
    if (status === "OFFLINE") return "offline"
    if (status === "DEGRADED") return "degraded"
    return "unknown"
}

function toOnuState(status: MapNodeProjection["status"]): OnuState {
    if (status === "ONLINE") return "online"
    if (status === "OFFLINE") return "offline"
    if (status === "DEGRADED") return "degraded"
    return "unknown"
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
        const anchor = roadLayers[0] as Record<string, unknown> | undefined
        const src = anchor?.source
        const srcL = anchor?.["source-layer"]
        const anchorId = typeof anchor?.id === "string" ? anchor.id : undefined
        if (
            src && typeof src === "string"
            && srcL && typeof srcL === "string"
            && !map.getLayer(NOC_ROAD_CASING_LAYER_ID)
            && anchorId
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
                        "line-width": ROAD_CASING_WIDTH_EXPR as unknown as any,
                        "line-opacity": 0.72,
                    },
                },
                anchorId,
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
    impactMap?: Map<string, NodeImpact>
    clientImpactMap?: Map<string, NodeClientImpact>
    selectedNodeId?: string | null
    hexGeoJson?: AnyGeoJson | null
    hexLayerMode?: MapOverlay
    onNodeClick?: (id: string) => void
    onNodeHover?: (id: string, point: { x: number; y: number }) => void
    onNodeLeave?: () => void
    onHexHover?: (cellId: string, point: { x: number; y: number }) => void
    onHexLeave?: () => void
    className?: string
}

export function NocMapCanvas({
    nodes,
    impactMap,
    clientImpactMap,
    selectedNodeId,
    hexGeoJson,
    hexLayerMode = "impact",
    onNodeClick,
    onNodeHover,
    onNodeLeave,
    onHexHover,
    onHexLeave,
    className,
}: NocMapCanvasProps) {
    const setViewport = useSetAtom(viewportAtom)
    const setMapFocusRequest = useSetAtom(mapFocusRequestAtom)
    const focusRequest = useAtomValue(mapFocusRequestAtom)
    const mapRef = useRef<MapRef | null>(null)
    const didLogStyleRef = useRef(false)
    const tunedStyleRef = useRef<string | null>(null)
    const refreshVisibleOltRafRef = useRef<number | null>(null)
    const [mapZoom, setMapZoom] = useState(10)
    const [hoveredOltId, setHoveredOltId] = useState<string | null>(null)
    const [hoveredNapId, setHoveredNapId] = useState<string | null>(null)
    const [hoveredOnuId, setHoveredOnuId] = useState<string | null>(null)
    const [visibleOltIds, setVisibleOltIds] = useState<Set<string>>(new Set())
    const [visibleNapIds, setVisibleNapIds] = useState<Set<string>>(new Set())
    const [visibleOnuIds, setVisibleOnuIds] = useState<Set<string>>(new Set())
    const [hasVisibleClusters, setHasVisibleClusters] = useState(false)
    const geoJson = useMemo(
        () => buildNocGeoJson(nodes, impactMap, clientImpactMap),
        [nodes, impactMap, clientImpactMap],
    )
    const oltNodes = useMemo(
        () => nodes.filter((node) => node.type === "olt"),
        [nodes],
    )
    const napNodes = useMemo(
        () => nodes.filter((node) => node.type === "nap"),
        [nodes],
    )
    const onuNodes = useMemo(
        () => nodes.filter((node) => node.type === "onu"),
        [nodes],
    )
    const visibleOltNodes = useMemo(
        () => oltNodes.filter((node) => visibleOltIds.has(node.id)),
        [oltNodes, visibleOltIds],
    )
    const visibleNapNodes = useMemo(
        () => napNodes.filter((node) => visibleNapIds.has(node.id)),
        [napNodes, visibleNapIds],
    )
    const visibleOnuNodes = useMemo(
        () => onuNodes.filter((node) => visibleOnuIds.has(node.id)),
        [onuNodes, visibleOnuIds],
    )
    const effectiveVisibleOltNodes = useMemo(() => {
        if (visibleOltNodes.length > 0) return visibleOltNodes
        if (mapZoom >= NODE_ICON_FALLBACK_ZOOM && !hasVisibleClusters) return oltNodes
        return []
    }, [visibleOltNodes, oltNodes, mapZoom, hasVisibleClusters])
    const effectiveVisibleNapNodes = useMemo(() => {
        if (visibleNapNodes.length > 0) return visibleNapNodes
        if (mapZoom >= NODE_ICON_FALLBACK_ZOOM && !hasVisibleClusters) return napNodes
        return []
    }, [visibleNapNodes, napNodes, mapZoom, hasVisibleClusters])
    const effectiveVisibleOnuNodes = useMemo(() => {
        if (visibleOnuNodes.length > 0) return visibleOnuNodes
        if (mapZoom >= NODE_ICON_FALLBACK_ZOOM && !hasVisibleClusters) return onuNodes
        return []
    }, [visibleOnuNodes, onuNodes, mapZoom, hasVisibleClusters])
    const shouldRenderOltMarkers = effectiveVisibleOltNodes.length > 0
    const shouldRenderNapMarkers = effectiveVisibleNapNodes.length > 0
    const shouldRenderOnuMarkers = effectiveVisibleOnuNodes.length > 0
    const oltIconSize = useMemo(() => {
        // Base size doubled (+100%): 81 -> 162
        // Then grow slightly with zoom, capped to avoid excessive scaling.
        const growthFactor = Math.min(1.2, 1 + Math.max(0, mapZoom - 16) * 0.1)
        return Math.round(162 * growthFactor)
    }, [mapZoom])
    const napIconSize = useMemo(() => {
        const growthFactor = Math.min(1.15, 1 + Math.max(0, mapZoom - 16) * 0.08)
        return Math.round(110 * growthFactor)
    }, [mapZoom])
    const onuIconSize = useMemo(() => {
        const growthFactor = Math.min(1.12, 1 + Math.max(0, mapZoom - 16) * 0.07)
        return Math.round(88 * growthFactor)
    }, [mapZoom])
    const nodeById = useMemo(
        () => new Map(nodes.map((node) => [node.id, node])),
        [nodes],
    )
    const hasMapTilerEnv = Boolean(process.env.NEXT_PUBLIC_MAPTILER_STYLE && process.env.NEXT_PUBLIC_MAPTILER_KEY)

    const ensureTunedStyle = useCallback(() => {
        const map = mapRef.current?.getMap()
        if (!map) return

        const style = map.getStyle()
        const styleToken = style?.name ?? (typeof style?.sprite === "string" ? style.sprite : "noc-style")
        if (!styleToken || tunedStyleRef.current === styleToken) return

        applyNocBasemapTuning(map)
        tunedStyleRef.current = styleToken
    }, [])

    const refreshVisibleOltNodes = useCallback(() => {
        const map = mapRef.current?.getMap()
        if (!map) return

        const oltHitLayerId = "noc-unclustered-olt-hit"
        const napHitLayerId = "noc-unclustered-nap-hit"
        const onuHitLayerId = "noc-unclustered-onu-hit"
        const hasOltHitLayer = Boolean(map.getLayer(oltHitLayerId))
        const hasNapHitLayer = Boolean(map.getLayer(napHitLayerId))
        const hasOnuHitLayer = Boolean(map.getLayer(onuHitLayerId))
        const clusterLayerId = "noc-clusters"
        const hasClusterLayer = Boolean(map.getLayer(clusterLayerId))

        if (!hasOltHitLayer && !hasNapHitLayer && !hasOnuHitLayer) {
            setVisibleOltIds((prev) => (prev.size === 0 ? prev : new Set()))
            setVisibleNapIds((prev) => (prev.size === 0 ? prev : new Set()))
            setVisibleOnuIds((prev) => (prev.size === 0 ? prev : new Set()))
            setHasVisibleClusters(false)
            return
        }

        if (hasClusterLayer) {
            const clusterFeatures = map.queryRenderedFeatures(undefined, { layers: [clusterLayerId] })
            setHasVisibleClusters(clusterFeatures.length > 0)
        } else {
            setHasVisibleClusters(false)
        }

        const nextOlt = new Set<string>()
        if (hasOltHitLayer) {
            const oltFeatures = map.queryRenderedFeatures(undefined, { layers: [oltHitLayerId] })
            for (const feature of oltFeatures) {
                const id = feature.properties?.id
                if (id) nextOlt.add(String(id))
            }
        }

        setVisibleOltIds((prev) => {
            if (prev.size === nextOlt.size) {
                let same = true
                for (const id of prev) {
                    if (!nextOlt.has(id)) {
                        same = false
                        break
                    }
                }
                if (same) return prev
            }
            return nextOlt
        })

        const nextNap = new Set<string>()
        if (hasNapHitLayer) {
            const napFeatures = map.queryRenderedFeatures(undefined, { layers: [napHitLayerId] })
            for (const feature of napFeatures) {
                const id = feature.properties?.id
                if (id) nextNap.add(String(id))
            }
        }

        setVisibleNapIds((prev) => {
            if (prev.size === nextNap.size) {
                let same = true
                for (const id of prev) {
                    if (!nextNap.has(id)) {
                        same = false
                        break
                    }
                }
                if (same) return prev
            }
            return nextNap
        })

        const nextOnu = new Set<string>()
        if (hasOnuHitLayer) {
            const onuFeatures = map.queryRenderedFeatures(undefined, { layers: [onuHitLayerId] })
            for (const feature of onuFeatures) {
                const id = feature.properties?.id
                if (id) nextOnu.add(String(id))
            }
        }

        setVisibleOnuIds((prev) => {
            if (prev.size === nextOnu.size) {
                let same = true
                for (const id of prev) {
                    if (!nextOnu.has(id)) {
                        same = false
                        break
                    }
                }
                if (same) return prev
            }
            return nextOnu
        })
    }, [])

    const scheduleRefreshVisibleOltNodes = useCallback(() => {
        if (refreshVisibleOltRafRef.current !== null) return
        refreshVisibleOltRafRef.current = window.requestAnimationFrame(() => {
            refreshVisibleOltRafRef.current = null
            refreshVisibleOltNodes()
        })
    }, [refreshVisibleOltNodes])

    useEffect(() => {
        scheduleRefreshVisibleOltNodes()
    }, [geoJson, scheduleRefreshVisibleOltNodes])

    useEffect(() => {
        return () => {
            if (refreshVisibleOltRafRef.current !== null) {
                window.cancelAnimationFrame(refreshVisibleOltRafRef.current)
            }
        }
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
        const zoom = map.getZoom()
        setMapZoom(zoom)

        setViewport({
            center: [center.lat, center.lng],
            zoom,
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
                        const expansionZoom = Math.min(zoom + 0.75, 18)
                        const point = feature.geometry as unknown as { coordinates: [number, number] }
                        map.easeTo({
                            center: [point.coordinates[0], point.coordinates[1]],
                            zoom: expansionZoom,
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
                        scheduleRefreshVisibleOltNodes()
                    }}
                    onMove={(event) => {
                        setMapZoom(event.viewState.zoom)
                        scheduleRefreshVisibleOltNodes()
                    }}
                    onStyleData={() => {
                        ensureTunedStyle()
                        scheduleRefreshVisibleOltNodes()
                    }}
                    onMoveEnd={() => {
                        syncViewport()
                        scheduleRefreshVisibleOltNodes()
                    }}
                    onClick={handleMapClick}
                    onMouseMove={(e) => {
                        const map = mapRef.current?.getMap()
                        if (!map) return

                        let hasPointerTarget = false

                        if (onNodeHover) {
                            const nodeLayerId = "noc-unclustered-points"
                            if (map.getLayer(nodeLayerId)) {
                                const nodeFeatures = map.queryRenderedFeatures(e.point, { layers: [nodeLayerId] })
                                const nodeFeature = nodeFeatures[0]
                                const nodeId = nodeFeature?.properties?.id
                                if (nodeId) {
                                    hasPointerTarget = true
                                    onNodeHover(String(nodeId), { x: e.point.x, y: e.point.y })
                                } else {
                                    onNodeLeave?.()
                                }
                            } else {
                                onNodeLeave?.()
                            }
                        }

                        if (onHexHover) {
                            const hexLayerId = hexLayerMode === "expansion" ? "expansion-hex-fill" : "territory-hex-fill"
                            if (map.getLayer(hexLayerId)) {
                                const features = map.queryRenderedFeatures(e.point, { layers: [hexLayerId] })
                                if (features.length > 0 && features[0].properties?.cellId) {
                                    hasPointerTarget = true
                                    onHexHover(String(features[0].properties.cellId), { x: e.point.x, y: e.point.y })
                                } else {
                                    onHexLeave?.()
                                }
                            } else {
                                onHexLeave?.()
                            }
                        }

                        map.getCanvas().style.cursor = hasPointerTarget ? "pointer" : ""
                    }}
                    onMouseLeave={() => {
                        onHexLeave?.()
                        onNodeLeave?.()
                        setHoveredOltId(null)
                        setHoveredNapId(null)
                        setHoveredOnuId(null)
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
                        clusterMaxZoom={NODE_CLUSTER_MAX_ZOOM}
                    >
                        <Layer {...CLUSTER_HALO_LAYER} />
                        <Layer {...CLUSTER_LAYER} />
                        <Layer {...CLUSTER_COUNT_LAYER} />
                        <Layer {...UNCLUSTERED_OLT_HIT_LAYER} />
                        <Layer {...UNCLUSTERED_NAP_HIT_LAYER} />
                        <Layer {...UNCLUSTERED_ONU_HIT_LAYER} />
                        <Layer {...UNCLUSTERED_AFFECTED_SEVERITY_LAYER} />
                        <Layer {...UNCLUSTERED_ALERT_LAYER} />
                        <Layer {...UNCLUSTERED_LAYER} />
                        <Layer {...UNCLUSTERED_AFFECTED_BADGE_LAYER} />
                    </Source>

                    {shouldRenderOltMarkers && effectiveVisibleOltNodes.map((node) => {
                        const isSelected = selectedNodeId === node.id
                        const hasAlarm = Boolean(node.badge)
                        const isHovered = hoveredOltId === node.id
                        return (
                            <Marker
                                key={node.id}
                                latitude={node.lat}
                                longitude={node.lng}
                                anchor="center"
                                style={{ zIndex: isSelected ? 2 : 1 }}
                            >
                                <button
                                    type="button"
                                    aria-label={`Abrir nodo ${node.label || node.id}`}
                                    className="cursor-pointer border-0 bg-transparent p-0"
                                    onClick={(event) => {
                                        event.stopPropagation()
                                        onNodeClick?.(node.id)
                                    }}
                                    onMouseEnter={() => {
                                        setHoveredOltId(node.id)
                                        if (!onNodeHover) return
                                        const map = mapRef.current?.getMap()
                                        if (!map) return
                                        const point = map.project([node.lng, node.lat])
                                        onNodeHover(node.id, { x: point.x, y: point.y })
                                    }}
                                    onMouseLeave={() => {
                                        setHoveredOltId((prev) => (prev === node.id ? null : prev))
                                        onNodeLeave?.()
                                    }}
                                >
                                    <OltIcon
                                        size={oltIconSize}
                                        state={toOltState(node.status)}
                                        selected={isSelected}
                                        alarm={hasAlarm}
                                        animate={hasAlarm || isHovered ? "always" : "never"}
                                        label={`${node.label || node.id} OLT ${node.status.toLowerCase()}`}
                                    />
                                </button>
                            </Marker>
                        )
                    })}

                    {shouldRenderNapMarkers && effectiveVisibleNapNodes.map((node) => {
                        const isSelected = selectedNodeId === node.id
                        const hasAlarm = Boolean(node.badge)
                        const isHovered = hoveredNapId === node.id
                        return (
                            <Marker
                                key={node.id}
                                latitude={node.lat}
                                longitude={node.lng}
                                anchor="center"
                                style={{ zIndex: isSelected ? 2 : 1 }}
                            >
                                <button
                                    type="button"
                                    aria-label={`Abrir nodo ${node.label || node.id}`}
                                    className="cursor-pointer border-0 bg-transparent p-0"
                                    onClick={(event) => {
                                        event.stopPropagation()
                                        onNodeClick?.(node.id)
                                    }}
                                    onMouseEnter={() => {
                                        setHoveredNapId(node.id)
                                        if (!onNodeHover) return
                                        const map = mapRef.current?.getMap()
                                        if (!map) return
                                        const point = map.project([node.lng, node.lat])
                                        onNodeHover(node.id, { x: point.x, y: point.y })
                                    }}
                                    onMouseLeave={() => {
                                        setHoveredNapId((prev) => (prev === node.id ? null : prev))
                                        onNodeLeave?.()
                                    }}
                                >
                                    <NapIcon
                                        size={napIconSize}
                                        state={toNapState(node.status)}
                                        selected={isSelected}
                                        alarm={hasAlarm}
                                        animate={hasAlarm || isHovered ? "always" : "never"}
                                        label={`${node.label || node.id} NAP ${node.status.toLowerCase()}`}
                                    />
                                </button>
                            </Marker>
                        )
                    })}

                    {shouldRenderOnuMarkers && effectiveVisibleOnuNodes.map((node) => {
                        const isSelected = selectedNodeId === node.id
                        const hasAlarm = Boolean(node.badge)
                        const isHovered = hoveredOnuId === node.id
                        return (
                            <Marker
                                key={node.id}
                                latitude={node.lat}
                                longitude={node.lng}
                                anchor="center"
                                style={{ zIndex: isSelected ? 2 : 1 }}
                            >
                                <button
                                    type="button"
                                    aria-label={`Abrir nodo ${node.label || node.id}`}
                                    className="cursor-pointer border-0 bg-transparent p-0"
                                    onClick={(event) => {
                                        event.stopPropagation()
                                        onNodeClick?.(node.id)
                                    }}
                                    onMouseEnter={() => {
                                        setHoveredOnuId(node.id)
                                        if (!onNodeHover) return
                                        const map = mapRef.current?.getMap()
                                        if (!map) return
                                        const point = map.project([node.lng, node.lat])
                                        onNodeHover(node.id, { x: point.x, y: point.y })
                                    }}
                                    onMouseLeave={() => {
                                        setHoveredOnuId((prev) => (prev === node.id ? null : prev))
                                        onNodeLeave?.()
                                    }}
                                >
                                    <OnuIcon
                                        size={onuIconSize}
                                        state={toOnuState(node.status)}
                                        selected={isSelected}
                                        alarm={hasAlarm}
                                        animate={hasAlarm || isHovered ? "always" : "never"}
                                        variant="onu"
                                        label={`${node.label || node.id} ONU ${node.status.toLowerCase()}`}
                                    />
                                </button>
                            </Marker>
                        )
                    })}
                </MapView>
            ) : null}

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.06),transparent_58%)]" />
        </div>
    )
}
