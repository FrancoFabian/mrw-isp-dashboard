"use client"

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ChangeEvent,
    type ClipboardEvent,
    type DragEvent,
    type KeyboardEvent,
} from "react"
import {
    Send,
    Bug,
    Sparkles,
    AlertTriangle,
    ToggleLeft,
    ToggleRight,
    Camera,
    Loader2,
    Hash,
    Wand2,
    RotateCcw,
    Cpu,
    ImagePlus,
    X,
    RefreshCw,
    TriangleAlert,
} from "lucide-react"
import { useChat } from "@/stores/chat-context"
import { useTasks } from "@/stores/tasks-context"
import { createTaskFromMessage } from "@/helpers/createTaskFromMessage"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
    requestAssistantReply,
    requestImprovedMessage,
    requestUsageSummary,
} from "@/lib/chat/assistant-client"
import { MediaUploadError, requestMediaCapabilities, uploadChatMedia } from "@/lib/chat/media-client"
import type { UserRole } from "@/types/roles"
import type { TaskType, TaskPriority } from "@/types/task"
import type { GeneralArea } from "@/types/feedback"
import type { AssistantUsageMetrics, MediaUploadResponse, UsageSummaryResponse } from "@/types/chat-assistant"
import { generalAreas, generalAreaLabels } from "@/types/feedback"
import { taskTypeLabels, taskPriorityLabels, roleTagLabels } from "@/types/task"
import {
    buildContextToken,
    routeToSection,
    userRoleToRoleTag,
} from "@/helpers/routeToSection"

type UploadedAttachment = {
    mediaPath: string
    url: string
    mime: string
    size: number
}

type ComposerAttachment = {
    id: string
    file: File
    previewUrl: string
    status: "uploading" | "success" | "error"
    upload?: UploadedAttachment
    error?: string
}

interface MessageComposerProps {
    role: UserRole
    pathname: string
    userName: string
}

const MAX_ATTACHMENTS = 4

