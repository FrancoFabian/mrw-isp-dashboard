import { NextResponse } from 'next/server'
import type { MediaUploadResponse } from '@/types/chat-assistant'

const backendFeedbackUrl =
    process.env.FEEDBACK_CHAT_BACKEND_URL ?? 'http://localhost:8080/api/feedback-chat'
const backendBaseUrl = backendFeedbackUrl.replace(/\/api\/feedback-chat\/?$/i, '')
const BACKEND_MEDIA_UPLOAD_URL = `${backendBaseUrl}/api/chat/media/upload`
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

function isValidUploadResponse(value: unknown): value is MediaUploadResponse {
    if (!value || typeof value !== 'object') {
        return false
    }

    const payload = value as Record<string, unknown>
    return typeof payload.mediaPath === 'string'
        && typeof payload.url === 'string'
        && typeof payload.mime === 'string'
        && typeof payload.size === 'number'
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

    let inputForm: FormData
    try {
        inputForm = await request.formData()
    } catch {
        return NextResponse.json(
            { error: 'Invalid multipart payload' },
            { status: 400, headers: { 'X-Request-Id': requestId } }
        )
    }

    const file = inputForm.get('file')
    if (!(file instanceof File)) {
        return NextResponse.json(
            { error: 'file is required' },
            { status: 400, headers: { 'X-Request-Id': requestId } }
        )
    }

    const backendForm = new FormData()
    backendForm.append('file', file)

    const timeoutController = new AbortController()
    const timeout = setTimeout(() => timeoutController.abort(), BACKEND_TIMEOUT_MS)

    try {
        const backendResponse = await fetch(BACKEND_MEDIA_UPLOAD_URL, {
            method: 'POST',
            headers: {
                Authorization: authorization,
                'X-Request-Id': requestId,
            },
            body: backendForm,
            signal: timeoutController.signal,
        })

        const responseRequestId = backendResponse.headers.get('x-request-id') ?? requestId
        if (!backendResponse.ok) {
            let backendError = 'Backend media upload failed'
            try {
                const payload = await backendResponse.json() as Record<string, unknown>
                if (typeof payload.error === 'string') {
                    backendError = payload.error
                } else if (typeof payload.message === 'string') {
                    backendError = payload.message
                }
            } catch {
                // Ignore malformed backend error payload
            }

            return NextResponse.json(
                { error: backendError },
                { status: backendResponse.status, headers: { 'X-Request-Id': responseRequestId } }
            )
        }

        const payload = await backendResponse.json()
        if (!isValidUploadResponse(payload)) {
            return NextResponse.json(
                { error: 'Invalid backend media response shape' },
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
            { error: isAbort ? 'Backend media upload timeout' : 'Backend media upload unavailable' },
            { status: isAbort ? 504 : 502, headers: { 'X-Request-Id': requestId } }
        )
    } finally {
        clearTimeout(timeout)
    }
}
