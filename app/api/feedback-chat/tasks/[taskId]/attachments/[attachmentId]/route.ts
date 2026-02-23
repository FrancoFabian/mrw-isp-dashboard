import { NextResponse } from 'next/server'

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

function backendUrl(taskId: string, attachmentId: string): string {
    return `${BACKEND_FEEDBACK_CHAT_URL.replace(/\/+$/, '')}/tasks/${encodeURIComponent(taskId)}/attachments/${encodeURIComponent(attachmentId)}`
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
    return 'Backend attachment request failed'
}

export async function DELETE(
    request: Request,
    context: { params: Promise<{ taskId: string; attachmentId: string }> }
) {
    const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
    const authorization = resolveAuthorizationHeader(request)
    const { taskId, attachmentId } = await context.params

    if (!authorization) {
        return NextResponse.json(
            { error: 'Missing backend authorization token' },
            { status: 500, headers: { 'X-Request-Id': requestId } }
        )
    }

    const timeoutController = new AbortController()
    const timeout = setTimeout(() => timeoutController.abort(), BACKEND_TIMEOUT_MS)

    try {
        const backendResponse = await fetch(backendUrl(taskId, attachmentId), {
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

        return new NextResponse(null, {
            status: 204,
            headers: { 'X-Request-Id': responseRequestId },
        })
    } catch (error) {
        const isAbort = error instanceof Error && error.name === 'AbortError'
        return NextResponse.json(
            { error: isAbort ? 'Backend attachment timeout' : 'Backend attachment unavailable' },
            { status: isAbort ? 504 : 502, headers: { 'X-Request-Id': requestId } }
        )
    } finally {
        clearTimeout(timeout)
    }
}
