import { NextResponse } from 'next/server'
import type { MediaCapabilitiesResponse } from '@/types/chat-assistant'

const backendFeedbackUrl =
    process.env.FEEDBACK_CHAT_BACKEND_URL ?? 'http://localhost:8080/api/feedback-chat'
const backendBaseUrl = backendFeedbackUrl.replace(/\/api\/feedback-chat\/?$/i, '')
const BACKEND_MEDIA_CAPABILITIES_URL = `${backendBaseUrl}/api/chat/media/capabilities`
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

function isValidCapabilitiesResponse(value: unknown): value is MediaCapabilitiesResponse {
    if (!value || typeof value !== 'object') {
        return false
    }
    const payload = value as Record<string, unknown>
    return typeof payload.enabled === 'boolean'
        && typeof payload.maxUploadMb === 'number'
        && typeof payload.publicPath === 'string'
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
        const backendResponse = await fetch(BACKEND_MEDIA_CAPABILITIES_URL, {
            method: 'GET',
            headers: {
                Authorization: authorization,
                'X-Request-Id': requestId,
            },
            signal: timeoutController.signal,
        })

        const responseRequestId = backendResponse.headers.get('x-request-id') ?? requestId
        if (!backendResponse.ok) {
            let backendError = 'Backend media capability request failed'
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
        if (!isValidCapabilitiesResponse(payload)) {
            return NextResponse.json(
                { error: 'Invalid backend media capability response shape' },
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
            { error: isAbort ? 'Backend media capability timeout' : 'Backend media capability unavailable' },
            { status: isAbort ? 504 : 502, headers: { 'X-Request-Id': requestId } }
        )
    } finally {
        clearTimeout(timeout)
    }
}
