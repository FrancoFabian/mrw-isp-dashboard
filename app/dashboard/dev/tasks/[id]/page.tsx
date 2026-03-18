"use client"

import { use, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTasks } from "@/stores/tasks-context"
import { buildMediaUrl } from "@/helpers/media"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    ArrowLeft,
    Calendar,
    MapPin,
    User,
    MessageSquare,
    Plus,
    Copy,
    Check,
    Image as ImageIcon,
    Trash2,
    X,
} from "lucide-react"
import type { TaskPriority, TaskStatus, TaskType } from "@/types/task"
import {
    roleTagLabels,
    taskPriorityLabels,
    taskStatusLabels,
    taskTypeLabels,
} from "@/types/task"

interface TaskDetailPageProps {
    params: Promise<{ id: string }>
}

export default function TaskDetailPage({ params }: TaskDetailPageProps) {
    const { id } = use(params)
    const router = useRouter()
    const {
        loading,
        syncing,
        errorMessage,
        getTaskById,
        updateTaskStatus,
        updateTaskPriority,
        updateTaskType,
        addDevNote,
        removeTaskAttachment,
    } = useTasks()

    const [newNote, setNewNote] = useState("")
    const [copied, setCopied] = useState(false)
    const [previewAttachmentId, setPreviewAttachmentId] = useState<string | null>(null)

    const task = getTaskById(id)

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <h2 className="text-xl font-semibold text-foreground">Cargando tarea...</h2>
            </div>
        )
    }

    if (!task) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <h2 className="text-xl font-semibold text-foreground">Tarea no encontrada</h2>
                <p className="mt-2 text-muted-foreground">La tarea con ID &quot;{id}&quot; no existe.</p>
                <Link href="/dashboard/dev/tasks" className="mt-4 text-primary hover:underline">
                    Volver al inbox
                </Link>
            </div>
        )
    }

    const previewAttachment = useMemo(
        () => (task.attachments ?? []).find((attachment) => attachment.id === previewAttachmentId) ?? null,
        [task.attachments, previewAttachmentId]
    )

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

    const handleCopyRoute = () => {
        navigator.clipboard.writeText(task.route)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleAddNote = () => {
        if (!newNote.trim()) {
            return
        }
        addDevNote(task.id, {
            author: { kind: "DEV_USER", name: "Developer" },
            text: newNote.trim(),
        })
        setNewNote("")
    }

    return (
        <>
            <div className="space-y-6">
                {errorMessage && (
                    <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {errorMessage}
                    </div>
                )}

                <div className="flex items-start gap-4">
                    <button
                        onClick={() => router.back()}
                        className="mt-1 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-muted-foreground">{task.id}</span>
                            <Badge variant="outline" className={`text-xs ${statusColors[task.status]}`}>
                                {taskStatusLabels[task.status]}
                            </Badge>
                        </div>
                        <h1 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">{task.title}</h1>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <MessageSquare className="h-4 w-4" />
                                    Mensaje original
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap text-foreground">{task.message}</p>
                                <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <User className="h-4 w-4" />
                                        {task.author.name || "Usuario anonimo"}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(task.createdAt).toLocaleDateString("es-MX", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <ImageIcon className="h-4 w-4" />
                                    Referencias visuales
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {(task.attachments ?? []).length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Sin imagenes adjuntas para esta tarea.</p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                        {(task.attachments ?? []).map((attachment) => (
                                            <div key={attachment.id} className="space-y-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setPreviewAttachmentId(attachment.id)}
                                                    className="block w-full overflow-hidden rounded-md border border-border/60"
                                                >
                                                    <img
                                                        src={attachment.url ?? buildMediaUrl(attachment.mediaPath)}
                                                        alt="Referencia visual"
                                                        className="h-24 w-full object-cover"
                                                        loading="lazy"
                                                    />
                                                </button>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {(attachment.sizeBytes / 1024).toFixed(1)} KB
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTaskAttachment(task.id, attachment.id)}
                                                        className="inline-flex items-center gap-1 text-[10px] text-destructive hover:underline"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <MapPin className="h-4 w-4" />
                                    Ubicacion capturada
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 rounded bg-secondary px-3 py-2 text-sm text-foreground">{task.route}</code>
                                    <button
                                        onClick={handleCopyRoute}
                                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                                    >
                                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>
                                <div className="mt-3 flex gap-2">
                                    <Badge variant="outline">{roleTagLabels[task.roleTag]}</Badge>
                                    <Badge variant="secondary">{task.sectionTag}</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle className="text-base">Notas internas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {task.devNotes && task.devNotes.length > 0 ? (
                                    <div className="space-y-3">
                                        {task.devNotes.map((note) => (
                                            <div key={note.id} className="rounded-lg border border-border bg-secondary/50 p-3">
                                                <p className="text-sm text-foreground">{note.text}</p>
                                                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>{note.author.name || "DEV"}</span>
                                                    <span>{new Date(note.createdAt).toLocaleString("es-MX")}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No hay notas internas todavia.</p>
                                )}

                                <div className="flex gap-2">
                                    <textarea
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        placeholder="Agregar nota interna..."
                                        rows={2}
                                        className="flex-1 resize-none rounded-lg border border-input bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddNote}
                                        disabled={!newNote.trim()}
                                        className="flex items-center justify-center rounded-lg bg-primary px-4 text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Plus className="h-5 w-5" />
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle className="text-base">Acciones</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-muted-foreground">Estado</label>
                                    <Select value={task.status} onValueChange={(v) => updateTaskStatus(task.id, v as TaskStatus)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="OPEN">Abierta</SelectItem>
                                            <SelectItem value="IN_REVIEW">En revision</SelectItem>
                                            <SelectItem value="DONE">Completada</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-muted-foreground">Prioridad</label>
                                    <Select
                                        value={task.priority}
                                        onValueChange={(v) => updateTaskPriority(task.id, v as TaskPriority)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LOW">Baja</SelectItem>
                                            <SelectItem value="MEDIUM">Media</SelectItem>
                                            <SelectItem value="HIGH">Alta</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-muted-foreground">Tipo</label>
                                    <Select value={task.type} onValueChange={(v) => updateTaskType(task.id, v as TaskType)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="BUG">Bug</SelectItem>
                                            <SelectItem value="IMPROVEMENT">Mejora</SelectItem>
                                            <SelectItem value="NEW_SECTION">Nueva seccion</SelectItem>
                                            <SelectItem value="OTHER">Otro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {syncing && (
                                    <p className="text-xs text-muted-foreground">Sincronizando cambios con backend...</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle className="text-base">Etiquetas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Tipo:</span>
                                    <Badge variant="secondary">{taskTypeLabels[task.type]}</Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Prioridad:</span>
                                    <Badge variant="outline" className={priorityColors[task.priority]}>
                                        {taskPriorityLabels[task.priority]}
                                    </Badge>
                                </div>
                                {task.includeScreenshotLater && (
                                    <div className="mt-2 rounded bg-secondary/50 px-2 py-1 text-xs text-muted-foreground">
                                        El usuario indico que enviara captura despues.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {previewAttachment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
                    <div className="relative max-w-4xl">
                        <button
                            type="button"
                            onClick={() => setPreviewAttachmentId(null)}
                            className="absolute -right-2 -top-2 rounded-full bg-background p-1 text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <img
                            src={buildMediaUrl(previewAttachment.mediaPath)}
                            alt="Preview referencia visual"
                            className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain"
                        />
                    </div>
                </div>
            )}
        </>
    )
}
