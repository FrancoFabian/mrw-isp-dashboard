"use client"

import {
    createContext,
    useContext,
    useState,
    useCallback,
    type ReactNode,
} from "react"
import type { ChatMessage } from "@/types/chat"
import { mockChatMessages } from "@/mocks/chatMessages"

interface ChatContextValue {
    messages: ChatMessage[]
    addMessage: (message: Omit<ChatMessage, 'id' | 'createdAt'>) => ChatMessage
    clearChat: () => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
    const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages)

    const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'createdAt'>): ChatMessage => {
        // Add random suffix to prevent collisions when multiple messages are added instantly
        const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase()
        const newMessage: ChatMessage = {
            ...message,
            id: `MSG-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`,
            createdAt: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, newMessage])
        return newMessage
    }, [])

    const clearChat = useCallback(() => {
        setMessages([])
    }, [])

    return (
        <ChatContext.Provider value={{ messages, addMessage, clearChat }}>
            {children}
        </ChatContext.Provider>
    )
}

export function useChat() {
    const context = useContext(ChatContext)
    if (!context) {
        throw new Error("useChat must be used within a ChatProvider")
    }
    return context
}
