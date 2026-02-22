/**
 * Chat message for the feedback chatbot.
 */
export interface ChatMessageAttachment {
    mediaPath: string
    mimeType: string
    sizeBytes: number
    url?: string
}

export interface ChatMessage {
    id: string
    createdAt: string
    sender: 'USER' | 'BOT'
    text: string
    /** Reference to task created from this message (if any). */
    taskId?: string
    attachments?: ChatMessageAttachment[]
}

export type ChatSessionStatus = 'ACTIVE' | 'COMPLETED'

/**
 * Conversation container so users can continue a previous chat.
 */
export interface ChatSession {
    id: string
    title: string
    status: ChatSessionStatus
    createdAt: string
    updatedAt: string
    messages: ChatMessage[]
}

export interface ChatSessionsApiResponse {
    requestId?: string
    sessions: ChatSession[]
}

export interface CreateChatSessionRequest {
    sessionId?: string
    title?: string
}

export interface AppendChatMessageRequest {
    messageId?: string
    sender: 'USER' | 'BOT'
    text: string
    taskId?: string
    attachments?: ChatMessageAttachment[]
}
