/** PON port operational status */
export type PonStatus = "active" | "inactive" | "fault"

/** PON (Passive Optical Network) port on an OLT */
export interface Pon {
    id: string
    oltId: string
    /** Port label/index (e.g., "PON 1/0/1") */
    label: string
    /** Slot number on OLT chassis */
    slot: number
    /** Port number within slot */
    port: number
    status: PonStatus
    /** Maximum splitter ratio / theoretical ONU capacity */
    capacity: number
    /** Current ONU count on this PON */
    onuCount: number
    description?: string
}

/** PON port with OLT reference for display */
export interface PonWithOlt extends Pon {
    oltName: string
}

export const ponStatusLabels: Record<PonStatus, string> = {
    active: "Activo",
    inactive: "Inactivo",
    fault: "Falla",
}

export const ponStatusColors: Record<PonStatus, string> = {
    active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    inactive: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    fault: "bg-red-500/20 text-red-400 border-red-500/30",
}
