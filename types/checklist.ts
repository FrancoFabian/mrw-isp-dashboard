/** Checklist item status */
export type ChecklistItemStatus = "pending" | "completed" | "skipped" | "failed"

/** Individual checklist item for installation work orders */
export interface ChecklistItem {
    id: string
    label: string
    description?: string
    status: ChecklistItemStatus
    completedAt?: string
    completedBy?: string
    completedByName?: string
    notes?: string
    required: boolean
    order: number
}

/** Checklist template category */
export type ChecklistCategory = "FTTH" | "WIRELESS" | "CPE" | "GENERAL"

/** Template for creating checklists */
export interface ChecklistTemplate {
    id: string
    name: string
    description: string
    category: ChecklistCategory
    items: Omit<ChecklistItem, "id" | "status" | "completedAt" | "completedBy" | "completedByName" | "notes">[]
}

/** Checklist status labels */
export const checklistItemStatusLabels: Record<ChecklistItemStatus, string> = {
    pending: "Pendiente",
    completed: "Completado",
    skipped: "Omitido",
    failed: "Fallido",
}

/** Checklist status colors */
export const checklistItemStatusColors: Record<ChecklistItemStatus, string> = {
    pending: "bg-amber-500/20 text-amber-400",
    completed: "bg-emerald-500/20 text-emerald-400",
    skipped: "bg-gray-500/20 text-gray-400",
    failed: "bg-red-500/20 text-red-400",
}

/** Category labels */
export const checklistCategoryLabels: Record<ChecklistCategory, string> = {
    FTTH: "Fibra Óptica",
    WIRELESS: "Inalámbrico",
    CPE: "Equipo Cliente",
    GENERAL: "General",
}
