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
import {
    appendChatMessage,
    clearChatSessionMessages,
    createChatSession,
    requestChatSessions,
} from "@/lib/chat/history-client"
import { buildConnectionMessage, isConnectivityIssue } from "@/lib/chat/request-error"

interface ChatContextValue {
    sessions: ChatSession[]
    activeSessionId: string
    activeSession: ChatSession | null
    messages: ChatMessage[]
    isLoading: boolean
    isMutating: boolean
    canCreateSession: boolean
    connectionMessage: string | null
    dismissConnectionMessage: () => void
    setActiveSession: (sessionId: string) => void
    createSession: () => Promise<ChatSession | null>
    addMessage: (message: Omit<ChatMessage, 'id' | 'createdAt'>) => Promise<ChatMessage | null>
    addContextMessage: (contextKey: string, text: string) => Promise<ChatMessage | null>
    clearChat: () => Promise<void>
}

const ChatContext = createContext<ChatContextValue | null>(null)
const DEFAULT_SESSION_TITLE = "New Session"

export function ChatProvider({ children }: { children: ReactNode }) {
    const [sessions, setSessions] = useState<ChatSession[]>([])
    const [activeSessionId, setActiveSessionId] = useState<string>("")
    const [isLoading, setIsLoading] = useState(true)
    const [isMutating, setIsMutating] = useState(false)
    const [canCreateSession, setCanCreateSession] = useState(true)
    const [connectionMessage, setConnectionMessage] = useState<string | null>(null)

    const contextMessageKeysRef = useRef(new Map<string, Set<string>>())

    const activeSession = useMemo(
        () => sessions.find((session) => session.id === activeSessionId) ?? null,
        [sessions, activeSessionId]
    )

    const messages = activeSession?.messages ?? []

    const registerError = useCallback((error: unknown, blockSessions: boolean) => {
        setConnectionMessage(buildConnectionMessage(error))
        if (blockSessions && isConnectivityIssue(error)) {
            setCanCreateSession(false)
        }
    }, [])

    const registerSuccess = useCallback(() => {
        setConnectionMessage(null)
        setCanCreateSession(true)
    }, [])

    useEffect(() => {
        let active = true
        const bootstrap = async () => {
            setIsLoading(true)
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
                    registerSuccess()
                    return
                }

                const created = await createChatSession({})
                if (!active) return
                setSessions([created])
                setActiveSessionId(created.id)
                registerSuccess()
            } catch (error) {
                if (!active) return
                setSessions([])
                setActiveSessionId("")
                registerError(error, true)
            } finally {
                if (active) {
                    setIsLoading(false)
                }
            }
        }

        void bootstrap()
        return () => {
            active = false
        }
    }, [registerError, registerSuccess])

    useEffect(() => {
        const onOnline = () => setCanCreateSession(true)
        const onOffline = () => setCanCreateSession(false)
        window.addEventListener("online", onOnline)
        window.addEventListener("offline", onOffline)
        return () => {
            window.removeEventListener("online", onOnline)
            window.removeEventListener("offline", onOffline)
        }
    }, [])

    const setActiveSession = useCallback((sessionId: string) => {
        if (!sessions.some((session) => session.id === sessionId)) {
            return
        }
        setActiveSessionId(sessionId)
        if (!contextMessageKeysRef.current.has(sessionId)) {
            contextMessageKeysRef.current.set(sessionId, new Set<string>())
        }
    }, [sessions])

    const createSession = useCallback(async (): Promise<ChatSession | null> => {
        setIsMutating(true)
        try {
            const remoteSession = await createChatSession({})
            setSessions((prev) => [remoteSession, ...prev])
            setActiveSessionId(remoteSession.id)
            contextMessageKeysRef.current.set(remoteSession.id, new Set<string>())
            registerSuccess()
            return remoteSession
        } catch (error) {
            registerError(error, true)
            return null
        } finally {
            setIsMutating(false)
        }
    }, [registerError, registerSuccess])

    const addMessage = useCallback(async (message: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<ChatMessage | null> => {
        if (!activeSessionId) {
            registerError(new Error('No active chat session'), true)
            return null
        }

        setIsMutating(true)
        try {
            const remoteMessage = await appendChatMessage(activeSessionId, {
                sender: message.sender,
                text: message.text,
                taskId: message.taskId,
                attachments: message.attachments,
            })

            setSessions((prev) =>
                prev.map((session) => {
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
                        updatedAt: remoteMessage.createdAt,
                        messages: [...session.messages, remoteMessage],
                    }
                })
            )
            registerSuccess()
            return remoteMessage
        } catch (error) {
            registerError(error, false)
            return null
        } finally {
            setIsMutating(false)
        }
    }, [activeSessionId, registerError, registerSuccess])

    const addContextMessage = useCallback(async (contextKey: string, text: string): Promise<ChatMessage | null> => {
        if (!activeSessionId) {
            return null
        }

        const sessionKeys = contextMessageKeysRef.current.get(activeSessionId) ?? new Set<string>()
        if (sessionKeys.has(contextKey)) {
            return null
        }

        const remoteMessage = await addMessage({
            sender: "BOT",
            text,
        })
        if (!remoteMessage) {
            return null
        }

        sessionKeys.add(contextKey)
        contextMessageKeysRef.current.set(activeSessionId, sessionKeys)
        return remoteMessage
    }, [activeSessionId, addMessage])

    const clearChat = useCallback(async (): Promise<void> => {
        if (!activeSessionId) return

        setIsMutating(true)
        try {
            const remoteSession = await clearChatSessionMessages(activeSessionId)
            contextMessageKeysRef.current.set(activeSessionId, new Set<string>())
            setSessions((prev) =>
                prev.map((session) => session.id === activeSessionId ? remoteSession : session)
            )
            registerSuccess()
        } catch (error) {
            registerError(error, false)
        } finally {
            setIsMutating(false)
        }
    }, [activeSessionId, registerError, registerSuccess])

    const dismissConnectionMessage = useCallback(() => {
        setConnectionMessage(null)
    }, [])

    return (
        <ChatContext.Provider
            value={{
                sessions,
                activeSessionId,
                activeSession,
                messages,
                isLoading,
                isMutating,
                canCreateSession,
                connectionMessage,
                dismissConnectionMessage,
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
