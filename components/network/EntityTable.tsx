"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react"

export interface Column<T> {
    key: string
    header: string
    render: (item: T) => React.ReactNode
    sortable?: boolean
    className?: string
}

interface EntityTableProps<T> {
    data: T[]
    columns: Column<T>[]
    keyExtractor: (item: T) => string
    onRowClick?: (item: T) => void
    emptyMessage?: string
    className?: string
}

type SortDirection = "asc" | "desc" | null

export function EntityTable<T>({
    data,
    columns,
    keyExtractor,
    onRowClick,
    emptyMessage = "No hay datos disponibles",
    className,
}: EntityTableProps<T>) {
    const [sortColumn, setSortColumn] = useState<string | null>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>(null)

    const handleSort = (columnKey: string) => {
        if (sortColumn === columnKey) {
            if (sortDirection === "asc") {
                setSortDirection("desc")
            } else if (sortDirection === "desc") {
                setSortColumn(null)
                setSortDirection(null)
            }
        } else {
            setSortColumn(columnKey)
            setSortDirection("asc")
        }
    }

    const sortedData = useMemo(() => {
        if (!sortColumn || !sortDirection) return data

        return [...data].sort((a, b) => {
            const aVal = (a as Record<string, unknown>)[sortColumn]
            const bVal = (b as Record<string, unknown>)[sortColumn]

            if (aVal === bVal) return 0
            if (aVal === null || aVal === undefined) return 1
            if (bVal === null || bVal === undefined) return -1

            const comparison = aVal < bVal ? -1 : 1
            return sortDirection === "asc" ? comparison : -comparison
        })
    }, [data, sortColumn, sortDirection])

    if (data.length === 0) {
        return (
            <div className={cn("glass-card p-6 text-center", className)}>
                <p className="text-muted-foreground">{emptyMessage}</p>
            </div>
        )
    }

    return (
        <div className={cn("glass-card overflow-hidden", className)}>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border">
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={cn(
                                        "px-4 py-3 text-left text-xs font-medium text-muted-foreground",
                                        column.sortable && "cursor-pointer select-none hover:text-foreground transition-colors",
                                        column.className
                                    )}
                                    onClick={column.sortable ? () => handleSort(column.key) : undefined}
                                >
                                    <div className="flex items-center gap-1">
                                        {column.header}
                                        {column.sortable && (
                                            <span className="text-muted-foreground/50">
                                                {sortColumn === column.key ? (
                                                    sortDirection === "asc" ? (
                                                        <ChevronUp className="h-3 w-3" />
                                                    ) : (
                                                        <ChevronDown className="h-3 w-3" />
                                                    )
                                                ) : (
                                                    <ChevronsUpDown className="h-3 w-3" />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {sortedData.map((item) => (
                            <tr
                                key={keyExtractor(item)}
                                onClick={onRowClick ? () => onRowClick(item) : undefined}
                                className={cn(
                                    "transition-colors",
                                    onRowClick && "cursor-pointer hover:bg-secondary/30"
                                )}
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className={cn("px-4 py-3 text-sm", column.className)}
                                    >
                                        {column.render(item)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
