/** Timeline event type */
export type TimelineEventType =
    | "created"
    | "assigned"
    | "reassigned"
    | "scheduled"
    | "rescheduled"
    | "confirmed"
    | "en_route"
    | "arrived"
    | "completed"
    | "failed"
    | "cancelled"
    | "note_added"
    | "checklist_updated"
    | "evidence_uploaded"

/** Timeline event for work order history */
export interface TimelineEvent {
    id: string
    workOrderId: string
    type: TimelineEventType
    timestamp: string
    userId: string
    userName: string
    userRole: string
    description: string
    metadata?: Record<string, unknown>
}

/** Internal note for work orders (staff-only) */
export interface InternalNote {
    id: string
    workOrderId: string
    content: string
    createdAt: string
    createdBy: string
    createdByName: string
    visibility: "admin_only" | "all_staff"
}

/** Timeline event type labels */
export const timelineEventTypeLabels: Record<TimelineEventType, string> = {
    created: "Creada",
    assigned: "Asignada",
    reassigned: "Reasignada",
    scheduled: "Programada",
    rescheduled: "Reprogramada",
    confirmed: "Confirmada",
    en_route: "En camino",
    arrived: "Llegó al sitio",
    completed: "Completada",
    failed: "Fallida",
    cancelled: "Cancelada",
    note_added: "Nota agregada",
    checklist_updated: "Checklist actualizado",
    evidence_uploaded: "Evidencia subida",
}

/** Timeline event type icons (lucide-react icon names) */
export const timelineEventTypeIcons: Record<TimelineEventType, string> = {
    created: "Plus",
    assigned: "UserPlus",
    reassigned: "UserCog",
    scheduled: "Calendar",
    rescheduled: "CalendarClock",
    confirmed: "CheckCircle",
    en_route: "Navigation",
    arrived: "MapPin",
    completed: "CheckCircle2",
    failed: "XCircle",
    cancelled: "Ban",
    note_added: "MessageSquare",
    checklist_updated: "ListChecks",
    evidence_uploaded: "Upload",
}

/** Timeline event type colors */
export const timelineEventTypeColors: Record<TimelineEventType, string> = {
    created: "text-blue-400",
    assigned: "text-cyan-400",
    reassigned: "text-cyan-400",
    scheduled: "text-primary",
    rescheduled: "text-amber-400",
    confirmed: "text-emerald-400",
    en_route: "text-cyan-400",
    arrived: "text-primary",
    completed: "text-emerald-400",
    failed: "text-red-400",
    cancelled: "text-gray-400",
    note_added: "text-purple-400",
    checklist_updated: "text-blue-400",
    evidence_uploaded: "text-green-400",
}
