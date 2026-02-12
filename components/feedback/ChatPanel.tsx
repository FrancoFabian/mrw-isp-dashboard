"use client"

import { useRef, useEffect } from "react"
import { useChat } from "@/stores/chat-context"
import { cn } from "@/lib/utils"
import { MessageComposer } from "./MessageComposer"
import { TaskChip } from "./TaskChip"
import type { UserRole } from "@/types/roles"

interface ChatPanelProps {
    role: UserRole
    pathname: string
    userName: string
    onClose?: () => void
}

export function ChatPanel({ role, pathname, userName }: ChatPanelProps) {
    const { messages } = useChat()
    const scrollRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    return (
        <div className="flex flex-1 flex-col overflow-hidden">
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
        </div>
    )
}
