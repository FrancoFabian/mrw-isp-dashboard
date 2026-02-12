/** NAP port status */
export type NapPortStatus = "free" | "occupied" | "reserved" | "damaged"

/** Individual port within a NAP/splitter box */
export interface NapPort {
    id: string
    napId: string
    /** Port index (1-based) */
    index: number
    status: NapPortStatus
    /** Assigned ONU ID if occupied */
    assignedOnuId?: string
    /** Assigned customer ID if occupied */
    assignedCustomerId?: string
    /** Notes about reservation or damage */
    notes?: string
    updatedAt: string
}

/** NAP port with assigned entity names for display */
export interface NapPortWithDetails extends NapPort {
    assignedOnuSerial?: string
    assignedCustomerName?: string
}

export const napPortStatusLabels: Record<NapPortStatus, string> = {
    free: "Libre",
    occupied: "Ocupado",
    reserved: "Reservado",
    damaged: "Dañado",
}

export const napPortStatusColors: Record<NapPortStatus, string> = {
    free: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    occupied: "bg-primary/20 text-primary border-primary/30",
    reserved: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    damaged: "bg-red-500/20 text-red-400 border-red-500/30",
}

export const napPortStatusIcons: Record<NapPortStatus, string> = {
    free: "circle",
    occupied: "check-circle",
    reserved: "clock",
    damaged: "x-circle",
}
