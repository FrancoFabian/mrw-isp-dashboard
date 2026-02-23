"use client"

import { useTasks } from "@/stores/tasks-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, CheckCircle, AlertCircle, Clock, TriangleAlert } from "lucide-react"
import Link from "next/link"

export default function DevDashboardPage() {
    const { tasks, loading, errorMessage } = useTasks()

    const openTasks = tasks.filter((t) => t.status === "OPEN")
    const inReviewTasks = tasks.filter((t) => t.status === "IN_REVIEW")
    const doneTasks = tasks.filter((t) => t.status === "DONE")
    const highPriorityTasks = tasks.filter(
        (t) => t.priority === "HIGH" && t.status !== "DONE"
    )

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                    Panel de Desarrollo
                </h1>
                <p className="mt-1 text-muted-foreground">
                    Gestión de tareas y feedback del sistema
                </p>
            </div>

            {errorMessage && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* Stats cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Tareas Abiertas
                        </CardTitle>
                        <AlertCircle className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">
                            {loading ? "-" : openTasks.length}
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            En Revisión
                        </CardTitle>
                        <Clock className="h-5 w-5 text-warning" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">
                            {loading ? "-" : inReviewTasks.length}
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Completadas
                        </CardTitle>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">
                            {loading ? "-" : doneTasks.length}
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Alta Prioridad
                        </CardTitle>
                        <AlertCircle className="h-5 w-5 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">
                            {loading ? "-" : highPriorityTasks.length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick actions */}
            <div className="grid gap-4 md:grid-cols-2">
                <Link href="/dashboard/dev/tasks">
                    <Card className="glass-card-hover cursor-pointer">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                <ClipboardList className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">
                                    Ver todas las tareas
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Gestiona el inbox completo de feedback
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {highPriorityTasks.length > 0 && (
                    <Card className="border-destructive/30 bg-destructive/5">
                        <CardContent className="p-6">
                            <h3 className="mb-3 font-semibold text-foreground">
                                ⚠️ Tareas urgentes
                            </h3>
                            <div className="space-y-2">
                                {highPriorityTasks.slice(0, 3).map((task) => (
                                    <Link
                                        key={task.id}
                                        href={`/dashboard/dev/tasks/${task.id}`}
                                        className="block"
                                    >
                                        <div className="flex items-center gap-2 rounded-lg bg-background/50 p-2 transition-colors hover:bg-background">
                                            <Badge variant="destructive" className="text-xs">
                                                Alta
                                            </Badge>
                                            <span className="truncate text-sm text-foreground">
                                                {task.title}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
