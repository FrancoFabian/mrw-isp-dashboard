"use client"

import { cn } from "@/lib/utils"
import type { ChecklistItem } from "@/types/checklist"
import {
    checklistItemStatusLabels,
    checklistItemStatusColors,
} from "@/types/checklist"
import { CheckCircle2, Circle, XCircle, MinusCircle } from "lucide-react"

interface ChecklistItemComponentProps {
    item: ChecklistItem
    editable?: boolean
    onToggle?: (itemId: string) => void
    onAddNote?: (itemId: string, note: string) => void
    className?: string
}

const statusIcons: Record<ChecklistItem["status"], React.ReactNode> = {
    pending: <Circle className="h-5 w-5 text-muted-foreground" />,
    completed: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
    skipped: <MinusCircle className="h-5 w-5 text-gray-400" />,
    failed: <XCircle className="h-5 w-5 text-red-400" />,
}

export function ChecklistItemComponent({
    item,
    editable = false,
    onToggle,
    className,
}: ChecklistItemComponentProps) {
    const handleClick = () => {
        if (editable && onToggle) {
            onToggle(item.id)
        }
    }

    return (
        <div
            className={cn(
                "group flex items-start gap-3 rounded-lg border border-border p-3 transition-colors",
                editable && "cursor-pointer hover:bg-secondary/30",
                item.status === "completed" && "bg-emerald-500/5",
                className
            )}
            onClick={handleClick}
        >
            <div className="shrink-0 pt-0.5">{statusIcons[item.status]}</div>

            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <p
                            className={cn(
                                "text-sm font-medium text-foreground",
                                item.status === "completed" && "line-through text-muted-foreground"
                            )}
                        >
                            {item.label}
                            {item.required && <span className="ml-1 text-red-400">*</span>}
                        </p>
                        {item.description && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {item.description}
                            </p>
                        )}
                    </div>

                    <span
                        className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                            checklistItemStatusColors[item.status]
                        )}
                    >
                        {checklistItemStatusLabels[item.status]}
                    </span>
                </div>

                {item.notes && (
                    <div className="mt-2 rounded border border-amber-500/20 bg-amber-500/5 p-2">
                        <p className="text-xs text-foreground">{item.notes}</p>
                    </div>
                )}

                {item.completedAt && (
                    <p className="mt-2 text-xs text-muted-foreground">
                        Completado por {item.completedByName} el{" "}
                        {new Date(item.completedAt).toLocaleString("es-MX", {
                            dateStyle: "short",
                            timeStyle: "short",
                        })}
                    </p>
                )}
            </div>
        </div>
    )
}
