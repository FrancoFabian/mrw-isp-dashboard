import type {
    AssistantChatRequest,
    AssistantChatResponse,
    ImproveMessageRequest,
    ImproveMessageResponse,
    UsageSummaryResponse,
} from '@/types/chat-assistant'
import { ApiRequestError } from '@/lib/chat/request-error'

interface ApiErrorPayload {
    error?: string
    message?: string
}

function buildApiError(status: number, payload: ApiErrorPayload | null): ApiRequestError {
    const detail = payload?.message ?? payload?.error ?? `status ${status}`
    return new ApiRequestError(`Feedback chat API responded with ${detail}`, 'http', status)
}

async function parseErrorPayload(response: Response): Promise<ApiErrorPayload | null> {
    try {
        return (await response.json()) as ApiErrorPayload
    } catch {
        return null
    }
}

export async function requestAssistantReply(
    payload: AssistantChatRequest
): Promise<AssistantChatResponse> {
    let response: Response
    try {
        response = await fetch('/api/feedback-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
    } catch {
        throw new ApiRequestError('Unable to reach feedback chat API', 'network')
    }

    if (!response.ok) {
        throw buildApiError(response.status, await parseErrorPayload(response))
    }

    return (await response.json()) as AssistantChatResponse
}

export async function requestImprovedMessage(
    payload: ImproveMessageRequest
): Promise<ImproveMessageResponse> {
    let response: Response
    try {
        response = await fetch('/api/feedback-chat/improve-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
    } catch {
        throw new ApiRequestError('Unable to reach improve-message API', 'network')
    }

    if (!response.ok) {
        throw buildApiError(response.status, await parseErrorPayload(response))
    }

    return (await response.json()) as ImproveMessageResponse
}

export async function requestUsageSummary(): Promise<UsageSummaryResponse> {
    let response: Response
    try {
        response = await fetch('/api/feedback-chat/usage-summary', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
    } catch {
        throw new ApiRequestError('Unable to reach usage-summary API', 'network')
    }

    if (!response.ok) {
        throw buildApiError(response.status, await parseErrorPayload(response))
    }

    return (await response.json()) as UsageSummaryResponse
}
