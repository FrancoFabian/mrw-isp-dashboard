"use client"

import React from "react"
import { Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TableSearchProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    isSearching?: boolean
    disabled?: boolean
    className?: string
}

export function TableSearch({
    value,
    onChange,
    placeholder = "Buscar...",
    isSearching = false,
    disabled = false,
    className,
}: TableSearchProps) {
    return (
        <div className={cn("relative group w-full sm:w-72", className)}>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
                {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : (
                    <Search className="w-4 h-4 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
                )}
            </div>
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="bg-[hsl(var(--input-surface,0_0%_6%))] border border-[hsl(var(--input-border,0_0%_13%))] text-sm text-zinc-200 rounded-lg pl-9 pr-4 py-2 w-full focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all placeholder:text-zinc-600 shadow-inner disabled:opacity-50"
            />
        </div>
    )
}
