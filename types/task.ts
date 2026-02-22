/**
 * Role Tag for task categorization
 * Maps to the role that created the task or GENERAL for cross-cutting issues
 */
export type RoleTag =
    | 'ADMIN'
    | 'INSTALLER'
    | 'CLIENT'
    | 'COLLECTOR'
    | 'CONCESSION_CLIENT'
    | 'CAPTIVE_CLIENT'
    | 'GENERAL'
    | 'DEV'

export type TaskType = 'BUG' | 'IMPROVEMENT' | 'NEW_SECTION' | 'OTHER'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'
export type TaskStatus = 'OPEN' | 'IN_REVIEW' | 'DONE'

export interface TaskDevNote {
    id: string
    createdAt: string
    author: { kind: 'DEV_USER'; name?: string }
    text: string
}

export interface TaskAttachment {
    id: string
    taskId: string
    mediaPath: string
    mimeType: string
    sizeBytes: number
    createdAt: string
}

export interface TaskItem {
    id: string
    createdAt: string
    title: string
    message: string
    roleTag: RoleTag
    sectionTag: string
    route: string
    type: TaskType
    priority: TaskPriority
    status: TaskStatus
    author: { kind: 'CLIENT_USER'; name?: string }
    includeScreenshotLater?: boolean
    attachments?: TaskAttachment[]
    devNotes?: TaskDevNote[]
}

// Display labels for UI
export const taskTypeLabels: Record<TaskType, string> = {
    BUG: 'Bug',
    IMPROVEMENT: 'Mejora',
    NEW_SECTION: 'Nueva sección',
    OTHER: 'Otro',
}

export const taskPriorityLabels: Record<TaskPriority, string> = {
    LOW: 'Baja',
    MEDIUM: 'Media',
    HIGH: 'Alta',
}

export const taskStatusLabels: Record<TaskStatus, string> = {
    OPEN: 'Abierta',
    IN_REVIEW: 'En revisión',
    DONE: 'Completada',
}

export const roleTagLabels: Record<RoleTag, string> = {
    ADMIN: 'Administrador',
    INSTALLER: 'Instalador',
    CLIENT: 'Cliente',
    COLLECTOR: 'Cobrador',
    CONCESSION_CLIENT: 'Concesión',
    CAPTIVE_CLIENT: 'Cautivo',
    GENERAL: 'General',
    DEV: 'Desarrollador',
}
