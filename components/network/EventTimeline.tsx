"use client"

import { cn } from "@/lib/utils"
import type { NetworkEvent } from "@/types/network"
import { networkEventTypeLabels, networkEventTypeColors, networkEventTypeIcons } from "@/types/network"
import { formatDistanceToNow, format } from "date-fns"
import { es } from "date-fns/locale"
import {
    PlusCircle,
    MinusCircle,
    ArrowRight,
    AlertTriangle,
    CheckCircle,
    WifiOff,
    Wifi,
    Settings,
    PauseCircle,
    PlayCircle,
    Edit,
    Bell,
    BellOff,
} from "lucide-react"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    "plus-circle": PlusCircle,
    "minus-circle": MinusCircle,
    "arrow-right": ArrowRight,
    "alert-triangle": AlertTriangle,
    "check-circle": CheckCircle,
    "wifi-off": WifiOff,
    "wifi": Wifi,
    "settings": Settings,
    "pause-circle": PauseCircle,
    "play-circle": PlayCircle,
    "edit": Edit,
    "bell": Bell,
    "bell-off": BellOff,
}

interface EventTimelineProps {
    events: NetworkEvent[]
    limit?: number
    showDate?: boolean
    className?: string
}

export function EventTimeline({
    events,
    limit,
    showDate = true,
    className,
}: EventTimelineProps) {
    const displayEvents = limit ? events.slice(0, limit) : events

    if (displayEvents.length === 0) {
        return (
            <div className={cn("text-center py-6 text-muted-foreground", className)}>
                No hay eventos registrados
            </div>
        )
    }

    return (
        <div className={cn("relative", className)}>
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

            <div className="space-y-4">
                {displayEvents.map((event, index) => {
                    const iconName = networkEventTypeIcons[event.type]
                    const Icon = iconMap[iconName] ?? Bell
                    const colorClass = networkEventTypeColors[event.type]

                    return (
                        <div key={event.id} className="relative flex gap-4 pl-10">
                            {/* Icon node */}
                            <div
                                className={cn(
                                    "absolute left-0 flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border",
                                    index === 0 && "ring-2 ring-primary/20"
                                )}
                            >
                                <Icon className={cn("h-4 w-4", colorClass)} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 space-y-1 pb-4">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-medium text-foreground">
                                        {networkEventTypeLabels[event.type]}
                                    </span>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true, locale: es })}
                                    </span>
                                </div>

                                <p className="text-sm text-muted-foreground">
                                    {event.description}
                                </p>

                                {showDate && (
                                    <p className="text-xs text-muted-foreground/60">
                                        {format(new Date(event.createdAt), "dd MMM yyyy, HH:mm", { locale: es })}
                                    </p>
                                )}

                                {event.triggeredBy && (
                                    <p className="text-xs text-muted-foreground/60">
                                        Por: {event.triggeredBy}
                                    </p>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
