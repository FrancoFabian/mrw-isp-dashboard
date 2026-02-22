import { NextResponse } from 'next/server'
import type {
    AppendChatMessageRequest,
    ChatMessage,
    ChatMessageAttachment,
    ChatSession,
} from '@/types/chat'

const BACKEND_FEEDBACK_CHAT_URL =
    process.env.FEEDBACK_CHAT_BACKEND_URL ?? 'http://localhost:8080/api/feedback-chat'
const BACKEND_BEARER_TOKEN = process.env.FEEDBACK_CHAT_BACKEND_TOKEN
const BACKEND_TIMEOUT_MS = Number(process.env.FEEDBACK_CHAT_BACKEND_TIMEOUT_MS ?? '15000')

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

function isAttachment(value: unknown): value is ChatMessageAttachment {
    if (!value || typeof value !== 'object') {
        return false
    }
    const data = value as Record<string, unknown>
    return typeof data.mediaPath === 'string'
        && typeof data.mimeType === 'string'
        && typeof data.sizeBytes === 'number'
}

function isValidMessage(value: unknown): value is ChatMessage {
    if (!value || typeof value !== 'object') {
        return false
    }
    const data = value as Record<string, unknown>
    return typeof data.id === 'string'
        && typeof data.createdAt === 'string'
        && (data.sender === 'USER' || data.sender === 'BOT')
        && typeof data.text === 'string'
        && (data.taskId === undefined || typeof data.taskId === 'string')
        && (data.attachments === undefined
            || (Array.isArray(data.attachments) && data.attachments.every(isAttachment)))
}

function isValidSession(value: unknown): value is ChatSession {
    if (!value || typeof value !== 'object') {
        return false
    }
    const data = value as Record<string, unknown>
    return typeof data.id === 'string'
        && typeof data.title === 'string'
        && (data.status === 'ACTIVE' || data.status === 'COMPLETED')
        && typeof data.createdAt === 'string'
        && typeof data.updatedAt === 'string'
        && Array.isArray(data.messages)
}

function isValidAppendRequest(value: unknown): value is AppendChatMessageRequest {
    if (!value || typeof value !== 'object') {
        return false
    }
    const data = value as Record<string, unknown>
    return (data.messageId === undefined || typeof data.messageId === 'string')
        && (data.sender === 'USER' || data.sender === 'BOT')
        && typeof data.text === 'string'
        && (data.taskId === undefined || typeof data.taskId === 'string')
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
    return 'Backend feedback-chat messages request failed'
}

function backendMessagesUrl(sessionId: string): string {
    return `${BACKEND_FEEDBACK_CHAT_URL.replace(/\/+$/, '')}/sessions/${encodeURIComponent(sessionId)}/messages`
}

export async function POST(
    request: Request,
    context: { params: Promise<{ sessionId: string }> }
) {
    const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
    const authorization = resolveAuthorizationHeader(request)
    const { sessionId } = await context.params

    if (!authorization) {
        return NextResponse.json(
            { error: 'Missing backend authorization token' },
            { status: 500, headers: { 'X-Request-Id': requestId } }
        )
    }

    let body: unknown
    try {
        body = await request.json()
    } catch {
        return NextResponse.json(
            { error: 'Invalid JSON payload' },
            { status: 400, headers: { 'X-Request-Id': requestId } }
        )
    }

    if (!isValidAppendRequest(body)) {
        return NextResponse.json(
            { error: 'Invalid append-message payload' },
            { status: 400, headers: { 'X-Request-Id': requestId } }
        )
    }

    const timeoutController = new AbortController()
    const timeout = setTimeout(() => timeoutController.abort(), BACKEND_TIMEOUT_MS)

    try {
        const backendResponse = await fetch(backendMessagesUrl(sessionId), {
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
        if (!isValidMessage(payload)) {
            return NextResponse.json(
                { error: 'Invalid backend append-message response shape' },
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
            { error: isAbort ? 'Backend append-message timeout' : 'Backend append-message unavailable' },
            { status: isAbort ? 504 : 502, headers: { 'X-Request-Id': requestId } }
        )
    } finally {
        clearTimeout(timeout)
    }
}

export async function DELETE(
    request: Request,
    context: { params: Promise<{ sessionId: string }> }
) {
    const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
    const authorization = resolveAuthorizationHeader(request)
    const { sessionId } = await context.params

    if (!authorization) {
        return NextResponse.json(
            { error: 'Missing backend authorization token' },
            { status: 500, headers: { 'X-Request-Id': requestId } }
        )
    }

    const timeoutController = new AbortController()
    const timeout = setTimeout(() => timeoutController.abort(), BACKEND_TIMEOUT_MS)

    try {
        const backendResponse = await fetch(backendMessagesUrl(sessionId), {
            method: 'DELETE',
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

        const payload = await backendResponse.json()
        if (!isValidSession(payload)) {
            return NextResponse.json(
                { error: 'Invalid backend clear-session response shape' },
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
            { error: isAbort ? 'Backend clear-session timeout' : 'Backend clear-session unavailable' },
            { status: isAbort ? 504 : 502, headers: { 'X-Request-Id': requestId } }
        )
    } finally {
        clearTimeout(timeout)
    }
}
