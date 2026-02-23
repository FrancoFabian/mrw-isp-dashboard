import { NextResponse } from 'next/server'
import type {
    RoleTag,
    TaskDevNote,
    TaskItem,
    TaskPriority,
    TaskStatus,
    TaskType,
} from '@/types/task'

const BACKEND_FEEDBACK_CHAT_URL =
    process.env.FEEDBACK_CHAT_BACKEND_URL ?? 'http://localhost:8080/api/feedback-chat'
const BACKEND_FEEDBACK_CHAT_TASKS_URL = BACKEND_FEEDBACK_CHAT_URL.replace(/\/+$/, '') + '/tasks'
const BACKEND_BEARER_TOKEN = process.env.FEEDBACK_CHAT_BACKEND_TOKEN
const BACKEND_TIMEOUT_MS = Number(process.env.FEEDBACK_CHAT_BACKEND_TIMEOUT_MS ?? '15000')

interface TaskListResponse {
    requestId?: string
    tasks: TaskItem[]
}

function resolveAuthorizationHeader(request: Request): string | null {
    const requestAuthorization = request.headers.get('authorization')
    if (requestAuthorization?.startsWith('Bearer ')) {
        return requestAuthorization
    }

    if (BACKEND_BEARER_TOKEN && BACKEND_BEARER_TOKEN.trim().length > 0) {
        return `Bearer ${BACKEND_BEARER_TOKEN.trim()}`
    }

    return null
}

function isRoleTag(value: unknown): value is RoleTag {
    return value === 'ADMIN'
        || value === 'INSTALLER'
        || value === 'CLIENT'
        || value === 'COLLECTOR'
        || value === 'CONCESSION_CLIENT'
        || value === 'CAPTIVE_CLIENT'
        || value === 'GENERAL'
        || value === 'DEV'
}

function isTaskType(value: unknown): value is TaskType {
    return value === 'BUG' || value === 'IMPROVEMENT' || value === 'NEW_SECTION' || value === 'OTHER'
}

function isTaskPriority(value: unknown): value is TaskPriority {
    return value === 'LOW' || value === 'MEDIUM' || value === 'HIGH'
}

function isTaskStatus(value: unknown): value is TaskStatus {
    return value === 'OPEN' || value === 'IN_REVIEW' || value === 'DONE'
}

function isTaskDevNote(value: unknown): value is TaskDevNote {
    if (!value || typeof value !== 'object') {
        return false
    }

    const note = value as Record<string, unknown>
    const author = note.author && typeof note.author === 'object'
        ? note.author as Record<string, unknown>
        : null

    return typeof note.id === 'string'
        && typeof note.createdAt === 'string'
        && typeof note.text === 'string'
        && !!author
        && author.kind === 'DEV_USER'
        && (author.name === undefined || typeof author.name === 'string')
}

function isTaskItem(value: unknown): value is TaskItem {
    if (!value || typeof value !== 'object') {
        return false
    }

    const task = value as Record<string, unknown>
    const author = task.author && typeof task.author === 'object'
        ? task.author as Record<string, unknown>
        : null

    const attachmentsOk = task.attachments === undefined
        || (Array.isArray(task.attachments)
            && task.attachments.every((attachment) => {
                if (!attachment || typeof attachment !== 'object') {
                    return false
                }
                const data = attachment as Record<string, unknown>
                return typeof data.id === 'string'
                    && typeof data.taskId === 'string'
                    && typeof data.mediaPath === 'string'
                    && typeof data.mimeType === 'string'
                    && typeof data.sizeBytes === 'number'
                    && typeof data.createdAt === 'string'
            }))

    const notesOk = task.devNotes === undefined
        || (Array.isArray(task.devNotes) && task.devNotes.every(isTaskDevNote))

    return typeof task.id === 'string'
        && typeof task.createdAt === 'string'
        && typeof task.updatedAt === 'string'
        && typeof task.title === 'string'
        && typeof task.message === 'string'
        && isRoleTag(task.roleTag)
        && typeof task.sectionTag === 'string'
        && typeof task.route === 'string'
        && isTaskType(task.type)
        && isTaskPriority(task.priority)
        && isTaskStatus(task.status)
        && !!author
        && author.kind === 'CLIENT_USER'
        && (author.name === undefined || typeof author.name === 'string')
        && (task.includeScreenshotLater === undefined || typeof task.includeScreenshotLater === 'boolean')
        && attachmentsOk
        && notesOk
}

function parseListResponse(payload: unknown): TaskListResponse | null {
    if (!payload || typeof payload !== 'object') {
        return null
    }

    const data = payload as Record<string, unknown>
    if (!Array.isArray(data.tasks) || !data.tasks.every(isTaskItem)) {
        return null
    }

    return {
        requestId: typeof data.requestId === 'string' ? data.requestId : undefined,
        tasks: data.tasks,
    }
}

async function parseBackendError(response: Response): Promise<string> {
    try {
        const payload = await response.json() as Record<string, unknown>
        if (typeof payload.error === 'string') {
            return payload.error
        }
        if (typeof payload.message === 'string') {
            return payload.message
        }
    } catch {
        // Ignore malformed backend payload.
    }
    return 'Backend tasks request failed'
}

export async function GET(request: Request) {
    const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
    const authorization = resolveAuthorizationHeader(request)

    if (!authorization) {
        return NextResponse.json(
            { error: 'Missing backend authorization token' },
            { status: 500, headers: { 'X-Request-Id': requestId } }
        )
    }

    const timeoutController = new AbortController()
    const timeout = setTimeout(() => timeoutController.abort(), BACKEND_TIMEOUT_MS)

    try {
        const backendResponse = await fetch(BACKEND_FEEDBACK_CHAT_TASKS_URL, {
            method: 'GET',
            headers: {
                Authorization: authorization,
                'X-Request-Id': requestId,
            },
            signal: timeoutController.signal,
        })

        const responseRequestId = backendResponse.headers.get('x-request-id') ?? requestId
        if (!backendResponse.ok) {
            return NextResponse.json(
                { error: await parseBackendError(backendResponse) },
                { status: backendResponse.status, headers: { 'X-Request-Id': responseRequestId } }
            )
        }

        const payload = parseListResponse(await backendResponse.json())
        if (!payload) {
            return NextResponse.json(
                { error: 'Invalid backend tasks response shape' },
                { status: 502, headers: { 'X-Request-Id': responseRequestId } }
            )
        }

        return NextResponse.json(payload, {
            status: 200,
            headers: { 'X-Request-Id': responseRequestId },
        })
    } catch (error) {
        const isAbort = error instanceof Error && error.name === 'AbortError'
        return NextResponse.json(
            { error: isAbort ? 'Backend tasks timeout' : 'Backend tasks unavailable' },
            { status: isAbort ? 504 : 502, headers: { 'X-Request-Id': requestId } }
        )
    } finally {
        clearTimeout(timeout)
    }
}
