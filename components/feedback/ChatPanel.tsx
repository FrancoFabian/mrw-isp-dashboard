"use client"

import { useRef, useEffect, useState } from "react"
import { History, MessageSquarePlus, MessagesSquare } from "lucide-react"
import { useChat } from "@/stores/chat-context"
import { cn } from "@/lib/utils"
import { MessageComposer } from "./MessageComposer"
import { TaskChip } from "./TaskChip"
import { SessionList } from "./SessionList"
import {
    buildContextToken,
    routeToSection,
    userRoleToRoleTag,
} from "@/helpers/routeToSection"
import type { UserRole } from "@/types/roles"

type PanelView = "CHAT" | "SESSIONS"

interface ChatPanelProps {
    role: UserRole
    pathname: string
    userName: string
    onClose?: () => void
}

export function ChatPanel({ role, pathname, userName }: ChatPanelProps) {
    const {
        sessions,
        activeSession,
        activeSessionId,
        messages,
        setActiveSession,
        createSession,
        addContextMessage,
    } = useChat()

    const [panelView, setPanelView] = useState<PanelView>("CHAT")
    const scrollRef = useRef<HTMLDivElement>(null)

    const currentSection = routeToSection(pathname, role)
    const currentRoleTag = userRoleToRoleTag(role)
    const contextToken = buildContextToken(currentRoleTag, currentSection)

    // Auto-scroll to bottom when new messages arrive.
    useEffect(() => {
        if (panelView === "CHAT" && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, panelView])

    // Publish route/section context once per route key and per session.
    useEffect(() => {
        if (!activeSessionId) {
            return
        }

        const contextKey = `${activeSessionId}:${role}:${pathname}:${currentSection}`
        addContextMessage(
            contextKey,
            [
                `Contexto activo`,
                `Ruta: ${pathname}`,
                `Seccion: ${currentSection}`,
                `Tip: si quieres ser mas especifico, inicia tu mensaje con ${contextToken}.`,
            ].join("\n")
        )
    }, [addContextMessage, activeSessionId, role, pathname, currentSection, contextToken])

    const handleCreateSession = () => {
        createSession()
        setPanelView("CHAT")
    }

    const handleSelectSession = (sessionId: string) => {
        setActiveSession(sessionId)
        setPanelView("CHAT")
    }

    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            <div className="border-b border-border px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 rounded-md bg-secondary/70 p-1">
                        <button
                            type="button"
                            onClick={() => setPanelView("CHAT")}
                            className={cn(
                                "inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors",
                                panelView === "CHAT"
                                    ? "bg-background text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <MessagesSquare className="h-3.5 w-3.5" />
                            Chat
                        </button>
                        <button
                            type="button"
                            onClick={() => setPanelView("SESSIONS")}
                            className={cn(
                                "inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors",
                                panelView === "SESSIONS"
                                    ? "bg-background text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <History className="h-3.5 w-3.5" />
                            Sessions ({sessions.length})
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={handleCreateSession}
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-foreground transition-colors hover:bg-secondary"
                    >
                        <MessageSquarePlus className="h-3.5 w-3.5" />
                        New
                    </button>
                </div>

                {activeSession && panelView === "CHAT" && (
                    <p className="mt-2 truncate text-xs text-muted-foreground">
                        Sesion activa: {activeSession.title}
                    </p>
                )}
            </div>

            {panelView === "SESSIONS" ? (
                <SessionList
                    sessions={sessions}
                    activeSessionId={activeSessionId}
                    onSelectSession={handleSelectSession}
                    onCreateSession={handleCreateSession}
                />
            ) : (
                <>
                    {/* Messages area */}
                    <div
                        ref={scrollRef}
                        className="flex-1 space-y-4 overflow-y-auto p-4"
                    >
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={cn(
                                    "flex flex-col gap-1",
                                    message.sender === "USER" ? "items-end" : "items-start"
                                )}
                            >
                                <div
                                    className={cn(
                                        "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                                        message.sender === "USER"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-secondary text-secondary-foreground"
                                    )}
                                >
                                    <p className="whitespace-pre-wrap">{message.text}</p>
                                </div>
                                {message.taskId && (
                                    <div className="mt-1">
                                        <TaskChip taskId={message.taskId} />
                                    </div>
                                )}
                                <span className="text-xs text-muted-foreground">
                                    {new Date(message.createdAt).toLocaleTimeString("es-MX", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Composer */}
                    <MessageComposer role={role} pathname={pathname} userName={userName} />
                </>
            )}
        </div>
    )
}
