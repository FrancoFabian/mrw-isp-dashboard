"use client"

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useMemo,
    useRef,
    useEffect,
    type ReactNode,
} from "react"
import { deriveTitleFromMessage } from "@/helpers/deriveTitleFromMessage"
import type { ChatMessage, ChatSession } from "@/types/chat"
import { mockChatSessions } from "@/mocks/chatSessions"
import { feedbackWelcomeText } from "@/mocks/chatMessages"

interface ChatContextValue {
    sessions: ChatSession[]
    activeSessionId: string
    activeSession: ChatSession | null
    messages: ChatMessage[]
    setActiveSession: (sessionId: string) => void
    createSession: () => ChatSession
    addMessage: (message: Omit<ChatMessage, 'id' | 'createdAt'>) => ChatMessage
    addContextMessage: (contextKey: string, text: string) => ChatMessage | null
    clearChat: () => void
}

interface PersistedChatState {
    sessions: ChatSession[]
    activeSessionId: string
}

const ChatContext = createContext<ChatContextValue | null>(null)
const CHAT_STORAGE_KEY = "isp.feedback-chat.sessions.v1"
const DEFAULT_SESSION_TITLE = "New Session"

function generateId(prefix: string): string {
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase()
    return `${prefix}-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`
}

function buildMessage(message: Omit<ChatMessage, 'id' | 'createdAt'>): ChatMessage {
    return {
        ...message,
        id: generateId("MSG"),
        createdAt: new Date().toISOString(),
    }
}

function buildWelcomeMessage(): ChatMessage {
    return {
        id: generateId("MSG"),
        createdAt: new Date().toISOString(),
        sender: "BOT",
        text: feedbackWelcomeText,
    }
}

function buildSession(): ChatSession {
    const now = new Date().toISOString()
    return {
        id: generateId("SES"),
        title: DEFAULT_SESSION_TITLE,
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
        messages: [buildWelcomeMessage()],
    }
}

function isChatMessage(value: unknown): value is ChatMessage {
    if (!value || typeof value !== "object") return false
    const message = value as Record<string, unknown>
    return typeof message.id === "string"
        && typeof message.createdAt === "string"
        && (message.sender === "USER" || message.sender === "BOT")
        && typeof message.text === "string"
}

function isChatSession(value: unknown): value is ChatSession {
    if (!value || typeof value !== "object") return false
    const session = value as Record<string, unknown>
    return typeof session.id === "string"
        && typeof session.title === "string"
        && (session.status === "ACTIVE" || session.status === "COMPLETED")
        && typeof session.createdAt === "string"
        && typeof session.updatedAt === "string"
        && Array.isArray(session.messages)
        && session.messages.every(isChatMessage)
}

function readPersistedState(): PersistedChatState | null {
    try {
        const raw = localStorage.getItem(CHAT_STORAGE_KEY)
        if (!raw) return null

        const parsed = JSON.parse(raw) as Partial<PersistedChatState>
        if (!Array.isArray(parsed.sessions) || !parsed.sessions.every(isChatSession)) {
            return null
        }

        const activeSessionId = typeof parsed.activeSessionId === "string"
            ? parsed.activeSessionId
            : parsed.sessions[0]?.id

        if (!activeSessionId) return null

        return {
            sessions: parsed.sessions,
            activeSessionId,
        }
    } catch {
        return null
    }
}

