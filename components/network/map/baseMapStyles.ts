/**
 * Base Map Style configuration for the NOC Map module.
 *
 * Provides type-safe style identifiers, URL construction for MapTiler,
 * satellite detection, and localStorage persistence helpers.
 */

/* ── Style type ────────────────────────────────────────────── */

export type BaseMapStyle = "dataviz" | "satellite"

/* ── MapTiler style IDs ────────────────────────────────────── */

const MAPTILER_STYLE_IDS: Record<BaseMapStyle, string> = {
    dataviz: process.env.NEXT_PUBLIC_MAPTILER_STYLE ?? "dataviz-dark",
    satellite: "hybrid",
}

/* ── URL builder ───────────────────────────────────────────── */

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? ""

export function getBaseStyleUrl(style: BaseMapStyle): string {
    const styleId = MAPTILER_STYLE_IDS[style]
    return `https://api.maptiler.com/maps/${styleId}/style.json?key=${MAPTILER_KEY}`
}

/* ── Detection helpers ─────────────────────────────────────── */

export function isSatelliteStyle(style: BaseMapStyle): boolean {
    return style === "satellite"
}

export function isDatavizStyle(style: BaseMapStyle): boolean {
    return style === "dataviz"
}

/* ── Widget metadata ───────────────────────────────────────── */

export interface BaseMapOption {
    id: BaseMapStyle
    label: string
    shortLabel: string
}

export const BASE_MAP_OPTIONS: BaseMapOption[] = [
    { id: "dataviz", label: "DataViz", shortLabel: "DV" },
    { id: "satellite", label: "Satélite", shortLabel: "Sat" },
]

/* ── localStorage persistence ──────────────────────────────── */

const STORAGE_KEY = "noc-map-base-style"

export function readPersistedStyle(): BaseMapStyle {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored === "dataviz" || stored === "satellite") return stored
    } catch {
        // localStorage unavailable (SSR, private browsing, etc.)
    }
    return "dataviz"
}

export function persistStyle(style: BaseMapStyle): void {
    try {
        localStorage.setItem(STORAGE_KEY, style)
    } catch {
        // silently ignore
    }
}
