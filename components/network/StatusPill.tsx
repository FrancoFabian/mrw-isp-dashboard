"use client"

import { cn } from "@/lib/utils"
import type { OnuStatus, NodeStatus } from "@/types/network"
import type { OltStatus } from "@/types/network/olt"
import { onuStatusLabels, onuStatusColors } from "@/types/network"
import { oltStatusLabels, oltStatusColors } from "@/types/network/olt"
import { nodeStatusLabels, nodeStatusColors } from "@/types/network"

type AnyNetworkStatus = OnuStatus | OltStatus | NodeStatus | string

interface StatusPillProps {
    status: AnyNetworkStatus
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
    let label = status as string
    let colorClass = "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
    let dotClass = "bg-zinc-400"

    if (status in onuStatusLabels) {
        label = onuStatusLabels[status as OnuStatus]
        colorClass = onuStatusColors[status as OnuStatus]
        dotClass = status === "online" ? "bg-emerald-400" :
            status === "offline" || status === "los" ? "bg-red-400" : "bg-amber-400"
    } else if (status in oltStatusLabels) {
        label = oltStatusLabels[status as OltStatus]
        colorClass = oltStatusColors[status as OltStatus]
        dotClass = status === "online" ? "bg-emerald-400" :
            status === "offline" ? "bg-red-400" : "bg-amber-400"
    } else if (status in nodeStatusLabels) {
        label = nodeStatusLabels[status as NodeStatus]
        colorClass = nodeStatusColors[status as NodeStatus]
        dotClass = status === "online" ? "bg-emerald-400" :
            status === "offline" ? "bg-red-400" : "bg-amber-400"
    }

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full border font-medium",
                colorClass,
                size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-0.5 text-xs",
                className
            )}
        >
            <span
                className={cn(
                    "rounded-full",
                    size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2",
                    dotClass
                )}
            />
            {showLabel && label}
        </span>
    )
}

