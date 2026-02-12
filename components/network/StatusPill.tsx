"use client"

import { cn } from "@/lib/utils"
import type { OnuStatus } from "@/types/network"
import { onuStatusLabels, onuStatusColors } from "@/types/network"

interface StatusPillProps {
    status: OnuStatus
    showLabel?: boolean
    size?: "sm" | "md"
    className?: string
}

export function StatusPill({
    status,
    showLabel = true,
    size = "md",
    className
}: StatusPillProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full border font-medium",
                onuStatusColors[status],
                size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-0.5 text-xs",
                className
            )}
        >
            <span
                className={cn(
                    "rounded-full",
                    size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2",
                    status === "online" && "bg-emerald-400",
                    status === "offline" && "bg-red-400",
                    status === "degraded" && "bg-amber-400",
                    status === "los" && "bg-red-400"
                )}
            />
            {showLabel && onuStatusLabels[status]}
        </span>
    )
}
