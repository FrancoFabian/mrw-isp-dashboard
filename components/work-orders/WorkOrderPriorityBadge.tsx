"use client"

import { cn } from "@/lib/utils"
import type { WorkOrderPriority } from "@/types/workOrder"
import { workOrderPriorityLabels, workOrderPriorityColors } from "@/types/workOrder"
import { AlertTriangle, AlertCircle, Info, Flame } from "lucide-react"

interface WorkOrderPriorityBadgeProps {
    priority: WorkOrderPriority
    className?: string
    showIcon?: boolean
}

const priorityIcons: Record<WorkOrderPriority, React.ReactNode> = {
    low: <Info className="h-3 w-3" />,
    normal: <Info className="h-3 w-3" />,
    high: <AlertCircle className="h-3 w-3" />,
    urgent: <Flame className="h-3 w-3" />,
}

export function WorkOrderPriorityBadge({
    priority,
    className,
    showIcon = true,
}: WorkOrderPriorityBadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
                workOrderPriorityColors[priority],
                className
            )}
        >
            {showIcon && priorityIcons[priority]}
            {workOrderPriorityLabels[priority]}
        </span>
    )
}
