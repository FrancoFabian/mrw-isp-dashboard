"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { ChevronRight, ChevronLeft } from "lucide-react"

export interface DataPaginationProps {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    onPageChange: (page: number) => void
    className?: string
    hideItemInfo?: boolean
}

export function DataPagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    className,
    hideItemInfo = false,
}: DataPaginationProps) {
    if (totalPages <= 1) return null

    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)

    return (
        <div className={cn("flex flex-col sm:flex-row items-center justify-between border-t border-white/5 pt-4 sm:pt-6 gap-4", className)}>
            {!hideItemInfo ? (
                <span className="text-xs sm:text-sm text-zinc-500">
                    Mostrando {startItem} a {endItem} de {totalItems}
                </span>
            ) : <div />}

            <div className="flex items-center gap-1 sm:gap-2">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-[#111111] border border-white/5 text-xs sm:text-[15px] font-medium text-zinc-500 hover:text-white hover:bg-[#1a1a1a] hover:border-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                    {/* Ocultar texto "Previous" en móviles muy chicos, o mostrar flecha */}
                    <ChevronLeft className="w-4 h-4 sm:hidden" />
                    <span className="hidden sm:inline">Previous</span>
                </button>

                <div className="flex items-center gap-1 sm:gap-2 mx-1">
                    {Array.from({ length: totalPages }).map((_, i) => {
                        const pageNumber = i + 1
                        const isActive = currentPage === pageNumber

                        // Lógica simple de ellipis si hay demasiadas páginas
                        if (totalPages > 5) {
                            if (pageNumber !== 1 && pageNumber !== totalPages && Math.abs(currentPage - pageNumber) > 1) {
                                if (pageNumber === 2 || pageNumber === totalPages - 1) {
                                    return <span key={`ellipsis-${i}`} className="text-zinc-500 px-1">...</span>
                                }
                                return null
                            }
                        }

                        return (
                            <button
                                key={i}
                                onClick={() => onPageChange(pageNumber)}
                                className={cn(
                                    "w-8 h-8 sm:w-[42px] sm:h-[42px] rounded-full text-xs sm:text-[15px] font-medium flex items-center justify-center transition-all",
                                    isActive
                                        ? "bg-[#e5e5e5] text-black shadow-sm"
                                        : "bg-[#111111] text-white border border-white/5 hover:bg-[#1a1a1a]"
                                )}
                            >
                                {pageNumber}
                            </button>
                        )
                    })}
                </div>

                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-[#111111] border border-white/5 text-xs sm:text-[15px] font-medium text-white hover:bg-[#1a1a1a] hover:border-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronRight className="w-4 h-4 sm:hidden" />
                    <span className="hidden sm:inline">Next</span>
                </button>
            </div>
        </div>
    )
}
