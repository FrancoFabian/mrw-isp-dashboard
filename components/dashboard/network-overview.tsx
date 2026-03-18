"use client"

import React, { useState, useMemo } from "react"
import { mockNodes } from "@/mocks/network"
import { DataPagination } from "@/components/ui/data-pagination"
import Link from "next/link"
import { ChevronRight, Server, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"

export function NetworkOverview() {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 3 // Reducido para acortar la altura

  const totalNodes = mockNodes.length
  const totalPages = Math.ceil(totalNodes / itemsPerPage)

  const onlineCount = mockNodes.filter((n) => n.status === "online").length
  const degradedCount = mockNodes.filter((n) => n.status === "degraded").length
  const offlineCount = mockNodes.filter((n) => n.status === "offline").length

  const currentNodes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return mockNodes.slice(startIndex, startIndex + itemsPerPage)
  }, [currentPage])

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'online':
        return {
          dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        }
      case 'degraded':
        return {
          dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        }
      case 'offline':
        return {
          dot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]',
          badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        }
      default:
        return { dot: 'bg-gray-500', badge: '' }
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online': return 'En línea'
      case 'degraded': return 'Degradado'
      case 'offline': return 'Sin conexión'
      default: return 'Desconocido'
    }
  }

  return (
    <div className="bg-linear-to-b from-[#1c1c1e] to-[#000000] border border-white/5 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col h-full font-sans text-gray-200">

      {/* Header Section */}
      <div className="p-4 md:p-5 border-b border-white/5 relative flex-none">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white tracking-tight mb-1">Estado de la red</h2>
          <p className="text-gray-400 text-xs flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            {totalNodes} nodos administrados
          </p>
        </div>

        <div className="absolute top-4 right-4 hidden sm:block">
          <Link
            href="/dashboard/network"
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all text-xs font-medium text-gray-400 hover:text-white"
          >
            Ver reporte
            <ChevronRight className="w-3 h-3 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Summary Metrics */}
        <div className="flex flex-wrap gap-4 sm:gap-6">
          {/* Online Stats */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              <span className="text-xs text-gray-300">En línea</span>
            </div>
            <span className="text-3xl font-light text-white tracking-tight leading-none">{onlineCount}</span>
          </div>

          {/* Degraded Stats */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
              <span className="text-xs text-gray-300">Degradado</span>
            </div>
            <span className="text-3xl font-light text-white tracking-tight leading-none">{degradedCount}</span>
          </div>

          {/* Offline Stats */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></span>
              <span className="text-xs text-gray-300">Sin conexión</span>
            </div>
            <span className="text-3xl font-light text-white tracking-tight leading-none">{offlineCount}</span>
          </div>
        </div>
      </div>

      {/* List Section */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-start space-y-1.5">
        {currentNodes.map((node) => {
          const styles = getStatusStyles(node.status)
          return (
            <div
              key={node.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-300 gap-3 sm:gap-0"
            >
              <div className="flex items-center gap-3">
                <div className="relative flex h-2.5 w-2.5 items-center justify-center shrink-0">
                  {node.status === 'online' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20"></span>}
                  <span className={cn("relative inline-flex rounded-full h-2 w-2", styles.dot)}></span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white/5 text-gray-400 group-hover:text-gray-300 transition-colors hidden sm:block">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-gray-100 font-medium text-xs sm:text-sm">{node.name}</h3>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{node.location || "Ubicación desconocida"}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 pl-6 sm:pl-0 justify-between sm:justify-end">
                <div className="text-right">
                  <p className="text-gray-300 font-medium text-xs sm:text-sm">{node.clients} <span className="text-gray-500 font-normal">clientes</span></p>
                </div>

                <div className={cn("px-2 py-0.5 rounded-md border text-[10px] sm:text-xs font-medium w-20 sm:w-24 text-center", styles.badge)}>
                  {getStatusLabel(node.status)}
                </div>

                <button className="text-gray-600 hover:text-gray-300 transition-colors p-1 hidden sm:block">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}

        {/* Ghost Rows: Para mantener la altura en páginas incompletas */}
        {Array.from({ length: itemsPerPage - currentNodes.length }).map((_, i) => (
          <div
            key={`ghost-${i}`}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 rounded-xl border border-transparent invisible select-none gap-3 sm:gap-0"
            aria-hidden="true"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex h-2.5 w-2.5 items-center justify-center shrink-0"></div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white/5 hidden sm:block">
                  <Server className="w-4 h-4 opacity-0" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm">Placeholder</h3>
                  <p className="text-[10px] sm:text-xs mt-0.5">Placeholder</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        <DataPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalNodes}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          className="mt-2 sm:mt-4"
        />
      </div>

    </div>
  )
}
