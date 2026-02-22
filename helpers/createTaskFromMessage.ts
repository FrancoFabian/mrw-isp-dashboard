import type { UserRole } from '@/types/roles'
import type { TaskItem, TaskType, TaskPriority, RoleTag, TaskAttachment } from '@/types/task'
import type { GeneralArea } from '@/types/feedback'
import { parseContextToken, routeToSection, userRoleToRoleTag } from './routeToSection'
import { deriveTitleFromMessage } from './deriveTitleFromMessage'

interface CreateTaskOptions {
    message: string
    role: UserRole
    pathname: string
    type: TaskType
    priority: TaskPriority
    includeScreenshotLater?: boolean
    attachments?: Array<{
        mediaPath: string
        mimeType: string
        sizeBytes: number
    }>
    isGeneralMode: boolean
    generalArea?: GeneralArea
    authorName?: string
}

/**
 * Creates a new TaskItem from user input and context.
 */
export function createTaskFromMessage(options: CreateTaskOptions): TaskItem {
    const {
        message,
        role,
        pathname,
        type,
        priority,
        includeScreenshotLater = false,
        attachments = [],
        isGeneralMode,
        generalArea = 'General',
        authorName,
    } = options

    const contextToken = parseContextToken(message)
    const strippedMessage = contextToken
        ? message.replace(contextToken.raw, '').trim()
        : message.trim()
    const normalizedMessage = strippedMessage || message.trim()

    const now = new Date().toISOString()

    let roleTag: RoleTag
    let sectionTag: string

    if (isGeneralMode) {
        roleTag = 'GENERAL'
        sectionTag = generalArea
    } else {
        roleTag = contextToken?.roleTag ?? userRoleToRoleTag(role)
        sectionTag = contextToken?.sectionTag ?? routeToSection(pathname, role)
    }

    // Add random suffix to avoid collisions when multiple tasks are created in one tick.
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase()
    const id = `TASK-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`
    const nowAttachment = new Date().toISOString()
    const mappedAttachments: TaskAttachment[] = attachments.map((attachment) => ({
        id: `ATT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        taskId: id,
        mediaPath: attachment.mediaPath,
        mimeType: attachment.mimeType,
        sizeBytes: attachment.sizeBytes,
        createdAt: nowAttachment,
    }))

    return {
        id,
        createdAt: now,
        title: deriveTitleFromMessage(normalizedMessage),
        message: normalizedMessage,
        roleTag,
        sectionTag,
        route: pathname,
        type,
        priority,
        status: 'OPEN',
        author: {
            kind: 'CLIENT_USER',
            name: authorName,
        },
        includeScreenshotLater,
        attachments: mappedAttachments,
        devNotes: [],
    }
}
