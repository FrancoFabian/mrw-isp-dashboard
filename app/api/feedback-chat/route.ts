import { NextResponse } from 'next/server'
import type { AssistantChatRequest, AssistantChatResponse } from '@/types/chat-assistant'

const BACKEND_FEEDBACK_CHAT_URL =
    process.env.FEEDBACK_CHAT_BACKEND_URL ?? 'http://localhost:8080/api/feedback-chat'
const BACKEND_BEARER_TOKEN = process.env.FEEDBACK_CHAT_BACKEND_TOKEN
const BACKEND_TIMEOUT_MS = Number(process.env.FEEDBACK_CHAT_BACKEND_TIMEOUT_MS ?? '15000')

function isValidRequest(value: unknown): value is AssistantChatRequest {
    if (!value || typeof value !== 'object') {
        return false
    }

    const data = value as Record<string, unknown>

    return typeof data.message === 'string'
        && typeof data.route === 'string'
        && typeof data.sectionTag === 'string'
        && typeof data.role === 'string'
        && typeof data.roleTag === 'string'
        && typeof data.taskId === 'string'
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

function parseAssistantResponse(payload: unknown): AssistantChatResponse | null {
    if (!payload || typeof payload !== 'object') {
        return null
    }

    const data = payload as Record<string, unknown>
    if (typeof data.reply !== 'string' || typeof data.provider !== 'string' || typeof data.model !== 'string') {
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

    const questions = Array.isArray(data.questions)
        ? data.questions.filter((item): item is string => typeof item === 'string')
        : undefined

    return {
        reply: data.reply,
        provider,
        model: data.model,
        requestId: typeof data.requestId === 'string' ? data.requestId : undefined,
        usage: parsedUsage,
        questions,
    }
}

async function requestBackendReply(payload: AssistantChatRequest, request: Request) {
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
        const backendResponse = await fetch(BACKEND_FEEDBACK_CHAT_URL, {
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
            let backendErrorMessage = 'Backend feedback chat request failed'
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
        const parsed = parseAssistantResponse(payloadJson)
        if (!parsed) {
            return NextResponse.json(
                { error: 'Invalid backend feedback response shape' },
                { status: 502, headers: { 'X-Request-Id': responseRequestId } }
            )
        }

        return NextResponse.json(parsed, {
            status: 200,
            headers: { 'X-Request-Id': responseRequestId },
        })
    } catch (error) {
        const isAbort = error instanceof Error && error.name === 'AbortError'
        console.error('Feedback chat backend request exception', isAbort ? 'timeout' : 'error')
        return NextResponse.json(
            { error: isAbort ? 'Backend feedback chat timeout' : 'Backend feedback chat unavailable' },
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
        return NextResponse.json({ error: 'Invalid assistant chat payload' }, { status: 400 })
    }

    return requestBackendReply(body, request)
}
