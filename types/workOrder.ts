import type { Installation } from "./installation"
import type { ChecklistItem } from "./checklist"
import type { Evidence } from "./evidence"
import type { TimelineEvent, InternalNote } from "./timeline"

/** Work order priority level */
export type WorkOrderPriority = "low" | "normal" | "high" | "urgent"

/**
 * Extended work order (extends existing Installation)
 * Maintains backward compatibility while adding new features
 */
export interface WorkOrderExtended extends Installation {
    // Priority
    priority?: WorkOrderPriority

    // Technician assignment (installerId already exists in Installation)
    assignedTechnicianId?: string
    assignedTechnicianName?: string

    // Checklist
    checklistItems?: ChecklistItem[]
    checklistTemplateId?: string

    // Evidence/attachments
    evidence?: Evidence[]

    // Timeline/history
    timeline?: TimelineEvent[]

    // Internal notes (staff only)
    internalNotes?: InternalNote[]

    // Network integration
    napId?: string
    napName?: string
    onuId?: string
    onuSerial?: string

    // Audit trail
    createdBy?: string
    createdByName?: string

    // Cancellation
    cancelledAt?: string
    cancelledBy?: string
    cancelledByName?: string
    cancelReason?: string

    // Completion details
    completedBy?: string
    completedByName?: string
}

/** Work order priority labels */
export const workOrderPriorityLabels: Record<WorkOrderPriority, string> = {
    low: "Baja",
    normal: "Normal",
    high: "Alta",
    urgent: "Urgente",
}

/** Work order priority colors */
export const workOrderPriorityColors: Record<WorkOrderPriority, string> = {
    low: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    normal: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    high: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    urgent: "bg-red-500/20 text-red-400 border-red-500/30",
}

/** Work order priority badge variants (for rendering) */
export const workOrderPriorityVariants: Record<WorkOrderPriority, string> = {
    low: "default",
    normal: "default",
    high: "warning",
    urgent: "destructive",
}
