import type {
    AppendChatMessageRequest,
    ChatMessage,
    ChatSession,
    ChatSessionsApiResponse,
    CreateChatSessionRequest,
} from '@/types/chat'

interface ApiErrorPayload {
    error?: string
    message?: string
}

function buildApiError(status: number, payload: ApiErrorPayload | null): Error {
    const detail = payload?.message ?? payload?.error ?? `status ${status}`
    return new Error(`Feedback chat history API responded with ${detail}`)
}

async function parseErrorPayload(response: Response): Promise<ApiErrorPayload | null> {
    try {
        return (await response.json()) as ApiErrorPayload
    } catch {
        return null
    }
}

export async function requestChatSessions(): Promise<ChatSession[]> {
    const response = await fetch('/api/feedback-chat/sessions', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        throw buildApiError(response.status, await parseErrorPayload(response))
    }

    const payload = (await response.json()) as ChatSessionsApiResponse
    return payload.sessions ?? []
}

export async function createChatSession(payload: CreateChatSessionRequest): Promise<ChatSession> {
    const response = await fetch('/api/feedback-chat/sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        throw buildApiError(response.status, await parseErrorPayload(response))
    }

    return (await response.json()) as ChatSession
}

export async function appendChatMessage(
    sessionId: string,
    payload: AppendChatMessageRequest
): Promise<ChatMessage> {
    const response = await fetch(`/api/feedback-chat/sessions/${encodeURIComponent(sessionId)}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        throw buildApiError(response.status, await parseErrorPayload(response))
    }

    return (await response.json()) as ChatMessage
}

export async function clearChatSessionMessages(sessionId: string): Promise<ChatSession> {
    const response = await fetch(`/api/feedback-chat/sessions/${encodeURIComponent(sessionId)}/messages`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        throw buildApiError(response.status, await parseErrorPayload(response))
    }

    return (await response.json()) as ChatSession
}
