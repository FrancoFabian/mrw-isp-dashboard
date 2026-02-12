"use client"

import { useState, useMemo, useEffect } from "react"
import { useTasks } from "@/stores/tasks-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Search, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import type { TaskStatus, TaskPriority, TaskType, RoleTag } from "@/types/task"
import {
    taskStatusLabels,
    taskPriorityLabels,
    taskTypeLabels,
    roleTagLabels,
} from "@/types/task"

type FilterValue = "ALL" | TaskStatus | TaskPriority | TaskType | RoleTag

export default function DevTasksInboxPage() {
    const { tasks } = useTasks()
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<FilterValue>("ALL")
    const [priorityFilter, setPriorityFilter] = useState<FilterValue>("ALL")
    const [typeFilter, setTypeFilter] = useState<FilterValue>("ALL")
    const [roleFilter, setRoleFilter] = useState<FilterValue>("ALL")
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    if (!isClient) {
        return null
    }

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase()
                if (
                    !task.title.toLowerCase().includes(query) &&
                    !task.message.toLowerCase().includes(query) &&
                    !task.id.toLowerCase().includes(query)
                ) {
                    return false
                }
            }

            // Status filter
            if (statusFilter !== "ALL" && task.status !== statusFilter) {
                return false
            }

            // Priority filter
            if (priorityFilter !== "ALL" && task.priority !== priorityFilter) {
                return false
            }

            // Type filter
            if (typeFilter !== "ALL" && task.type !== typeFilter) {
                return false
            }

            // Role filter
            if (roleFilter !== "ALL" && task.roleTag !== roleFilter) {
                return false
            }

            return true
        })
    }, [tasks, searchQuery, statusFilter, priorityFilter, typeFilter, roleFilter])

    const statusColors: Record<TaskStatus, string> = {
        OPEN: "bg-primary/20 text-primary border-primary/30",
        IN_REVIEW: "bg-warning/20 text-warning border-warning/30",
        DONE: "bg-green-500/20 text-green-500 border-green-500/30",
    }

    const priorityColors: Record<TaskPriority, string> = {
        LOW: "bg-muted text-muted-foreground",
        MEDIUM: "bg-secondary text-secondary-foreground",
        HIGH: "bg-destructive/20 text-destructive",
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                    Inbox de Tareas
                </h1>
                <p className="mt-1 text-muted-foreground">
                    {filteredTasks.length} tareas encontradas
                </p>
            </div>

            {/* Filters */}
            <Card className="glass-card">
                <CardContent className="p-4">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        {/* Search */}
                        <div className="relative lg:col-span-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-10 w-full rounded-lg border border-input bg-secondary pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>

                        {/* Status filter */}
                        <Select
                            value={statusFilter}
                            onValueChange={(v) => setStatusFilter(v as FilterValue)}
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todos los estados</SelectItem>
                                <SelectItem value="OPEN">Abierta</SelectItem>
                                <SelectItem value="IN_REVIEW">En revisión</SelectItem>
                                <SelectItem value="DONE">Completada</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Priority filter */}
                        <Select
                            value={priorityFilter}
                            onValueChange={(v) => setPriorityFilter(v as FilterValue)}
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Prioridad" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todas las prioridades</SelectItem>
                                <SelectItem value="HIGH">Alta</SelectItem>
                                <SelectItem value="MEDIUM">Media</SelectItem>
                                <SelectItem value="LOW">Baja</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Type filter */}
                        <Select
                            value={typeFilter}
                            onValueChange={(v) => setTypeFilter(v as FilterValue)}
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todos los tipos</SelectItem>
                                <SelectItem value="BUG">Bug</SelectItem>
                                <SelectItem value="IMPROVEMENT">Mejora</SelectItem>
                                <SelectItem value="NEW_SECTION">Nueva sección</SelectItem>
                                <SelectItem value="OTHER">Otro</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Role filter */}
                        <Select
                            value={roleFilter}
                            onValueChange={(v) => setRoleFilter(v as FilterValue)}
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Origen" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todos los orígenes</SelectItem>
                                <SelectItem value="ADMIN">Administrador</SelectItem>
                                <SelectItem value="INSTALLER">Instalador</SelectItem>
                                <SelectItem value="COLLECTOR">Cobrador</SelectItem>
                                <SelectItem value="CLIENT">Cliente</SelectItem>
                                <SelectItem value="CONCESSION_CLIENT">Concesión</SelectItem>
                                <SelectItem value="CAPTIVE_CLIENT">Cautivo</SelectItem>
                                <SelectItem value="GENERAL">General</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Tasks table */}
            <Card className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-secondary/50">
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        Fecha
                                        <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Origen
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Sección
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Título
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Prioridad
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Tipo
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Estado
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredTasks.map((task) => (
                                <tr
                                    key={task.id}
                                    className="transition-colors hover:bg-secondary/30"
                                >
                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                                        {new Date(task.createdAt).toLocaleDateString("es-MX", {
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3">
                                        <Badge variant="outline" className="text-xs">
                                            {roleTagLabels[task.roleTag]}
                                        </Badge>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-foreground">
                                        {task.sectionTag}
                                    </td>
                                    <td className="max-w-xs truncate px-4 py-3">
                                        <Link
                                            href={`/dashboard/dev/tasks/${task.id}`}
                                            className="text-sm font-medium text-foreground hover:text-primary hover:underline"
                                        >
                                            {task.title}
                                        </Link>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3">
                                        <Badge
                                            variant="outline"
                                            className={`text-xs ${priorityColors[task.priority]}`}
                                        >
                                            {taskPriorityLabels[task.priority]}
                                        </Badge>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3">
                                        <Badge variant="secondary" className="text-xs">
                                            {taskTypeLabels[task.type]}
                                        </Badge>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3">
                                        <Badge
                                            variant="outline"
                                            className={`text-xs ${statusColors[task.status]}`}
                                        >
                                            {taskStatusLabels[task.status]}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredTasks.length === 0 && (
                        <div className="py-12 text-center text-muted-foreground">
                            No se encontraron tareas con los filtros seleccionados
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}
