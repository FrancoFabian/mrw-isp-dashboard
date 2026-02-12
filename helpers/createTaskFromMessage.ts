import type { UserRole } from '@/types/roles'
import type { TaskItem, TaskType, TaskPriority, RoleTag } from '@/types/task'
import type { GeneralArea } from '@/types/feedback'
import { routeToSection, userRoleToRoleTag } from './routeToSection'
import { deriveTitleFromMessage } from './deriveTitleFromMessage'

interface CreateTaskOptions {
    message: string
    role: UserRole
    pathname: string
    type: TaskType
    priority: TaskPriority
    includeScreenshotLater?: boolean
    isGeneralMode: boolean
    generalArea?: GeneralArea
    authorName?: string
}

/**
 * Creates a new TaskItem from user input and context
 */
export function createTaskFromMessage(options: CreateTaskOptions): TaskItem {
    const {
        message,
        role,
        pathname,
        type,
        priority,
        includeScreenshotLater = false,
        isGeneralMode,
        generalArea = 'General',
        authorName,
    } = options

    const now = new Date().toISOString()

    let roleTag: RoleTag
    let sectionTag: string

    if (isGeneralMode) {
        roleTag = 'GENERAL'
        sectionTag = generalArea
    } else {
        roleTag = userRoleToRoleTag(role)
        sectionTag = routeToSection(pathname, role)
    }

    // Use a more robust ID generator to avoid collisions in same-millisecond transactions
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase()
    const id = `TASK-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`

    return {
        id,
        createdAt: now,
        title: deriveTitleFromMessage(message),
        message,
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
        devNotes: [],
    }
}
