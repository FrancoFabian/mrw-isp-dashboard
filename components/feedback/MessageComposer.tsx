"use client"

import { useState } from "react"
import { Send, Bug, Sparkles, AlertTriangle, ToggleLeft, ToggleRight, Camera } from "lucide-react"
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
import type { UserRole } from "@/types/roles"
import type { TaskType, TaskPriority } from "@/types/task"
import type { GeneralArea } from "@/types/feedback"
import { generalAreas, generalAreaLabels } from "@/types/feedback"
import { taskTypeLabels, taskPriorityLabels, roleTagLabels } from "@/types/task"
import { routeToSection } from "@/helpers/routeToSection"

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

    const { addMessage } = useChat()
    const { addTask } = useTasks()

    const currentSection = routeToSection(pathname, role)

    const handleSubmit = () => {
        const trimmed = message.trim()
        if (!trimmed) return

        // Create the task
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

        // Add task to store
        addTask(task)

        // Add user message
        addMessage({
            sender: "USER",
            text: trimmed,
            taskId: task.id,
        })

        // Add bot confirmation
        const locationText = isGeneralMode
            ? `GENERAL / ${generalArea}`
            : `${roleTagLabels[task.roleTag]} / ${task.sectionTag}`

        addMessage({
            sender: "BOT",
            text: `✅ Listo. Registré tu ${taskTypeLabels[taskType].toLowerCase()} en **${locationText}**.\n\nID: ${task.id}\nPrioridad: ${taskPriorityLabels[priority]}`,
        })

        // Reset form
        setMessage("")
        setTaskType("OTHER")
        setPriority("MEDIUM")
        setIncludeScreenshot(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    return (
        <div className="border-t border-border bg-background p-4">
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
            <div className="mb-3 flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                <div className="flex items-center gap-2">
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
                        <span>Cambios generales</span>
                    </button>
                </div>
                <span className="text-xs text-muted-foreground">
                    {isGeneralMode ? (
                        <Select
                            value={generalArea}
                            onValueChange={(v) => setGeneralArea(v as GeneralArea)}
                        >
                            <SelectTrigger className="h-7 w-32 border-0 bg-transparent text-xs">
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
                        `${currentSection}`
                    )}
                </span>
            </div>

            {/* Screenshot checkbox */}
            <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <input
                    type="checkbox"
                    checked={includeScreenshot}
                    onChange={(e) => setIncludeScreenshot(e.target.checked)}
                    className="h-4 w-4 rounded border-input bg-secondary accent-primary"
                />
                <Camera className="h-4 w-4" />
                <span>Incluir captura de pantalla después</span>
            </label>

            {/* Input area */}
            <div className="flex gap-2">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe el problema o sugerencia..."
                    rows={2}
                    className="flex-1 resize-none rounded-lg border border-input bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!message.trim()}
                    className="flex h-auto items-center justify-center rounded-lg bg-primary px-4 text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Enviar mensaje"
                >
                    <Send className="h-5 w-5" />
                </button>
            </div>
        </div>
    )
}
