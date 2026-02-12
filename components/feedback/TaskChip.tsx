"use client"

import { useTasks } from "@/stores/tasks-context"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { taskStatusLabels, roleTagLabels } from "@/types/task"

interface TaskChipProps {
    taskId: string
    className?: string
}

export function TaskChip({ taskId, className }: TaskChipProps) {
    const { getTaskById } = useTasks()
    const task = getTaskById(taskId)

    if (!task) {
        return null
    }

    const statusColors = {
        OPEN: "bg-primary/20 text-primary border-primary/30",
        IN_REVIEW: "bg-warning/20 text-warning border-warning/30",
        DONE: "bg-green-500/20 text-green-500 border-green-500/30",
    }

    return (
        <div
            className={cn(
                "inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5",
                className
            )}
        >
            <span className="text-xs font-mono text-muted-foreground">{task.id}</span>
            <Badge
                variant="outline"
                className={cn("text-xs", statusColors[task.status])}
            >
                {taskStatusLabels[task.status]}
            </Badge>
            <span className="text-xs text-muted-foreground">
                {roleTagLabels[task.roleTag]} / {task.sectionTag}
            </span>
        </div>
    )
}
