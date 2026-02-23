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
    Loader2,
    Hash,
    Wand2,
    RotateCcw,
    Cpu,
    ImagePlus,
    X,
    RefreshCw,
    CircleHelp,
    ChevronUp,
    ChevronDown,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { buildConnectionMessage, isBackendUnavailableMessage } from "@/lib/chat/request-error"
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
    const [isSending, setIsSending] = useState(false)
    const [isImproving, setIsImproving] = useState(false)
    const [originalMessageBeforeImprove, setOriginalMessageBeforeImprove] = useState<string | null>(null)
    const [contextMenuCollapsed, setContextMenuCollapsed] = useState(false)
    const [modelPreference, setModelPreference] = useState<"default" | "gpt-5-mini">("default")
    const [latestUsage, setLatestUsage] = useState<AssistantUsageMetrics | null>(null)
    const [usageSummary, setUsageSummary] = useState<UsageSummaryResponse | null>(null)

    const [mediaReady, setMediaReady] = useState(false)
    const [mediaChecking, setMediaChecking] = useState(false)
    const [attachments, setAttachments] = useState<ComposerAttachment[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const attachmentsRef = useRef<ComposerAttachment[]>([])

    const { addMessage, canCreateSession, connectionMessage } = useChat()
    const { addTask, errorMessage: tasksError } = useTasks()

    const currentSection = routeToSection(pathname, role)
    const currentRoleTag = userRoleToRoleTag(role)
    const currentContextToken = isGeneralMode
        ? buildContextToken("GENERAL", generalArea)
        : buildContextToken(currentRoleTag, currentSection)

    const uploadingCount = useMemo(
        () => attachments.filter((item) => item.status === "uploading").length,
        [attachments]
    )
    const hasImageAttachments = attachments.length > 0

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
        let active = true
        setMediaChecking(true)

        void requestMediaCapabilities()
            .then((capabilities) => {
                if (!active) {
                    return
                }
                if (!capabilities.enabled) {
                    setMediaReady(false)
                    return
                }
                setMediaReady(true)
            })
            .catch(() => {
                if (!active) {
                    return
                }
                setMediaReady(false)
            })
            .finally(() => {
                if (active) {
                    setMediaChecking(false)
                }
            })

        return () => {
            active = false
        }
    }, [])

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
        if (!mediaReady || files.length === 0) {
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
    }, [attachments.length, mediaReady, uploadAttachment])

    const handleFilePicker = () => {
        if (!mediaReady) {
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
        if (!mediaReady) {
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

    const handleDragOver = (event: DragEvent<HTMLElement>) => {
        if (!mediaReady) {
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

    const handleDrop = (event: DragEvent<HTMLElement>) => {
        if (!mediaReady) {
            return
        }
        event.preventDefault()
        setIsDragging(false)
        queueFiles(Array.from(event.dataTransfer.files))
    }

    const handleSubmit = async () => {
        const trimmed = message.trim()
        if (!trimmed || isSending || isImproving || uploadingCount > 0) return
        if (!canCreateSession) {
            return
        }

        setIsSending(true)
        setSubmitError(null)

        const uploadedAttachments = attachments
            .filter((item) => item.status === "success" && item.upload)
            .map((item) => item.upload as MediaUploadResponse)

        const task = createTaskFromMessage({
            message: trimmed,
            role,
            pathname,
            type: taskType,
            priority,
            includeScreenshotLater: false,
            attachments: uploadedAttachments.map((attachment) => ({
                mediaPath: attachment.mediaPath,
                mimeType: attachment.mime,
                sizeBytes: attachment.size,
            })),
            isGeneralMode,
            generalArea,
            authorName: userName,
        })

        const persistedUserMessage = await addMessage({
            sender: "USER",
            text: trimmed,
            taskId: task.id,
            attachments: (task.attachments ?? []).map((attachment) => ({
                mediaPath: attachment.mediaPath,
                mimeType: attachment.mimeType,
                sizeBytes: attachment.sizeBytes,
            })),
        })
        if (!persistedUserMessage) {
            setSubmitError("No se pudo enviar el mensaje al servidor.")
            setIsSending(false)
            return
        }

        setMessage("")
        setOriginalMessageBeforeImprove(null)
        setTaskType("OTHER")
        setPriority("MEDIUM")
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
            await addTask(task.id)

            await addMessage({
                sender: "BOT",
                text: assistantResponse.reply,
            })
        } catch (error) {
            const connectivityMessage = buildConnectionMessage(error)
            setSubmitError(connectivityMessage)
            await addMessage({
                sender: "BOT",
                text: connectivityMessage,
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
    const composerErrorCandidates: Array<string | null> = [
        submitError,
        connectionMessage,
        tasksError,
    ]
    const composerErrorMessage = composerErrorCandidates.find((candidate) => (
        candidate !== null && !isBackendUnavailableMessage(candidate)
    )) ?? null

    return (
        <div
            className={cn(
                "bg-background p-4",
                isDragging && "ring-2 ring-primary/60"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="-mt-2 mb-4 flex items-center gap-2">
                <span className="h-px flex-1 bg-border/80" />
                <TooltipProvider delayDuration={120}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                onClick={() => setContextMenuCollapsed((prev) => !prev)}
                                className="relative z-10 -translate-y-1 inline-flex h-7 items-center gap-1 rounded-full border border-border bg-secondary/50 px-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
                                aria-label={contextMenuCollapsed ? "Mostrar menu de contexto" : "Ocultar menu de contexto"}
                            >
                                {contextMenuCollapsed ? (
                                    <ChevronUp className="h-3.5 w-3.5" />
                                ) : (
                                    <ChevronDown className="h-3.5 w-3.5" />
                                )}
                                Contexto
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" align="center" className="max-w-72">
                            {contextMenuCollapsed
                                ? "Muestra nuevamente el menu de contexto."
                                : "Oculta el menu de contexto para enfocarte en el mensaje."}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <span className="h-px flex-1 bg-border/80" />
            </div>

            <div
                className={cn(
                    "relative z-0 origin-top overflow-hidden transition-all duration-300 ease-out",
                    contextMenuCollapsed
                        ? "max-h-0 -translate-y-6 opacity-0 pointer-events-none -mb-3"
                        : "max-h-[320px] translate-y-0 opacity-100 mb-3"
                )}
            >
                <div className="rounded-lg border border-border bg-secondary/40 p-3">
                    <div className="flex items-start justify-between gap-3">
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
                    <div className="mt-3 border-t border-border/70 pt-2">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsGeneralMode(!isGeneralMode)}
                                    className="flex h-7 items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    <span className="inline-flex h-7 w-7 items-center justify-center">
                                        {isGeneralMode ? (
                                            <ToggleRight className="h-6 w-6 text-primary" />
                                        ) : (
                                            <ToggleLeft className="h-6 w-6" />
                                        )}
                                    </span>
                                    <span>Modo general</span>
                                </button>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button
                                            type="button"
                                            className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
                                            aria-label="Ayuda modo general"
                                        >
                                            <CircleHelp className="h-3.5 w-3.5" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent side="bottom" align="start" className="w-72 p-3 text-sm">
                                        Activalo cuando el cambio aplica a mas de una seccion o ruta.
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="h-7 min-w-[120px] text-xs text-muted-foreground">
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
                                    <span className="inline-flex h-7 items-center">{currentSection}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 mb-3 flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => setTaskType("BUG")}
                    className={cn(
                        "flex h-7 items-center gap-1.5 rounded-full px-3 text-[11px] font-medium transition-colors",
                        taskType === "BUG"
                            ? "bg-destructive/20 text-destructive"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                >
                    <Bug className="h-3 w-3" />
                    Bug
                </button>
                <button
                    type="button"
                    onClick={() => setTaskType("IMPROVEMENT")}
                    className={cn(
                        "flex h-7 items-center gap-1.5 rounded-full px-3 text-[11px] font-medium transition-colors",
                        taskType === "IMPROVEMENT"
                            ? "bg-primary/20 text-primary"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                >
                    <Sparkles className="h-3 w-3" />
                    Mejora
                </button>
                <button
                    type="button"
                    onClick={() => setPriority("HIGH")}
                    className={cn(
                        "flex h-7 items-center gap-1.5 rounded-full px-3 text-[11px] font-medium transition-colors",
                        priority === "HIGH"
                            ? "bg-warning/20 text-warning"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                >
                    <AlertTriangle className="h-3 w-3" />
                    Alta prioridad
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

            {composerErrorMessage && (
                <div className="mb-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    {composerErrorMessage}
                </div>
            )}

            <div className={cn(
                "rounded-xl border border-border bg-secondary/35 p-3",
                isDragging && "border-primary/70 ring-1 ring-primary/50"
            )}>
                {hasImageAttachments && (
                    <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1">
                        {attachments.map((attachment) => (
                            <div
                                key={attachment.id}
                                className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-background"
                            >
                                <img
                                    src={attachment.previewUrl}
                                    alt="Preview"
                                    className="h-full w-full object-cover"
                                />
                                {attachment.status === "uploading" && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                                    </div>
                                )}
                                {attachment.status === "error" && (
                                    <button
                                        type="button"
                                        onClick={() => retryAttachment(attachment.id)}
                                        className="absolute inset-0 flex items-center justify-center bg-black/60 text-white"
                                        title={attachment.error ?? "No se pudo subir la imagen"}
                                        aria-label="Reintentar subida"
                                    >
                                        <RefreshCw className="h-3.5 w-3.5" />
                                    </button>
                                )}
                                {attachment.status === "success" && (
                                    <span className="absolute bottom-1 left-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                )}
                                <button
                                    type="button"
                                    onClick={() => removeAttachment(attachment.id)}
                                    className="absolute -right-1 -top-1 rounded-full bg-black/75 p-1 text-white"
                                    aria-label="Quitar imagen"
                                >
                                    <X className="h-2.5 w-2.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        placeholder={`Describe el problema o sugerencia. Ejemplo: ${currentContextToken} boton no responde`}
                        rows={3}
                        className="feedback-textarea-scroll min-h-[96px] w-full flex-1 resize-none overflow-y-auto border-0 bg-transparent p-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                </div>

                <div className="mt-3 space-y-2 border-t border-border/70 pt-3">
                    <div className="flex items-center gap-2">
                        <TooltipProvider delayDuration={120}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="inline-flex">
                                        <button
                                            type="button"
                                            onClick={handleFilePicker}
                                            disabled={!mediaReady || mediaChecking || attachments.length >= MAX_ATTACHMENTS}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                                            aria-label="Seleccionar imagen"
                                        >
                                            <ImagePlus className="h-3.5 w-3.5" />
                                        </button>
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" align="center">Seleccionar imagen</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="inline-flex">
                                        <button
                                            type="button"
                                            onClick={() => void handleImproveMessage()}
                                            disabled={!message.trim() || isSending || isImproving}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                                            aria-label={isImproving ? "Mejorando mensaje" : "Mejorar mensaje"}
                                        >
                                            {isImproving ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Wand2 className="h-3.5 w-3.5" />
                                            )}
                                        </button>
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" align="center">Mejorar mensaje</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="inline-flex">
                                        <button
                                            type="button"
                                            onClick={handleRevertImprove}
                                            disabled={originalMessageBeforeImprove === null || isSending || isImproving}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                                            aria-label="Revertir mejora"
                                        >
                                            <RotateCcw className="h-3.5 w-3.5" />
                                        </button>
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" align="center">Revertir</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <div className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-background px-2 text-xs">
                            <Cpu className="h-3.5 w-3.5" />
                            <Select
                                value={modelPreference}
                                onValueChange={(value) => setModelPreference(value as "default" | "gpt-5-mini")}
                            >
                                <SelectTrigger className="h-8 w-[136px] border-0 bg-transparent px-1 text-xs">
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

                        <div className="ml-auto flex items-center">
                            <button
                                type="button"
                                onClick={() => void handleSubmit()}
                                disabled={!message.trim() || isSending || isImproving || uploadingCount > 0}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-none border-0 bg-transparent p-0 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
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

                    <div className="flex flex-wrap items-center gap-2">
                        {hasImageAttachments && (
                            <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                                Imagenes activas
                            </span>
                        )}
                        {uploadingCount > 0 && (
                            <span className="text-xs text-muted-foreground">Subiendo {uploadingCount}...</span>
                        )}
                    </div>
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
        </div>
    )
}
