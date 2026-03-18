"use client"

import React from "react"
import { cn } from "@/lib/utils"

export interface TablePaginationProps {
    /** The total number of items in the raw dataset */
    totalItems: number
    /** The number of items after filtering (or the current page's item count) */
    filteredItems: number
    /** Name of the entity, e.g. "clientes", "facturas" */
    itemName?: string
    /** Loading state */
    isLoading?: boolean
    /** Active page number (1-indexed) */
    currentPage?: number
    /** Total number of pages */
    totalPages?: number
    /** Callback when page changes */
    onPageChange?: (page: number) => void
    /** Additional classes */
    className?: string
}

export function TablePagination({
    totalItems,
    filteredItems,
    itemName = "elementos",
    isLoading = false,
    currentPage = 1,
    totalPages = 1,
    onPageChange,
    className,
}: TablePaginationProps) {
    const isFirstPage = currentPage <= 1
    const isLastPage = currentPage >= totalPages

    return (
        <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500", className)}>
            <span>
                {isLoading
                    ? `Cargando ${itemName}...`
                    : `Mostrando ${filteredItems > 0 ? 1 : 0} a ${filteredItems} de ${totalItems} ${itemName}`
                }
            </span>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange?.(currentPage - 1)}
                    disabled={isLoading || isFirstPage}
                    className={cn(
                        "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                        isLoading || isFirstPage
                            ? "bg-[#111] text-[#555] cursor-not-allowed"
                            : "bg-[#111] text-zinc-300 hover:bg-[#1a1a1a] hover:text-white"
                    )}
                >
                    Anterior
                </button>

                <div className={cn("flex items-center gap-1.5 transition-opacity", isLoading && "opacity-50 pointer-events-none")}>
                    {/* For MVP, just showing the current page like the original table */}
                    <button className="w-8 h-8 rounded-full bg-[#e5e5e5] text-black text-sm font-medium flex items-center justify-center">
                        {currentPage}
                    </button>
                </div>

                <button
                    onClick={() => onPageChange?.(currentPage + 1)}
                    disabled={isLoading || isLastPage}
                    className={cn(
                        "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                        isLoading || isLastPage
                            ? "bg-[#111] text-[#555] cursor-not-allowed"
                            : "bg-[#111] text-zinc-300 hover:bg-[#1a1a1a] hover:text-white"
                    )}
                >
                    Siguiente
                </button>
            </div>
        </div>
    )
}
