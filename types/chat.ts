/**
 * Chat message for the feedback chatbot
 */
export interface ChatMessage {
    id: string
    createdAt: string
    sender: 'USER' | 'BOT'
    text: string
    /** Reference to task created from this message (if any) */
    taskId?: string
}
