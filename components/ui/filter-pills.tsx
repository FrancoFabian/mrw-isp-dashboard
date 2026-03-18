"use client"

import React from "react"
import { Filter } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FilterOption<V extends string = string> {
    label: string
    value: V
}

export interface FilterPillsProps<V extends string = string> {
    filters: FilterOption<V>[]
    value: V
    onChange: (value: V) => void
    label?: string
    showIcon?: boolean
    className?: string
}

export function FilterPills<V extends string = string>({
    filters,
    value,
    onChange,
    label,
    showIcon = true,
    className,
}: FilterPillsProps<V>) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            {showIcon && (
                <Filter className="h-4 w-4 shrink-0 text-zinc-500" />
            )}
            {label && (
                <span className="text-xs text-zinc-500 shrink-0">{label}</span>
            )}
            {filters.map((filter) => (
                <button
                    key={filter.value}
                    type="button"
                    onClick={() => onChange(filter.value)}
                    className={cn(
                        "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                        value === filter.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                    )}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    )
}
