import { NextResponse } from 'next/server'
import type { TaskItem, TaskPriority, TaskStatus, TaskType } from '@/types/task'

const BACKEND_FEEDBACK_CHAT_URL =
    process.env.FEEDBACK_CHAT_BACKEND_URL ?? 'http://localhost:8080/api/feedback-chat'
const BACKEND_BEARER_TOKEN = process.env.FEEDBACK_CHAT_BACKEND_TOKEN
const BACKEND_TIMEOUT_MS = Number(process.env.FEEDBACK_CHAT_BACKEND_TIMEOUT_MS ?? '15000')

interface TaskUpdatePayload {
    status?: TaskStatus
    priority?: TaskPriority
    type?: TaskType
    title?: string
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

function backendTaskUrl(taskId: string): string {
    return `${BACKEND_FEEDBACK_CHAT_URL.replace(/\/+$/, '')}/tasks/${encodeURIComponent(taskId)}`
}

function isTaskItem(value: unknown): value is TaskItem {
    if (!value || typeof value !== 'object') {
        return false
    }

    const task = value as Record<string, unknown>
    return typeof task.id === 'string'
        && typeof task.createdAt === 'string'
        && typeof task.updatedAt === 'string'
        && typeof task.title === 'string'
        && typeof task.message === 'string'
        && typeof task.roleTag === 'string'
        && typeof task.sectionTag === 'string'
        && typeof task.route === 'string'
        && typeof task.type === 'string'
        && typeof task.priority === 'string'
        && typeof task.status === 'string'
}

function isValidPatch(value: unknown): value is TaskUpdatePayload {
    if (!value || typeof value !== 'object') {
        return false
    }

    const payload = value as Record<string, unknown>
    const validStatus = payload.status === undefined
        || payload.status === 'OPEN'
        || payload.status === 'IN_REVIEW'
        || payload.status === 'DONE'
    const validPriority = payload.priority === undefined
        || payload.priority === 'LOW'
        || payload.priority === 'MEDIUM'
        || payload.priority === 'HIGH'
    const validType = payload.type === undefined
        || payload.type === 'BUG'
        || payload.type === 'IMPROVEMENT'
        || payload.type === 'NEW_SECTION'
        || payload.type === 'OTHER'
    const validTitle = payload.title === undefined || typeof payload.title === 'string'

    return validStatus && validPriority && validType && validTitle
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
    return 'Backend task request failed'
}

async function requestBackend(
    request: Request,
    taskId: string,
    method: 'GET' | 'PATCH',
    body?: unknown
) {
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
        const backendResponse = await fetch(backendTaskUrl(taskId), {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: authorization,
                'X-Request-Id': requestId,
            },
            body: body === undefined ? undefined : JSON.stringify(body),
            signal: timeoutController.signal,
        })

        const responseRequestId = backendResponse.headers.get('x-request-id') ?? requestId
        if (!backendResponse.ok) {
            return NextResponse.json(
                { error: await parseBackendError(backendResponse) },
                { status: backendResponse.status, headers: { 'X-Request-Id': responseRequestId } }
            )
        }

        const payload = await backendResponse.json()
        if (!isTaskItem(payload)) {
            return NextResponse.json(
                { error: 'Invalid backend task response shape' },
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
            { error: isAbort ? 'Backend task timeout' : 'Backend task unavailable' },
            { status: isAbort ? 504 : 502, headers: { 'X-Request-Id': requestId } }
        )
    } finally {
        clearTimeout(timeout)
    }
}

export async function GET(
    request: Request,
    context: { params: Promise<{ taskId: string }> }
) {
    const { taskId } = await context.params
    return requestBackend(request, taskId, 'GET')
}

export async function PATCH(
    request: Request,
    context: { params: Promise<{ taskId: string }> }
) {
    let body: unknown
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }

    if (!isValidPatch(body)) {
        return NextResponse.json({ error: 'Invalid task update payload' }, { status: 400 })
    }

    const { taskId } = await context.params
    return requestBackend(request, taskId, 'PATCH', body)
}
