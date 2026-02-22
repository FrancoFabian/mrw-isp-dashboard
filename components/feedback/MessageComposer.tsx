"use client"

import { useCallback, useEffect, useState } from "react"
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
import type { UserRole } from "@/types/roles"
import type { TaskType, TaskPriority } from "@/types/task"
import type { GeneralArea } from "@/types/feedback"
import type { AssistantUsageMetrics, UsageSummaryResponse } from "@/types/chat-assistant"
import { generalAreas, generalAreaLabels } from "@/types/feedback"
import { taskTypeLabels, taskPriorityLabels, roleTagLabels } from "@/types/task"
import {
    buildContextToken,
    routeToSection,
    userRoleToRoleTag,
} from "@/helpers/routeToSection"

interface MessageComposerProps {
    role: UserRole
    pathname: string
    userName: string
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

    const { addMessage } = useChat()
    const { addTask } = useTasks()

    const currentSection = routeToSection(pathname, role)
    const currentRoleTag = userRoleToRoleTag(role)
    const currentContextToken = isGeneralMode
        ? buildContextToken('GENERAL', generalArea)
        : buildContextToken(currentRoleTag, currentSection)

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

    const handleSubmit = async () => {
        const trimmed = message.trim()
        if (!trimmed || isSending || isImproving) return

        setIsSending(true)

        // Create and register the task immediately to avoid losing user intent.
        const task = createTaskFromMessage({
            message: trimmed,
            role,
            pathname,
            type: taskType,
            priority,
            includeScreenshotLater: includeScreenshot,
            isGeneralMode,
            generalArea,
            authorName: userName,
        })

        addTask(task)

        addMessage({
            sender: "USER",
            text: trimmed,
            taskId: task.id,
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

        // Reset form fields while the assistant response is being generated.
        setMessage("")
        setOriginalMessageBeforeImprove(null)
        setTaskType("OTHER")
        setPriority("MEDIUM")
        setIncludeScreenshot(false)

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
            if (current.startsWith('#')) {
                return prev
            }
            return current.length === 0
                ? `${currentContextToken} `
                : `${currentContextToken} ${prev}`
        })
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            void handleSubmit()
        }
    }

    return (
        <div className="border-t border-border bg-background p-4">
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

            {/* Quick actions row */}
            <div className="mb-3 flex flex-wrap gap-2">
                {/* Type quick actions */}
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

            {/* General mode toggle */}
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

            {/* Screenshot checkbox */}
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

            {/* Input area */}
            <div className="flex gap-2">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Describe el problema o sugerencia. Ejemplo: ${currentContextToken} boton no responde`}
                    rows={2}
                    className="flex-1 resize-none rounded-lg border border-input bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                    type="button"
                    onClick={() => void handleSubmit()}
                    disabled={!message.trim() || isSending || isImproving}
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
