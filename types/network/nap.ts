import type { GeoLocation } from "./geo"
import type { NapPort } from "./napPort"

/** NAP/Splitter box types */
export type NapType = "splitter_1x8" | "splitter_1x16" | "splitter_1x32" | "distribution_box"

/** NAP (Network Access Point) / Caja de distribución */
export interface Nap {
    id: string
    name: string
    type: NapType
    /** Associated OLT ID */
    oltId: string
    /** Associated PON port ID */
    ponId: string
    location: GeoLocation
    locationName: string
    /** Total port capacity */
    totalPorts: number
    /** Installation date */
    installedAt: string
    createdAt: string
    updatedAt: string
}

/** NAP with port details and statistics */
export interface NapWithPorts extends Nap {
    ports: NapPort[]
    freePortCount: number
    occupiedPortCount: number
    reservedPortCount: number
    damagedPortCount: number
}

/** NAP with OLT/PON references for display */
export interface NapWithHierarchy extends Nap {
    oltName: string
    ponLabel: string
    freePortCount: number
    occupiedPortCount: number
}

export const napTypeLabels: Record<NapType, string> = {
    splitter_1x8: "Splitter 1:8",
    splitter_1x16: "Splitter 1:16",
    splitter_1x32: "Splitter 1:32",
    distribution_box: "Caja de distribución",
}

export const napTypeCapacity: Record<NapType, number> = {
    splitter_1x8: 8,
    splitter_1x16: 16,
    splitter_1x32: 32,
    distribution_box: 24,
}
