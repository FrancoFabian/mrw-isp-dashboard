"use client"

import { cn } from "@/lib/utils"
import type { AlertSeverity } from "@/types/network"
import { alertSeverityLabels, alertSeverityColors } from "@/types/network"
import { AlertTriangle, AlertCircle, Info } from "lucide-react"

interface AlertBadgeProps {
    severity: AlertSeverity
    showLabel?: boolean
    showIcon?: boolean
    size?: "sm" | "md"
    className?: string
}

export function AlertBadge({
    severity,
    showLabel = true,
    showIcon = true,
    size = "md",
    className,
}: AlertBadgeProps) {
    const icons = {
        info: Info,
        warning: AlertTriangle,
        critical: AlertCircle,
    }

    const Icon = icons[severity]

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full border font-medium",
                alertSeverityColors[severity],
                size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-0.5 text-xs",
                className
            )}
        >
            {showIcon && <Icon className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />}
            {showLabel && alertSeverityLabels[severity]}
        </span>
    )
}

interface AlertCountBadgeProps {
    count: number
    severity?: AlertSeverity
    className?: string
}

export function AlertCountBadge({ count, severity = "critical", className }: AlertCountBadgeProps) {
    if (count === 0) return null

    return (
        <span
            className={cn(
                "inline-flex items-center justify-center rounded-full text-xs font-bold min-w-[1.25rem] h-5 px-1.5",
                severity === "critical" && "bg-red-500 text-white",
                severity === "warning" && "bg-amber-500 text-white",
                severity === "info" && "bg-primary text-white",
                className
            )}
        >
            {count > 99 ? "99+" : count}
        </span>
    )
}