export function ChatProvider({ children }: { children: ReactNode }) {
    const [sessions, setSessions] = useState<ChatSession[]>(mockChatSessions)
    const [activeSessionId, setActiveSessionId] = useState<string>(mockChatSessions[0]?.id ?? "")
    const [hydrated, setHydrated] = useState(false)

    // Deduplicate route-context messages per session.
    const contextMessageKeysRef = useRef(new Map<string, Set<string>>())

    const activeSession = useMemo(
        () => sessions.find((session) => session.id === activeSessionId) ?? null,
        [sessions, activeSessionId]
    )

    const messages = activeSession?.messages ?? []

    useEffect(() => {
        const persisted = readPersistedState()
        if (persisted) {
            setSessions(persisted.sessions)
            setActiveSessionId(persisted.activeSessionId)
        }
        setHydrated(true)
    }, [])

    useEffect(() => {
        if (!hydrated) return

        const state: PersistedChatState = {
            sessions,
            activeSessionId,
        }

        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(state))
    }, [sessions, activeSessionId, hydrated])

    useEffect(() => {
        if (!sessions.length) {
            const newSession = buildSession()
            setSessions([newSession])
            setActiveSessionId(newSession.id)
            return
        }

        const hasActiveSession = sessions.some((session) => session.id === activeSessionId)
        if (!hasActiveSession) {
            setActiveSessionId(sessions[0].id)
        }
    }, [sessions, activeSessionId])

    const setActiveSession = useCallback((sessionId: string) => {
        setActiveSessionId(sessionId)
        if (!contextMessageKeysRef.current.has(sessionId)) {
            contextMessageKeysRef.current.set(sessionId, new Set<string>())
        }
    }, [])

    const createSession = useCallback((): ChatSession => {
        const newSession = buildSession()
        setSessions((prev) => [newSession, ...prev])
        setActiveSessionId(newSession.id)
        contextMessageKeysRef.current.set(newSession.id, new Set<string>())
        return newSession
    }, [])

    const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'createdAt'>): ChatMessage => {
        const newMessage = buildMessage(message)

        setSessions((prev) => {
            const hasActiveSession = prev.some((session) => session.id === activeSessionId)
            if (prev.length === 0 || !activeSessionId || !hasActiveSession) {
                const newSession = buildSession()
                const titledSession: ChatSession = {
                    ...newSession,
                    title: message.sender === "USER"
                        ? deriveTitleFromMessage(message.text)
                        : newSession.title,
                    messages: [...newSession.messages, newMessage],
                    updatedAt: newMessage.createdAt,
                }
                setActiveSessionId(titledSession.id)
                return [titledSession]
            }

            return prev.map((session) => {
                if (session.id !== activeSessionId) {
                    return session
                }

                const shouldGenerateTitle =
                    message.sender === "USER" && session.title === DEFAULT_SESSION_TITLE

                return {
                    ...session,
                    title: shouldGenerateTitle
                        ? deriveTitleFromMessage(message.text)
                        : session.title,
                    status: "ACTIVE",
                    updatedAt: newMessage.createdAt,
                    messages: [...session.messages, newMessage],
                }
            })
        })

        return newMessage
    }, [activeSessionId])

    const addContextMessage = useCallback((contextKey: string, text: string): ChatMessage | null => {
        if (!activeSessionId || !sessions.some((session) => session.id === activeSessionId)) {
            return null
        }

        const sessionKeys = contextMessageKeysRef.current.get(activeSessionId) ?? new Set<string>()
        if (sessionKeys.has(contextKey)) {
            return null
        }

        sessionKeys.add(contextKey)
        contextMessageKeysRef.current.set(activeSessionId, sessionKeys)

        const newMessage = buildMessage({
            sender: "BOT",
            text,
        })

        setSessions((prev) =>
            prev.map((session) =>
                session.id === activeSessionId
                    ? {
                        ...session,
                        updatedAt: newMessage.createdAt,
                        messages: [...session.messages, newMessage],
                    }
                    : session
            )
        )

        return newMessage
    }, [activeSessionId, sessions])

    const clearChat = useCallback(() => {
        if (!activeSessionId || !sessions.some((session) => session.id === activeSessionId)) return

        contextMessageKeysRef.current.set(activeSessionId, new Set<string>())

        setSessions((prev) =>
            prev.map((session) =>
                session.id === activeSessionId
                    ? {
                        ...session,
                        updatedAt: new Date().toISOString(),
                        messages: [buildWelcomeMessage()],
                    }
                    : session
            )
        )
    }, [activeSessionId, sessions])

    return (
        <ChatContext.Provider
            value={{
                sessions,
                activeSessionId,
                activeSession,
                messages,
                setActiveSession,
                createSession,
                addMessage,
                addContextMessage,
                clearChat,
            }}
        >
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
