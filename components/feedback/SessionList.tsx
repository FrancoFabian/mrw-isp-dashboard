"use client"

import { Clock3, MessageSquare, Plus, CheckCircle2, CircleDot } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ChatSession } from "@/types/chat"

interface SessionListProps {
    sessions: ChatSession[]
    activeSessionId: string
    onSelectSession: (sessionId: string) => void
    onCreateSession: () => void
    disableCreateSession?: boolean
}

type SessionGroup = {
    label: string
    sessions: ChatSession[]
}

function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function getSessionGroupLabel(isoDate: string): string {
    const now = new Date()
    const nowStart = startOfDay(now).getTime()
    const date = new Date(isoDate)
    const dateStart = startOfDay(date).getTime()
    const diffDays = Math.floor((nowStart - dateStart) / (1000 * 60 * 60 * 24))

    if (diffDays <= 0) return "TODAY"
    if (diffDays === 1) return "YESTERDAY"
    if (diffDays <= 7) return "LAST WEEK"
    return "OLDER"
}

function formatRelativeTime(isoDate: string): string {
    const now = Date.now()
    const then = new Date(isoDate).getTime()
    const diffMs = Math.max(0, now - then)

    const minutes = Math.floor(diffMs / (1000 * 60))
    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes} min ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hr ago`

    const days = Math.floor(hours / 24)
    return `${days} day ago`
}

function groupSessionsByDate(sessions: ChatSession[]): SessionGroup[] {
    const sorted = [...sessions].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )

    const grouped = new Map<string, ChatSession[]>()

    for (const session of sorted) {
        const label = getSessionGroupLabel(session.updatedAt)
        const bucket = grouped.get(label) ?? []
        bucket.push(session)
        grouped.set(label, bucket)
    }

    const order = ["TODAY", "YESTERDAY", "LAST WEEK", "OLDER"]

    return order
        .filter((label) => grouped.has(label))
        .map((label) => ({
            label,
            sessions: grouped.get(label) ?? [],
        }))
}

export function SessionList({
    sessions,
    activeSessionId,
    onSelectSession,
    onCreateSession,
    disableCreateSession = false,
}: SessionListProps) {
    const groups = groupSessionsByDate(sessions)

    return (
        <div className="flex h-full flex-col">
            <div className="border-b border-border p-3">
                <button
                    type="button"
                    onClick={onCreateSession}
                    disabled={disableCreateSession}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Plus className="h-4 w-4" />
                    New Session
                </button>
            </div>

            <div className="feedback-scroll flex-1 overflow-y-auto p-3">
                {groups.map((group) => (
                    <div key={group.label} className="mb-6 last:mb-0">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {group.label}
                        </p>
                        <div className="space-y-2">
                            {group.sessions.map((session) => {
                                const isActive = session.id === activeSessionId
                                const statusLabel = session.status === "COMPLETED" ? "Completed" : "In progress"

                                return (
                                    <button
                                        key={session.id}
                                        type="button"
                                        onClick={() => onSelectSession(session.id)}
                                        className={cn(
                                            "w-full rounded-md border px-3 py-2 text-left transition-colors",
                                            isActive
                                                ? "border-primary bg-primary/10"
                                                : "border-border bg-background hover:bg-secondary/50"
                                        )}
                                    >
                                        <div className="flex items-start gap-2">
                                            <span className="mt-1">
                                                <CircleDot className="h-3.5 w-3.5 text-yellow-200" />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-foreground">
                                                    {session.title}
                                                </p>
                                                <div className="mt-1 flex items-center justify-between gap-2">
                                                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                        {session.status === "COMPLETED" ? (
                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                        ) : (
                                                            <MessageSquare className="h-3.5 w-3.5" />
                                                        )}
                                                        {statusLabel}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Clock3 className="h-3.5 w-3.5" />
                                                        {formatRelativeTime(session.updatedAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