function attachmentId(): string {
    return `ATT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
}

function uploadErrorMessage(error: unknown): string {
    if (error instanceof MediaUploadError) {
        if (error.status === 413) {
            return "La imagen excede el tamano permitido"
        }
        if (error.status === 415) {
            return "Solo se permite PNG, JPG o WEBP"
        }
        return error.message
    }
    return "No se pudo subir la imagen"
}

export function MessageComposer({ role, pathname, userName }: MessageComposerProps) {
    const [message, setMessage] = useState("")
    const [taskType, setTaskType] = useState<TaskType>("OTHER")
    const [priority, setPriority] = useState<TaskPriority>("MEDIUM")
    const [isGeneralMode, setIsGeneralMode] = useState(false)
    const [generalArea, setGeneralArea] = useState<GeneralArea>("General")
    const [includeScreenshot, setIncludeScreenshot] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [isImproving, setIsImproving] = useState(false)
    const [originalMessageBeforeImprove, setOriginalMessageBeforeImprove] = useState<string | null>(null)
    const [modelPreference, setModelPreference] = useState<"default" | "gpt-5-mini">("default")
    const [latestUsage, setLatestUsage] = useState<AssistantUsageMetrics | null>(null)
    const [usageSummary, setUsageSummary] = useState<UsageSummaryResponse | null>(null)

    const [attachmentsEnabled, setAttachmentsEnabled] = useState(false)
    const [mediaReady, setMediaReady] = useState(false)
    const [mediaChecking, setMediaChecking] = useState(false)
    const [mediaError, setMediaError] = useState<string | null>(null)
    const [attachments, setAttachments] = useState<ComposerAttachment[]>([])
    const [isDragging, setIsDragging] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const attachmentsRef = useRef<ComposerAttachment[]>([])

    const { addMessage } = useChat()
    const { addTask } = useTasks()

    const currentSection = routeToSection(pathname, role)
    const currentRoleTag = userRoleToRoleTag(role)
    const currentContextToken = isGeneralMode
        ? buildContextToken("GENERAL", generalArea)
        : buildContextToken(currentRoleTag, currentSection)

    const uploadingCount = useMemo(
        () => attachments.filter((item) => item.status === "uploading").length,
        [attachments]
    )

    const refreshUsageSummary = useCallback(async () => {
        try {
            const summary = await requestUsageSummary()
            setUsageSummary(summary)
        } catch {
            // Keep chat usable if telemetry endpoint fails.
        }
    }, [])

    useEffect(() => {
        void refreshUsageSummary()
    }, [refreshUsageSummary])

    useEffect(() => {
        attachmentsRef.current = attachments
    }, [attachments])

    useEffect(() => {
        return () => {
            for (const attachment of attachmentsRef.current) {
                URL.revokeObjectURL(attachment.previewUrl)
            }
        }
    }, [])

    useEffect(() => {
        if (!attachmentsEnabled || mediaReady || mediaChecking) {
            return
        }

        let active = true
        setMediaChecking(true)
        setMediaError(null)

        void requestMediaCapabilities()
            .then((capabilities) => {
                if (!active) {
                    return
                }
                if (!capabilities.enabled) {
                    setMediaReady(false)
                    setAttachmentsEnabled(false)
                    setMediaError("El backend no tiene habilitado el upload de imagenes")
                    return
                }
                setMediaReady(true)
            })
            .catch(() => {
                if (!active) {
                    return
                }
                setMediaReady(false)
                setAttachmentsEnabled(false)
                setMediaError("No se pudo validar soporte de imagenes en backend")
            })
            .finally(() => {
                if (active) {
                    setMediaChecking(false)
                }
            })

        return () => {
            active = false
        }
    }, [attachmentsEnabled, mediaReady, mediaChecking])

    const updateAttachment = useCallback((id: string, updater: (item: ComposerAttachment) => ComposerAttachment) => {
        setAttachments((prev) => prev.map((item) => (item.id === id ? updater(item) : item)))
    }, [])

    const uploadAttachment = useCallback(async (item: ComposerAttachment) => {
        try {
            const upload = await uploadChatMedia(item.file)
            updateAttachment(item.id, (current) => ({
                ...current,
                status: "success",
                upload,
                error: undefined,
            }))
        } catch (error) {
            updateAttachment(item.id, (current) => ({
                ...current,
                status: "error",
                error: uploadErrorMessage(error),
            }))
        }
    }, [updateAttachment])

    const queueFiles = useCallback((files: File[]) => {
        if (!attachmentsEnabled || !mediaReady || files.length === 0) {
            return
        }

        const room = Math.max(0, MAX_ATTACHMENTS - attachments.length)
        if (room === 0) {
            return
        }

        const accepted = files
            .filter((file) => file.type.startsWith("image/"))
            .slice(0, room)

        const toUpload: ComposerAttachment[] = accepted.map((file) => ({
            id: attachmentId(),
            file,
            previewUrl: URL.createObjectURL(file),
            status: "uploading",
        }))

        if (toUpload.length === 0) {
            return
        }

        setAttachments((prev) => [...prev, ...toUpload])
        for (const item of toUpload) {
            void uploadAttachment(item)
        }
    }, [attachments.length, attachmentsEnabled, mediaReady, uploadAttachment])

    const handleFilePicker = () => {
        if (!attachmentsEnabled || !mediaReady) {
            return
        }
        fileInputRef.current?.click()
    }

    const handlePickFiles = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files ? Array.from(event.target.files) : []
        queueFiles(files)
        event.target.value = ""
    }

    const removeAttachment = (id: string) => {
        setAttachments((prev) => {
            const found = prev.find((item) => item.id === id)
            if (found) {
                URL.revokeObjectURL(found.previewUrl)
            }
            return prev.filter((item) => item.id !== id)
        })
    }

    const retryAttachment = (id: string) => {
        const candidate = attachments.find((item) => item.id === id)
        if (!candidate) {
            return
        }
        updateAttachment(id, (current) => ({ ...current, status: "uploading", error: undefined }))
        void uploadAttachment(candidate)
    }

    const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
        if (!attachmentsEnabled || !mediaReady) {
            return
        }
        const files: File[] = []
        for (const item of event.clipboardData.items) {
            if (item.kind === "file" && item.type.startsWith("image/")) {
                const file = item.getAsFile()
                if (file) {
                    files.push(file)
                }
            }
        }
        if (files.length > 0) {
            event.preventDefault()
            queueFiles(files)
        }
    }

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        if (!attachmentsEnabled || !mediaReady) {
            return
        }
        if (!Array.from(event.dataTransfer.types).includes("Files")) {
            return
        }
        event.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        if (!attachmentsEnabled || !mediaReady) {
            return
        }
        event.preventDefault()
        setIsDragging(false)
        queueFiles(Array.from(event.dataTransfer.files))
    }

    const handleSubmit = async () => {
        const trimmed = message.trim()
        if (!trimmed || isSending || isImproving || uploadingCount > 0) return

        setIsSending(true)

        const uploadedAttachments = attachments
            .filter((item) => item.status === "success" && item.upload)
            .map((item) => item.upload as MediaUploadResponse)

        const task = createTaskFromMessage({
            message: trimmed,
            role,
            pathname,
            type: taskType,
            priority,
            includeScreenshotLater: includeScreenshot,
            attachments: uploadedAttachments.map((attachment) => ({
                mediaPath: attachment.mediaPath,
                mimeType: attachment.mime,
                sizeBytes: attachment.size,
            })),
            isGeneralMode,
            generalArea,
            authorName: userName,
        })

        addTask(task)

        addMessage({
            sender: "USER",
            text: trimmed,
            taskId: task.id,
            attachments: (task.attachments ?? []).map((attachment) => ({
                mediaPath: attachment.mediaPath,
                mimeType: attachment.mimeType,
                sizeBytes: attachment.sizeBytes,
            })),
        })

        const fallbackLocationText = isGeneralMode
            ? `GENERAL / ${generalAreaLabels[generalArea]}`
            : `${roleTagLabels[task.roleTag]} / ${task.sectionTag}`
        const fallbackContextToken = buildContextToken(task.roleTag, task.sectionTag)

        const fallbackReply = [
            `Listo. Registre tu ${taskTypeLabels[taskType].toLowerCase()} en ${fallbackLocationText}.`,
            `Ruta: ${task.route}`,
            `ID: ${task.id} | Prioridad: ${taskPriorityLabels[priority]}`,
            `Tip: para mayor precision usa ${fallbackContextToken}. Ejemplo: #Clients/pagos.`,
        ].join("\n")

        setMessage("")
        setOriginalMessageBeforeImprove(null)
        setTaskType("OTHER")
        setPriority("MEDIUM")
        setIncludeScreenshot(false)
        for (const item of attachments) {
            URL.revokeObjectURL(item.previewUrl)
        }
        setAttachments([])

        try {
            const assistantResponse = await requestAssistantReply({
                message: trimmed,
                route: pathname,
                sectionTag: task.sectionTag,
                role,
                roleTag: task.roleTag,
                taskId: task.id,
                taskType,
                priority,
                userName,
                isGeneralMode,
                modelPreference,
                attachments: uploadedAttachments.map((attachment) => ({
                    mediaPath: attachment.mediaPath,
                    mime: attachment.mime,
                    size: attachment.size,
                })),
            })

            if (assistantResponse.usage) {
                setLatestUsage(assistantResponse.usage)
            }
            await refreshUsageSummary()

            addMessage({
                sender: "BOT",
                text: assistantResponse.reply,
            })
        } catch {
            addMessage({
                sender: "BOT",
                text: fallbackReply,
            })
        } finally {
            setIsSending(false)
        }
    }

    const handleImproveMessage = async () => {
        const trimmed = message.trim()
        if (!trimmed || isSending || isImproving) return

        setIsImproving(true)
        const original = message

        try {
            const improved = await requestImprovedMessage({
                message: original,
                route: pathname,
                sectionTag: isGeneralMode ? generalArea : currentSection,
                role,
                roleTag: isGeneralMode ? "GENERAL" : currentRoleTag,
                taskType,
                priority,
                userName,
                isGeneralMode,
                modelPreference,
            })

            if (originalMessageBeforeImprove === null) {
                setOriginalMessageBeforeImprove(original)
            }
            setMessage(improved.improvedMessage)

            if (improved.usage) {
                setLatestUsage(improved.usage)
            }
            await refreshUsageSummary()
        } catch {
            // Keep original text if improvement request fails.
        } finally {
            setIsImproving(false)
        }
    }

    const handleRevertImprove = () => {
        if (originalMessageBeforeImprove === null) return
        setMessage(originalMessageBeforeImprove)
        setOriginalMessageBeforeImprove(null)
    }

    const handleInsertContextToken = () => {
        setMessage((prev) => {
            const current = prev.trimStart()
            if (current.startsWith("#")) {
                return prev
            }
            return current.length === 0
                ? `${currentContextToken} `
                : `${currentContextToken} ${prev}`
        })
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            void handleSubmit()
        }
    }

    return (
        <div
            className={cn(
                "border-t border-border bg-background p-4",
                isDragging && "ring-2 ring-primary/60"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="mb-3 rounded-lg border border-border bg-secondary/40 p-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Contexto detectado
                        </p>
                        <p className="text-xs text-foreground">
                            Seccion: {isGeneralMode ? generalAreaLabels[generalArea] : currentSection}
                        </p>
                        <p className="text-xs text-muted-foreground">Ruta: {pathname}</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleInsertContextToken}
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-foreground transition-colors hover:bg-secondary"
                    >
                        <Hash className="h-3.5 w-3.5" />
                        {currentContextToken}
                    </button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                    Tip: puedes citar contexto manual con etiquetas como #Clients/pagos.
                </p>
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => setTaskType("BUG")}
                    className={cn(
                        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                        taskType === "BUG"
                            ? "bg-destructive/20 text-destructive"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                >
                    <Bug className="h-3.5 w-3.5" />
                    Bug
                </button>
                <button
                    type="button"
                    onClick={() => setTaskType("IMPROVEMENT")}
                    className={cn(
                        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                        taskType === "IMPROVEMENT"
                            ? "bg-primary/20 text-primary"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                >
                    <Sparkles className="h-3.5 w-3.5" />
                    Mejora
                </button>
                <button
                    type="button"
                    onClick={() => setPriority("HIGH")}
                    className={cn(
                        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                        priority === "HIGH"
                            ? "bg-warning/20 text-warning"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Alta prioridad
                </button>
            </div>

            <div className="mb-3 rounded-lg bg-secondary/50 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                    <button
                        type="button"
                        onClick={() => setIsGeneralMode(!isGeneralMode)}
                        className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        {isGeneralMode ? (
                            <ToggleRight className="h-5 w-5 text-primary" />
                        ) : (
                            <ToggleLeft className="h-5 w-5" />
                        )}
                        <span>Modo general (varias pantallas)</span>
                    </button>
                    <span className="text-xs text-muted-foreground">
                        {isGeneralMode ? (
                            <Select
                                value={generalArea}
                                onValueChange={(v) => setGeneralArea(v as GeneralArea)}
                            >
                                <SelectTrigger className="h-7 w-40 border-0 bg-transparent text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {generalAreas.map((area) => (
                                        <SelectItem key={area} value={area} className="text-xs">
                                            {generalAreaLabels[area]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            currentSection
                        )}
                    </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                    Activalo cuando el cambio aplica a mas de una seccion o ruta.
                </p>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-secondary/40 p-2">
                <div className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1 text-xs">
                    <Cpu className="h-3.5 w-3.5" />
                    <span>Modelo</span>
                    <Select
                        value={modelPreference}
                        onValueChange={(value) => setModelPreference(value as "default" | "gpt-5-mini")}
                    >
                        <SelectTrigger className="h-7 w-36 border-0 bg-transparent text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="default" className="text-xs">
                                Default
                            </SelectItem>
                            <SelectItem value="gpt-5-mini" className="text-xs">
                                GPT-5 mini
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <button
                    type="button"
                    onClick={() => void handleImproveMessage()}
                    disabled={!message.trim() || isSending || isImproving}
                    className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isImproving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Wand2 className="h-3.5 w-3.5" />
                    )}
                    Mejorar mensaje
                </button>

                <button
                    type="button"
                    onClick={handleRevertImprove}
                    disabled={originalMessageBeforeImprove === null || isSending || isImproving}
                    className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Revertir
                </button>
            </div>

            {(latestUsage || usageSummary) && (
                <div className="mb-3 rounded-lg border border-border bg-secondary/30 p-2 text-xs text-muted-foreground">
                    {latestUsage && (
                        <p>
                            Ultima llamada: in {latestUsage.promptTokens} | out {latestUsage.completionTokens} | total {latestUsage.totalTokens} | costo USD {latestUsage.estimatedCostUsd.toFixed(6)}
                        </p>
                    )}
                    {usageSummary && (
                        <>
                            <p>
                                Acumulado: {usageSummary.totals.eventCount} llamadas | tokens {usageSummary.totals.totalTokens} | costo USD {usageSummary.totals.estimatedCostUsd.toFixed(6)}
                            </p>
                            {usageSummary.byModel.length > 0 && (
                                <p className="mt-1">
                                    Por modelo: {usageSummary.byModel.map((item) => `${item.model} USD ${item.estimatedCostUsd.toFixed(6)}`).join(" | ")}
                                </p>
                            )}
                        </>
                    )}
                </div>
            )}

            <div className="mb-3 rounded-lg border border-border bg-secondary/40 p-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                    <input
                        type="checkbox"
                        checked={attachmentsEnabled}
                        onChange={(e) => setAttachmentsEnabled(e.target.checked)}
                        className="h-4 w-4 rounded border-input bg-secondary accent-primary"
                    />
                    <Camera className="h-4 w-4" />
                    <span>Habilitar subida de imagenes (Ctrl+V, drag/drop, seleccionar)</span>
                </label>
                {mediaChecking && (
                    <p className="mt-1 text-xs text-muted-foreground">Validando capacidades de backend...</p>
                )}
                {mediaError && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                        <TriangleAlert className="h-3.5 w-3.5" />
                        {mediaError}
                    </p>
                )}
                <div className="mt-2 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleFilePicker}
                        disabled={!attachmentsEnabled || !mediaReady || attachments.length >= MAX_ATTACHMENTS}
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ImagePlus className="h-3.5 w-3.5" />
                        Seleccionar imagen
                    </button>
                    <span className="text-xs text-muted-foreground">
                        {attachments.length}/{MAX_ATTACHMENTS}
                    </span>
                    {uploadingCount > 0 && (
                        <span className="text-xs text-muted-foreground">Subiendo {uploadingCount}...</span>
                    )}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    className="hidden"
                    onChange={handlePickFiles}
                />
            </div>

            {attachments.length > 0 && (
                <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                    {attachments.map((attachment) => (
                        <div
                            key={attachment.id}
                            className="relative w-28 shrink-0 overflow-hidden rounded-md border border-border bg-secondary/50"
                        >
                            <img
                                src={attachment.previewUrl}
                                alt="Preview"
                                className="h-20 w-full object-cover"
                            />
                            <div className="p-1">
                                {attachment.status === "uploading" && (
                                    <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        uploading
                                    </p>
                                )}
                                {attachment.status === "success" && (
                                    <p className="text-[10px] text-emerald-500">success</p>
                                )}
                                {attachment.status === "error" && (
                                    <div className="space-y-1">
                                        <p className="line-clamp-2 text-[10px] text-destructive">{attachment.error ?? "error"}</p>
                                        <button
                                            type="button"
                                            onClick={() => retryAttachment(attachment.id)}
                                            className="inline-flex items-center gap-1 text-[10px] text-foreground hover:text-primary"
                                        >
                                            <RefreshCw className="h-3 w-3" />
                                            Reintentar
                                        </button>
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => removeAttachment(attachment.id)}
                                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                                aria-label="Quitar imagen"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <input
                    type="checkbox"
                    checked={includeScreenshot}
                    onChange={(e) => setIncludeScreenshot(e.target.checked)}
                    className="h-4 w-4 rounded border-input bg-secondary accent-primary"
                />
                <Camera className="h-4 w-4" />
                <span>Incluir captura de pantalla despues</span>
            </label>

            <div className="flex gap-2">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    placeholder={`Describe el problema o sugerencia. Ejemplo: ${currentContextToken} boton no responde`}
                    rows={2}
                    className="flex-1 resize-none rounded-lg border border-input bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                    type="button"
                    onClick={() => void handleSubmit()}
                    disabled={!message.trim() || isSending || isImproving || uploadingCount > 0}
                    className="flex h-auto min-w-12 items-center justify-center rounded-lg bg-primary px-4 text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={isSending ? "Enviando" : "Enviar mensaje"}
                >
                    {isSending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Send className="h-5 w-5" />
                    )}
                </button>
            </div>
        </div>
    )
}
