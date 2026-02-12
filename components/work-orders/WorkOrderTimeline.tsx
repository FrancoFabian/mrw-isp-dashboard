"use client"

import { cn } from "@/lib/utils"
import type { TimelineEvent } from "@/types/timeline"
import {
    timelineEventTypeLabels,
    timelineEventTypeIcons,
    timelineEventTypeColors,
} from "@/types/timeline"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import * as LucideIcons from "lucide-react"

interface WorkOrderTimelineProps {
    events: TimelineEvent[]
    className?: string
}

export function WorkOrderTimeline({ events, className }: WorkOrderTimelineProps) {
    const sortedEvents = [...events].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    if (events.length === 0) {
        return (
            <div className="glass-card p-6 text-center">
                <p className="text-sm text-muted-foreground">No hay eventos en el timeline</p>
            </div>
        )
    }

    return (
        <div className={cn("space-y-2", className)}>
            {sortedEvents.map((event, index) => {
                const IconName = timelineEventTypeIcons[event.type] as keyof typeof LucideIcons
                const Icon = LucideIcons[IconName] as React.ComponentType<{ className?: string }>
                const isLast = index === sortedEvents.length - 1

                return (
                    <div key={event.id} className="relative flex gap-3">
                        {/* Timeline line */}
                        {!isLast && (
                            <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
                        )}

                        {/* Icon */}
                        <div
                            className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-border bg-card",
                                timelineEventTypeColors[event.type]
                            )}
                        >
                            {Icon && <Icon className="h-4 w-4" />}
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1 pb-6">
                            <div className="glass-card p-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-foreground">
                                            {timelineEventTypeLabels[event.type]}
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {event.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{event.userName}</span>
                                    <span>•</span>
                                    <span>
                                        {format(new Date(event.timestamp), "d MMM yyyy HH:mm", { locale: es })}
                                    </span>
                                </div>

                                {event.metadata && Object.keys(event.metadata).length > 0 && (
                                    <div className="mt-2 rounded border border-border/50 bg-secondary/30 p-2">
                                        <pre className="text-xs text-muted-foreground overflow-x-auto">
                                            {JSON.stringify(event.metadata, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
