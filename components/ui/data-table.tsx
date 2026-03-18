"use client"

import React from "react"
import { cn } from "@/lib/utils"

/* ─────── Column definition ─────── */
export interface ColumnDef<T> {
    /** Unique column id, used for visibility toggling */
    id: string
    /** Header text */
    header: string
    /** Render function for cell content */
    cell: (row: T) => React.ReactNode
    /** Hide this column on mobile (below md) */
    hiddenOnMobile?: boolean
    /** Extra className for th/td */
    className?: string
    /** Header alignment */
    headerAlign?: "left" | "center" | "right"
}

/* ─────── Props ─────── */
export interface DataTableProps<T> {
    data: T[]
    columns: ColumnDef<T>[]
    /** Which column IDs are visible. If omitted, all columns are shown. */
    visibleColumns?: string[]
    /** Show skeleton rows */
    isLoading?: boolean
    /** How many skeleton rows to show (default 5) */
    skeletonRows?: number
    /** Icon for the empty state */
    emptyIcon?: React.ReactNode
    /** Message when no data */
    emptyMessage?: string
    /** Row click handler */
    onRowClick?: (row: T) => void
    /** Currently selected row id */
    selectedRowId?: string | null
    /** Extract unique id from a row */
    getRowId: (row: T) => string
    /** Optional footer slot (pagination, counts, etc.) */
    footer?: React.ReactNode
    /** Optional header slot (title, search, filters above the table) */
    header?: React.ReactNode
    /** Extra actions column (render per-row) */
    renderActions?: (row: T) => React.ReactNode
    /** Fade table body while searching */
    isSearching?: boolean
    /** CSS class for the outer container */
    className?: string
    /** Show top gradient accent overlay */
    showTopAccent?: boolean
}

/* ─────── Skeleton Row ─────── */
const SKELETON_WIDTH_PATTERN = [42, 48, 53, 59, 64, 69, 74, 57, 62, 67]

function getSkeletonCellWidth(rowIndex: number, colIndex: number) {
    const patternIndex = (rowIndex * 3 + colIndex * 2) % SKELETON_WIDTH_PATTERN.length
    return `${SKELETON_WIDTH_PATTERN[patternIndex]}%`
}

function SkeletonRow({ colCount, rowIndex }: { colCount: number; rowIndex: number }) {
    return (
        <tr className="border-b border-zinc-800/50 bg-white/0.5">
            {Array.from({ length: colCount }).map((_, i) => (
                <td key={i} className="px-6 py-4 whitespace-nowrap">
                    <div
                        className="h-4 bg-zinc-800/60 rounded animate-pulse"
                        style={{ width: getSkeletonCellWidth(rowIndex, i) }}
                    />
                </td>
            ))}
        </tr>
    )
}

/* ─────── Component ─────── */
export function DataTable<T>({
    data,
    columns,
    visibleColumns,
    isLoading = false,
    skeletonRows = 5,
    emptyIcon,
    emptyMessage = "No se encontraron resultados.",
    onRowClick,
    selectedRowId,
    getRowId,
    footer,
    header,
    renderActions,
    isSearching = false,
    className,
    showTopAccent = true,
}: DataTableProps<T>) {
    const visibleCols = visibleColumns
        ? columns.filter((col) => visibleColumns.includes(col.id))
        : columns

    const totalCols = visibleCols.length + (renderActions ? 1 : 0)

    return (
        <div
            className={cn(
                "relative bg-black border border-zinc-800/80 rounded-2xl shadow-2xl shadow-black overflow-hidden flex flex-col font-sans text-zinc-100",
                className
            )}
        >
            {/* Top gradient accent that won't stretch with table height */}
            {showTopAccent && (
                <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-64 bg-linear-to-b from-zinc-900/60 to-transparent" />
            )}

            {/* Header slot */}
            {header && (
                <div className="relative z-10 p-6 md:p-8 border-b border-zinc-800/50 flex flex-col gap-5">
                    {header}
                </div>
            )}

            {/* Table */}
            <div className="relative z-10 overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-zinc-800/50 bg-black/20">
                            {visibleCols.map((col) => (
                                <th
                                    key={col.id}
                                    className={cn(
                                        "px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider",
                                        col.hiddenOnMobile && "hidden md:table-cell",
                                        col.headerAlign === "right" && "text-right",
                                        col.headerAlign === "center" && "text-center",
                                        col.className
                                    )}
                                >
                                    {col.header}
                                </th>
                            ))}
                            {renderActions && (
                                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">
                                    Acciones
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody
                        className={cn(
                            "divide-y divide-zinc-800/50 transition-opacity duration-300",
                            isSearching && "opacity-40 pointer-events-none"
                        )}
                    >
                        {isLoading ? (
                            Array.from({ length: skeletonRows }).map((_, i) => (
                                <SkeletonRow key={i} colCount={totalCols} rowIndex={i} />
                            ))
                        ) : (
                            data.map((row) => {
                                const rowId = getRowId(row)
                                const isSelected = selectedRowId === rowId

                                return (
                                    <tr
                                        key={rowId}
                                        onClick={() => onRowClick?.(row)}
                                        className={cn(
                                            "transition-all duration-200 group",
                                            onRowClick && "cursor-pointer",
                                            isSelected
                                                ? "bg-white/5"
                                                : "hover:bg-white/3"
                                        )}
                                    >
                                        {visibleCols.map((col) => (
                                            <td
                                                key={col.id}
                                                className={cn(
                                                    "px-6 py-4 whitespace-nowrap",
                                                    col.hiddenOnMobile && "hidden md:table-cell",
                                                    col.className
                                                )}
                                            >
                                                {col.cell(row)}
                                            </td>
                                        ))}
                                        {renderActions && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                {renderActions(row)}
                                            </td>
                                        )}
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>

                {/* Empty state */}
                {!isLoading && data.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        {emptyIcon}
                        <p className="mt-4 text-sm text-zinc-500">{emptyMessage}</p>
                    </div>
                )}
            </div>

            {/* Footer slot */}
            {footer && (
                <div className="relative z-10 p-4 md:p-6 border-t border-zinc-800/50 bg-black/10">
                    {footer}
                </div>
            )}
        </div>
    )
}
