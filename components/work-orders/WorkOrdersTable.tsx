"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import type { WorkOrderExtended } from "@/types/workOrder"
import { installationStatusLabels, installationStatusColors } from "@/types/installation"
import { WorkOrderPriorityBadge } from "./WorkOrderPriorityBadge"
import {
    ChevronDown,
    ChevronUp,
    ChevronsUpDown,
    MoreHorizontal,
    Calendar,
    MapPin,
    User,
    ArrowRight
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface WorkOrdersTableProps {
    data: WorkOrderExtended[]
    className?: string
}

type SortField = "date" | "priority" | "status" | "clientName"
type SortOrder = "asc" | "desc"

export function WorkOrdersTable({ data, className }: WorkOrdersTableProps) {
    const router = useRouter()
    const [sortField, setSortField] = useState<SortField>("date")
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortOrder("desc") // Default to desc for new field
        }
    }

    const sortedData = [...data].sort((a, b) => {
        let comparison = 0

        switch (sortField) {
            case "date":
                // Combine date and timeSlot for better sorting
                comparison = a.date.localeCompare(b.date)
                break
            case "priority":
                // Custom priority order
                const priorityOrder = { urgent: 3, high: 2, normal: 1, low: 0 }
                comparison = (priorityOrder[a.priority || "normal"] || 0) - (priorityOrder[b.priority || "normal"] || 0)
                break
            case "status":
                comparison = a.status.localeCompare(b.status)
                break
            case "clientName":
                comparison = a.clientName.localeCompare(b.clientName)
                break
        }

        return sortOrder === "asc" ? comparison : -comparison
    })

    // Sort icon component
    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ChevronsUpDown className="ml-1 h-3 w-3 text-muted-foreground/50" />
        return sortOrder === "asc" ?
            <ChevronUp className="ml-1 h-3 w-3 text-primary" /> :
            <ChevronDown className="ml-1 h-3 w-3 text-primary" />
    }

    return (
        <div className={cn("rounded-lg border border-border bg-card overflow-hidden", className)}>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-secondary/30">
                            <th
                                className="cursor-pointer px-4 py-3 text-left font-medium text-muted-foreground hover:bg-secondary/50 transition-colors"
                                onClick={() => handleSort("date")}
                            >
                                <div className="flex items-center">
                                    Fecha / Hora
                                    <SortIcon field="date" />
                                </div>
                            </th>
                            <th
                                className="cursor-pointer px-4 py-3 text-left font-medium text-muted-foreground hover:bg-secondary/50 transition-colors"
                                onClick={() => handleSort("clientName")}
                            >
                                <div className="flex items-center">
                                    Cliente
                                    <SortIcon field="clientName" />
                                </div>
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                Ubicación
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                Técnico
                            </th>
                            <th
                                className="cursor-pointer px-4 py-3 text-left font-medium text-muted-foreground hover:bg-secondary/50 transition-colors"
                                onClick={() => handleSort("priority")}
                            >
                                <div className="flex items-center">
                                    Prioridad
                                    <SortIcon field="priority" />
                                </div>
                            </th>
                            <th
                                className="cursor-pointer px-4 py-3 text-left font-medium text-muted-foreground hover:bg-secondary/50 transition-colors"
                                onClick={() => handleSort("status")}
                            >
                                <div className="flex items-center">
                                    Estado
                                    <SortIcon field="status" />
                                </div>
                            </th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {sortedData.map((order) => (
                            <tr
                                key={order.id}
                                className="group hover:bg-secondary/20 transition-colors cursor-pointer"
                                onClick={() => router.push(`/dashboard/work-orders/${order.id}`)}
                            >
                                <td className="px-4 py-3">
                                    <div className="flex flex-col">
                                        <div className="flex items-center text-foreground font-medium">
                                            <Calendar className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                                            {format(new Date(order.date), "d MMM", { locale: es })}
                                        </div>
                                        <span className="text-xs text-muted-foreground pl-5">
                                            {order.timeSlot.split(" - ")[0]}
                                        </span>
                                    </div>
                                </td>

                                <td className="px-4 py-3">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-foreground">{order.clientName}</span>
                                        <span className="text-xs text-muted-foreground font-mono">{order.id}</span>
                                    </div>
                                </td>

                                <td className="px-4 py-3 max-w-[200px]">
                                    <div className="flex items-start">
                                        <MapPin className="mr-1.5 h-3.5 w-3.5 shrink-0 text-muted-foreground mt-0.5" />
                                        <div className="flex flex-col truncate">
                                            <span className="truncate text-foreground" title={order.address}>
                                                {order.address}
                                            </span>
                                            <span className="text-xs text-muted-foreground truncate">
                                                {order.city} {order.napName ? `• ${order.napName}` : ""}
                                            </span>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-4 py-3">
                                    {order.assignedTechnicianName ? (
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                                                {order.assignedTechnicianName.charAt(0)}
                                            </div>
                                            <span className="text-foreground">{order.assignedTechnicianName}</span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-muted-foreground italic">Sin asignar</span>
                                    )}
                                </td>

                                <td className="px-4 py-3">
                                    <WorkOrderPriorityBadge priority={order.priority || "normal"} />
                                </td>

                                <td className="px-4 py-3">
                                    <span
                                        className={cn(
                                            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                                            installationStatusColors[order.status]
                                        )}
                                    >
                                        {installationStatusLabels[order.status]}
                                    </span>
                                </td>

                                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="rounded-lg p-1 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => router.push(`/dashboard/work-orders/${order.id}`)}>
                                                <ArrowRight className="mr-2 h-4 w-4" />
                                                Ver detalle
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>
                                                <User className="mr-2 h-4 w-4" />
                                                Asignar técnico
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Calendar className="mr-2 h-4 w-4" />
                                                Reprogramar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {sortedData.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <p className="text-muted-foreground">No se encontraron órdenes</p>
                </div>
            )}
        </div>
    )
}
