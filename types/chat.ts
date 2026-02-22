/**
 * Chat message for the feedback chatbot.
 */
export interface ChatMessage {
    id: string
    createdAt: string
    sender: 'USER' | 'BOT'
    text: string
    /** Reference to task created from this message (if any). */
    taskId?: string
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
