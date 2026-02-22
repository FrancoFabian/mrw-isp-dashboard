import { NextResponse } from 'next/server'
import type {
    ChatMessage,
    ChatMessageAttachment,
    ChatSession,
    ChatSessionsApiResponse,
    CreateChatSessionRequest,
} from '@/types/chat'

const BACKEND_FEEDBACK_CHAT_URL =
    process.env.FEEDBACK_CHAT_BACKEND_URL ?? 'http://localhost:8080/api/feedback-chat'
const BACKEND_FEEDBACK_CHAT_SESSIONS_URL = BACKEND_FEEDBACK_CHAT_URL.replace(/\/+$/, '') + '/sessions'
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

function isMessage(value: unknown): value is ChatMessage {
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

function isSession(value: unknown): value is ChatSession {
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
        && data.messages.every(isMessage)
}

function parseSessionsResponse(payload: unknown): ChatSessionsApiResponse | null {
    if (!payload || typeof payload !== 'object') {
        return null
    }
    const data = payload as Record<string, unknown>
    if (!Array.isArray(data.sessions) || !data.sessions.every(isSession)) {
        return null
    }
    return {
        requestId: typeof data.requestId === 'string' ? data.requestId : undefined,
        sessions: data.sessions,
    }
}

function parseSessionResponse(payload: unknown): ChatSession | null {
    return isSession(payload) ? payload : null
}

function isValidCreateRequest(value: unknown): value is CreateChatSessionRequest {
    if (!value || typeof value !== 'object') {
        return false
    }
    const data = value as Record<string, unknown>
    return (data.sessionId === undefined || typeof data.sessionId === 'string')
        && (data.title === undefined || typeof data.title === 'string')
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
    return 'Backend feedback-chat sessions request failed'
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
        const backendResponse = await fetch(BACKEND_FEEDBACK_CHAT_SESSIONS_URL, {
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

        const payload = parseSessionsResponse(await backendResponse.json())
        if (!payload) {
            return NextResponse.json(
                { error: 'Invalid backend sessions response shape' },
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
            { error: isAbort ? 'Backend sessions timeout' : 'Backend sessions unavailable' },
            { status: isAbort ? 504 : 502, headers: { 'X-Request-Id': requestId } }
        )
    } finally {
        clearTimeout(timeout)
    }
}

export async function POST(request: Request) {
    const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
    const authorization = resolveAuthorizationHeader(request)

    if (!authorization) {
        return NextResponse.json(
            { error: 'Missing backend authorization token' },
            { status: 500, headers: { 'X-Request-Id': requestId } }
        )
    }

    let body: unknown = {}
    try {
        body = await request.json()
    } catch {
        // Keep empty body as valid create request.
    }

    if (!isValidCreateRequest(body)) {
        return NextResponse.json(
            { error: 'Invalid create-session payload' },
            { status: 400, headers: { 'X-Request-Id': requestId } }
        )
    }

    const timeoutController = new AbortController()
    const timeout = setTimeout(() => timeoutController.abort(), BACKEND_TIMEOUT_MS)

    try {
        const backendResponse = await fetch(BACKEND_FEEDBACK_CHAT_SESSIONS_URL, {
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

        const payload = parseSessionResponse(await backendResponse.json())
        if (!payload) {
            return NextResponse.json(
                { error: 'Invalid backend create-session response shape' },
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
            { error: isAbort ? 'Backend create-session timeout' : 'Backend create-session unavailable' },
            { status: isAbort ? 504 : 502, headers: { 'X-Request-Id': requestId } }
        )
    } finally {
        clearTimeout(timeout)
    }
}
