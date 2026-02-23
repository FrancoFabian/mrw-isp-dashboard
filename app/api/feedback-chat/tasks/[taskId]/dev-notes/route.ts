import { NextResponse } from 'next/server'
import type { TaskDevNote } from '@/types/task'

const BACKEND_FEEDBACK_CHAT_URL =
    process.env.FEEDBACK_CHAT_BACKEND_URL ?? 'http://localhost:8080/api/feedback-chat'
const BACKEND_BEARER_TOKEN = process.env.FEEDBACK_CHAT_BACKEND_TOKEN
const BACKEND_TIMEOUT_MS = Number(process.env.FEEDBACK_CHAT_BACKEND_TIMEOUT_MS ?? '15000')

interface CreateDevNotePayload {
    authorName?: string
    text: string
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

function backendUrl(taskId: string): string {
    return `${BACKEND_FEEDBACK_CHAT_URL.replace(/\/+$/, '')}/tasks/${encodeURIComponent(taskId)}/dev-notes`
}

function isValidPayload(value: unknown): value is CreateDevNotePayload {
    if (!value || typeof value !== 'object') {
        return false
    }
    const payload = value as Record<string, unknown>
    return typeof payload.text === 'string'
        && payload.text.trim().length > 0
        && (payload.authorName === undefined || typeof payload.authorName === 'string')
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
    return 'Backend task note request failed'
}

export async function POST(
    request: Request,
    context: { params: Promise<{ taskId: string }> }
) {
    let body: unknown
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }

    if (!isValidPayload(body)) {
        return NextResponse.json({ error: 'Invalid dev-note payload' }, { status: 400 })
    }

    const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
    const authorization = resolveAuthorizationHeader(request)
    const { taskId } = await context.params

    if (!authorization) {
        return NextResponse.json(
            { error: 'Missing backend authorization token' },
            { status: 500, headers: { 'X-Request-Id': requestId } }
        )
    }

    const timeoutController = new AbortController()
    const timeout = setTimeout(() => timeoutController.abort(), BACKEND_TIMEOUT_MS)

    try {
        const backendResponse = await fetch(backendUrl(taskId), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: authorization,
                'X-Request-Id': requestId,
            },
            body: JSON.stringify(body),
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
        if (!isTaskDevNote(payload)) {
            return NextResponse.json(
                { error: 'Invalid backend dev-note response shape' },
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
            { error: isAbort ? 'Backend task note timeout' : 'Backend task note unavailable' },
            { status: isAbort ? 504 : 502, headers: { 'X-Request-Id': requestId } }
        )
    } finally {
        clearTimeout(timeout)
    }
}
