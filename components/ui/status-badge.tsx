"use client"

import React from "react"
import { cn } from "@/lib/utils"

export interface StatusBadgeProps {
    label: string
    colorClass: string
    dot?: boolean
    pulse?: boolean
    icon?: React.ReactNode
    className?: string
}

/**
 * Generic status badge. Use with the color maps from `types/` files:
 *
 * ```tsx
 * <StatusBadge
 *   label={clientStatusLabels[client.status]}
 *   colorClass={clientStatusColors[client.status]}
 *   dot
 * />
 * ```
 */
export function StatusBadge({
    label,
    colorClass,
    dot = false,
    pulse = false,
    icon,
    className,
}: StatusBadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border",
                colorClass,
                className
            )}
        >
            {dot && (
                <span
                    className={cn(
                        "w-1.5 h-1.5 rounded-full bg-current",
                        pulse && "animate-pulse"
                    )}
                />
            )}
            {icon}
            {label}
        </span>
    )
}
