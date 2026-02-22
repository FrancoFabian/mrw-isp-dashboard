import type {
    AssistantChatRequest,
    AssistantChatResponse,
    ImproveMessageRequest,
    ImproveMessageResponse,
    UsageSummaryResponse,
} from '@/types/chat-assistant'

interface ApiErrorPayload {
    error?: string
    message?: string
}

function buildApiError(status: number, payload: ApiErrorPayload | null): Error {
    const detail = payload?.message ?? payload?.error ?? `status ${status}`
    return new Error(`Feedback chat API responded with ${detail}`)
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
    const response = await fetch('/api/feedback-chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        throw buildApiError(response.status, await parseErrorPayload(response))
    }

    return (await response.json()) as AssistantChatResponse
}

export async function requestImprovedMessage(
    payload: ImproveMessageRequest
): Promise<ImproveMessageResponse> {
    const response = await fetch('/api/feedback-chat/improve-message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        throw buildApiError(response.status, await parseErrorPayload(response))
    }

    return (await response.json()) as ImproveMessageResponse
}

export async function requestUsageSummary(): Promise<UsageSummaryResponse> {
    const response = await fetch('/api/feedback-chat/usage-summary', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        throw buildApiError(response.status, await parseErrorPayload(response))
    }

    return (await response.json()) as UsageSummaryResponse
}
