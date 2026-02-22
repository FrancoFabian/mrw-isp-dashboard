import { NextResponse } from 'next/server'
import type { UsageSummaryResponse } from '@/types/chat-assistant'

const BACKEND_FEEDBACK_CHAT_USAGE_URL = (
    process.env.FEEDBACK_CHAT_BACKEND_URL ?? 'http://localhost:8080/api/feedback-chat'
).replace(/\/+$/, '') + '/usage-summary'
const BACKEND_BEARER_TOKEN = process.env.FEEDBACK_CHAT_BACKEND_TOKEN
const BACKEND_TIMEOUT_MS = Number(process.env.FEEDBACK_CHAT_BACKEND_TIMEOUT_MS ?? '15000')

function toNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value
    }
    if (typeof value === 'string' && value.trim().length > 0) {
        const parsed = Number(value)
        if (Number.isFinite(parsed)) {
            return parsed
        }
    }
    return null
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

function parseUsageSummary(payload: unknown): UsageSummaryResponse | null {
    if (!payload || typeof payload !== 'object') {
        return null
    }

    const data = payload as Record<string, unknown>
    if (typeof data.currency !== 'string') {
        return null
    }

    const totals = typeof data.totals === 'object' && data.totals !== null
        ? data.totals as Record<string, unknown>
        : null
    const byModel = Array.isArray(data.byModel) ? data.byModel : null
    if (!totals || !byModel) {
        return null
    }

    const totalsEventCount = toNumber(totals.eventCount)
    const totalsPromptTokens = toNumber(totals.promptTokens)
    const totalsCompletionTokens = toNumber(totals.completionTokens)
    const totalsCachedPromptTokens = toNumber(totals.cachedPromptTokens)
    const totalsTotalTokens = toNumber(totals.totalTokens)
    const totalsEstimatedCost = toNumber(totals.estimatedCostUsd)
    if (
        totalsEventCount === null
        || totalsPromptTokens === null
        || totalsCompletionTokens === null
        || totalsCachedPromptTokens === null
        || totalsTotalTokens === null
        || totalsEstimatedCost === null
    ) {
        return null
    }

    const parsedByModel = byModel
        .map((row): UsageSummaryResponse['byModel'][number] | null => {
            if (!row || typeof row !== 'object') {
                return null
            }
            const item = row as Record<string, unknown>
            const model = typeof item.model === 'string' ? item.model : null
            const eventCount = toNumber(item.eventCount)
            const promptTokens = toNumber(item.promptTokens)
            const completionTokens = toNumber(item.completionTokens)
            const cachedPromptTokens = toNumber(item.cachedPromptTokens)
            const totalTokens = toNumber(item.totalTokens)
            const estimatedCostUsd = toNumber(item.estimatedCostUsd)
            if (
                model === null
                || eventCount === null
                || promptTokens === null
                || completionTokens === null
                || cachedPromptTokens === null
                || totalTokens === null
                || estimatedCostUsd === null
            ) {
                return null
            }
            return {
                model,
                eventCount,
                promptTokens,
                completionTokens,
                cachedPromptTokens,
                totalTokens,
                estimatedCostUsd,
            }
        })
        .filter((item): item is UsageSummaryResponse['byModel'][number] => item !== null)

    if (parsedByModel.length !== byModel.length) {
        return null
    }

    return {
        requestId: typeof data.requestId === 'string' ? data.requestId : undefined,
        currency: data.currency,
        totals: {
            eventCount: totalsEventCount,
            promptTokens: totalsPromptTokens,
            completionTokens: totalsCompletionTokens,
            cachedPromptTokens: totalsCachedPromptTokens,
            totalTokens: totalsTotalTokens,
            estimatedCostUsd: totalsEstimatedCost,
        },
        byModel: parsedByModel,
    }
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
        const backendResponse = await fetch(BACKEND_FEEDBACK_CHAT_USAGE_URL, {
            method: 'GET',
            headers: {
                Authorization: authorization,
                'X-Request-Id': requestId,
            },
            signal: timeoutController.signal,
        })

        const responseRequestId = backendResponse.headers.get('x-request-id') ?? requestId
        if (!backendResponse.ok) {
            let backendErrorMessage = 'Backend usage-summary request failed'
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
        const parsed = parseUsageSummary(payloadJson)
        if (!parsed) {
            return NextResponse.json(
                { error: 'Invalid backend usage-summary response shape' },
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
            { error: isAbort ? 'Backend usage-summary timeout' : 'Backend usage-summary unavailable' },
            { status: isAbort ? 504 : 502, headers: { 'X-Request-Id': requestId } }
        )
    } finally {
        clearTimeout(timeout)
    }
}
