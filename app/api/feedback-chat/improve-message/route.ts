import { NextResponse } from 'next/server'
import type { ImproveMessageRequest, ImproveMessageResponse } from '@/types/chat-assistant'

const BACKEND_FEEDBACK_CHAT_IMPROVE_URL = (
    process.env.FEEDBACK_CHAT_BACKEND_URL ?? 'http://localhost:8080/api/feedback-chat'
).replace(/\/+$/, '') + '/improve-message'
const BACKEND_BEARER_TOKEN = process.env.FEEDBACK_CHAT_BACKEND_TOKEN
const BACKEND_TIMEOUT_MS = Number(process.env.FEEDBACK_CHAT_BACKEND_TIMEOUT_MS ?? '15000')

function isValidRequest(value: unknown): value is ImproveMessageRequest {
    if (!value || typeof value !== 'object') {
        return false
    }

    const data = value as Record<string, unknown>
    return typeof data.message === 'string'
        && typeof data.route === 'string'
        && typeof data.sectionTag === 'string'
        && typeof data.role === 'string'
        && typeof data.roleTag === 'string'
        && typeof data.taskType === 'string'
        && typeof data.priority === 'string'
        && typeof data.isGeneralMode === 'boolean'
        && (data.modelPreference === undefined
            || data.modelPreference === 'default'
            || data.modelPreference === 'gpt-5-mini')
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

function parseImproveResponse(payload: unknown): ImproveMessageResponse | null {
    if (!payload || typeof payload !== 'object') {
        return null
    }

    const data = payload as Record<string, unknown>
    if (typeof data.improvedMessage !== 'string' || typeof data.provider !== 'string' || typeof data.model !== 'string') {
        return null
    }

    const provider = data.provider === 'openai' || data.provider === 'mock'
        ? data.provider
        : 'mock'

    const usage = typeof data.usage === 'object' && data.usage !== null
        ? data.usage as Record<string, unknown>
        : null

    const parsedUsage = usage
        && typeof usage.promptTokens === 'number'
        && typeof usage.completionTokens === 'number'
        && typeof usage.cachedPromptTokens === 'number'
        && typeof usage.totalTokens === 'number'
        && typeof usage.estimatedCostUsd === 'number'
        ? {
            promptTokens: usage.promptTokens,
            completionTokens: usage.completionTokens,
            cachedPromptTokens: usage.cachedPromptTokens,
            totalTokens: usage.totalTokens,
            estimatedCostUsd: usage.estimatedCostUsd,
        }
        : undefined

    return {
        improvedMessage: data.improvedMessage,
        provider,
        model: data.model,
        requestId: typeof data.requestId === 'string' ? data.requestId : undefined,
        usage: parsedUsage,
    }
}

async function requestBackendReply(payload: ImproveMessageRequest, request: Request) {
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
        const backendResponse = await fetch(BACKEND_FEEDBACK_CHAT_IMPROVE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: authorization,
                'X-Request-Id': requestId,
            },
            body: JSON.stringify(payload),
            signal: timeoutController.signal,
        })

        const responseRequestId = backendResponse.headers.get('x-request-id') ?? requestId

        if (!backendResponse.ok) {
            let backendErrorMessage = 'Backend improve-message request failed'
            try {
                const errorPayload = await backendResponse.json() as Record<string, unknown>
                if (typeof errorPayload.error === 'string') {
                    backendErrorMessage = errorPayload.error
                } else if (typeof errorPayload.message === 'string') {
                    backendErrorMessage = errorPayload.message
                }
            } catch {
                // Ignore malformed backend error payload.
            }

            return NextResponse.json(
                { error: backendErrorMessage },
                { status: backendResponse.status, headers: { 'X-Request-Id': responseRequestId } }
            )
        }

        const payloadJson = await backendResponse.json()
        const parsed = parseImproveResponse(payloadJson)
        if (!parsed) {
            return NextResponse.json(
                { error: 'Invalid backend improve-message response shape' },
                { status: 502, headers: { 'X-Request-Id': responseRequestId } }
            )
        }

        return NextResponse.json(parsed, {
            status: 200,
            headers: { 'X-Request-Id': responseRequestId },
        })
    } catch (error) {
        const isAbort = error instanceof Error && error.name === 'AbortError'
        return NextResponse.json(
            { error: isAbort ? 'Backend improve-message timeout' : 'Backend improve-message unavailable' },
            { status: isAbort ? 504 : 502, headers: { 'X-Request-Id': requestId } }
        )
    } finally {
        clearTimeout(timeout)
    }
}

export async function POST(request: Request) {
    let body: unknown

    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }

    if (!isValidRequest(body)) {
        return NextResponse.json({ error: 'Invalid improve-message payload' }, { status: 400 })
    }

    return requestBackendReply(body, request)
}
