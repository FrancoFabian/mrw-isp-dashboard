"use client"

import { cn } from "@/lib/utils"
import type { InternalNote } from "@/types/timeline"
import { MessageSquare, Lock, Users } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface InternalNotesSectionProps {
    notes: InternalNote[]
    className?: string
}

export function InternalNotesSection({ notes, className }: InternalNotesSectionProps) {
    const sortedNotes = [...notes].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return (
        <div className={cn("space-y-4", className)}>
            <div>
                <p className="text-sm font-medium text-foreground">
                    Notas internas ({notes.length})
                </p>
                <p className="text-xs text-muted-foreground">
                    Comunicación interna del equipo
                </p>
            </div>

            {notes.length > 0 ? (
                <div className="space-y-3">
                    {sortedNotes.map((note) => (
                        <div key={note.id} className="glass-card p-4">
                            <div className="flex items-start gap-3">
                                <div
                                    className={cn(
                                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                                        note.visibility === "admin_only"
                                            ? "bg-red-500/20 text-red-400"
                                            : "bg-blue-500/20 text-blue-400"
                                    )}
                                >
                                    {note.visibility === "admin_only" ? (
                                        <Lock className="h-4 w-4" />
                                    ) : (
                                        <Users className="h-4 w-4" />
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-foreground">{note.content}</p>

                                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="font-medium">{note.createdByName}</span>
                                        <span>•</span>
                                        <span>
                                            {format(new Date(note.createdAt), "d MMM yyyy HH:mm", {
                                                locale: es,
                                            })}
                                        </span>
                                        <span>•</span>
                                        <span
                                            className={cn(
                                                "rounded-full px-2 py-0.5",
                                                note.visibility === "admin_only"
                                                    ? "bg-red-500/20 text-red-400"
                                                    : "bg-blue-500/20 text-blue-400"
                                            )}
                                        >
                                            {note.visibility === "admin_only" ? "Solo admin" : "Todo el staff"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-card flex flex-col items-center justify-center p-8 text-center">
                    <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
                    <p className="mt-2 text-sm text-muted-foreground">
                        No hay notas internas
                    </p>
                </div>
            )}
        </div>
    )
}
