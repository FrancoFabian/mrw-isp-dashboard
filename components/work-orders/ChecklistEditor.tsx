"use client"

import { cn } from "@/lib/utils"
import type { ChecklistItem } from "@/types/checklist"
import { ChecklistItemComponent } from "./ChecklistItemComponent"

interface ChecklistEditorProps {
    items: ChecklistItem[]
    editable?: boolean
    onToggleItem?: (itemId: string) => void
    className?: string
}

export function ChecklistEditor({
    items,
    editable = false,
    onToggleItem,
    className,
}: ChecklistEditorProps) {
    const sortedItems = [...items].sort((a, b) => a.order - b.order)
    const totalItems = items.length
    const completedItems = items.filter((i) => i.status === "completed").length
    const requiredItems = items.filter((i) => i.required).length
    const completedRequiredItems = items.filter(
        (i) => i.required && i.status === "completed"
    ).length
    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

    return (
        <div className={cn("space-y-4", className)}>
            {/* Progress header */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-foreground">
                            Progreso del checklist
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {completedItems} de {totalItems} completados
                            {requiredItems > 0 && (
                                <span className="ml-2">
                                    ({completedRequiredItems}/{requiredItems} obligatorios)
                                </span>
                            )}
                        </p>
                    </div>
                    <span className="text-lg font-bold text-primary">{Math.round(progress)}%</span>
                </div>

                {/* Progress bar */}
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Checklist items */}
            <div className="space-y-2">
                {sortedItems.map((item) => (
                    <ChecklistItemComponent
                        key={item.id}
                        item={item}
                        editable={editable}
                        onToggle={onToggleItem}
                    />
                ))}
            </div>

            {totalItems === 0 && (
                <div className="glass-card p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        No hay items en el checklist
                    </p>
                </div>
            )}
        </div>
    )
}
