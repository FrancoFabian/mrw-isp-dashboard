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
import { feedbackWelcomeText } from "@/mocks/chatMessages"
import {
    appendChatMessage,
    clearChatSessionMessages,
    createChatSession,
    requestChatSessions,
} from "@/lib/chat/history-client"

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
const LEGACY_MOCK_SESSION_IDS = new Set([
    "SES-001",
    "SES-002",
    "SES-003",
    "SES-004",
    "SES-005",
    "SES-006",
])

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

function createInitialChatState(): PersistedChatState {
    const firstSession = buildSession()
    return {
        sessions: [firstSession],
        activeSessionId: firstSession.id,
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

        const sanitizedSessions = parsed.sessions.filter(
            (session) => !LEGACY_MOCK_SESSION_IDS.has(session.id)
        )
        if (sanitizedSessions.length === 0) {
            return null
        }

        const activeSessionId = typeof parsed.activeSessionId === "string"
            ? parsed.activeSessionId
            : sanitizedSessions[0]?.id

        if (!activeSessionId) return null

        const resolvedActiveSessionId = sanitizedSessions.some((session) => session.id === activeSessionId)
            ? activeSessionId
            : sanitizedSessions[0].id

        return {
            sessions: sanitizedSessions,
            activeSessionId: resolvedActiveSessionId,
        }
    } catch {
        return null
    }
}

export function ChatProvider({ children }: { children: ReactNode }) {
    const initialStateRef = useRef<PersistedChatState | null>(null)
    if (!initialStateRef.current) {
        initialStateRef.current = createInitialChatState()
    }
    const [sessions, setSessions] = useState<ChatSession[]>(initialStateRef.current.sessions)
    const [activeSessionId, setActiveSessionId] = useState<string>(initialStateRef.current.activeSessionId)
    const [hydrated, setHydrated] = useState(false)

    // Deduplicate route-context messages per session.
    const contextMessageKeysRef = useRef(new Map<string, Set<string>>())

    const activeSession = useMemo(
        () => sessions.find((session) => session.id === activeSessionId) ?? null,
        [sessions, activeSessionId]
    )

    const messages = activeSession?.messages ?? []

    useEffect(() => {
        let active = true
        const persisted = readPersistedState()
        if (persisted) {
            setSessions(persisted.sessions)
            setActiveSessionId(persisted.activeSessionId)
        }

        const bootstrap = async () => {
            try {
                const remoteSessions = await requestChatSessions()
                if (!active) return

                if (remoteSessions.length > 0) {
                    setSessions(remoteSessions)
                    setActiveSessionId((prev) =>
                        remoteSessions.some((session) => session.id === prev)
                            ? prev
                            : remoteSessions[0].id
                    )
                    return
                }

                const fallbackSession = persisted?.sessions[0] ?? createInitialChatState().sessions[0]
                const created = await createChatSession({
                    sessionId: fallbackSession.id,
                    title: fallbackSession.title,
                })
                if (!active) return
                setSessions([created])
                setActiveSessionId(created.id)
            } catch {
                // Keep local fallback when history API is unavailable.
            } finally {
                if (active) {
                    setHydrated(true)
                }
            }
        }

        void bootstrap()
        return () => {
            active = false
        }
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
        void createChatSession({ sessionId: newSession.id, title: newSession.title })
            .then((remoteSession) => {
                setSessions((prev) => {
                    const withoutLocal = prev.filter((session) => session.id !== newSession.id)
                    return [remoteSession, ...withoutLocal]
                })
                setActiveSessionId(remoteSession.id)
            })
            .catch(() => {
                // Keep local optimistic session if API is unavailable.
            })
        return newSession
    }, [])

    const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'createdAt'>): ChatMessage => {
        const newMessage = buildMessage(message)
        const canPersistToApi = Boolean(activeSessionId && sessions.some((session) => session.id === activeSessionId))

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

        if (canPersistToApi && activeSessionId) {
            void appendChatMessage(activeSessionId, {
                messageId: newMessage.id,
                sender: newMessage.sender,
                text: newMessage.text,
                taskId: newMessage.taskId,
                attachments: newMessage.attachments,
            })
                .then((remoteMessage) => {
                    setSessions((prev) =>
                        prev.map((session) => {
                            if (session.id !== activeSessionId) {
                                return session
                            }
                            const exists = session.messages.some((item) => item.id === remoteMessage.id)
                            return {
                                ...session,
                                messages: exists
                                    ? session.messages.map((item) => item.id === remoteMessage.id ? remoteMessage : item)
                                    : [...session.messages, remoteMessage],
                                updatedAt: remoteMessage.createdAt,
                            }
                        })
                    )
                })
                .catch(() => {
                    // Keep local optimistic message if API is unavailable.
                })
        }

        return newMessage
    }, [activeSessionId, sessions])

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

        void appendChatMessage(activeSessionId, {
            messageId: newMessage.id,
            sender: "BOT",
            text,
        }).catch(() => {
            // Keep local context message if API is unavailable.
        })

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

        void clearChatSessionMessages(activeSessionId)
            .then((remoteSession) => {
                setSessions((prev) =>
                    prev.map((session) => session.id === activeSessionId ? remoteSession : session)
                )
            })
            .catch(() => {
                // Keep local clear state if API is unavailable.
            })
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
