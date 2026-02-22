"use client"

import {
    createContext,
    useContext,
    useState,
    useCallback,
    type ReactNode,
} from "react"
import type { TaskItem, TaskDevNote, TaskStatus, TaskPriority, TaskType } from "@/types/task"
import { mockTasks } from "@/mocks/tasks"

interface TasksContextValue {
    tasks: TaskItem[]
    addTask: (task: TaskItem) => void
    updateTaskStatus: (taskId: string, status: TaskStatus) => void
    updateTaskPriority: (taskId: string, priority: TaskPriority) => void
    updateTaskType: (taskId: string, type: TaskType) => void
    addDevNote: (taskId: string, note: Omit<TaskDevNote, 'id' | 'createdAt'>) => void
    removeTaskAttachment: (taskId: string, attachmentId: string) => void
    getTaskById: (taskId: string) => TaskItem | undefined
}

const TasksContext = createContext<TasksContextValue | null>(null)

export function TasksProvider({ children }: { children: ReactNode }) {
    const [tasks, setTasks] = useState<TaskItem[]>(mockTasks)

    const addTask = useCallback((task: TaskItem) => {
        setTasks((prev) => [task, ...prev])
    }, [])

    const updateTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === taskId ? { ...task, status } : task
            )
        )
    }, [])

    const updateTaskPriority = useCallback((taskId: string, priority: TaskPriority) => {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === taskId ? { ...task, priority } : task
            )
        )
    }, [])

    const updateTaskType = useCallback((taskId: string, type: TaskType) => {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === taskId ? { ...task, type } : task
            )
        )
    }, [])

    const addDevNote = useCallback(
        (taskId: string, note: Omit<TaskDevNote, 'id' | 'createdAt'>) => {
            const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase()
            const newNote: TaskDevNote = {
                ...note,
                id: `NOTE-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`,
                createdAt: new Date().toISOString(),
            }
            setTasks((prev) =>
                prev.map((task) =>
                    task.id === taskId
                        ? { ...task, devNotes: [...(task.devNotes ?? []), newNote] }
                        : task
                )
            )
        },
        []
    )

    const removeTaskAttachment = useCallback((taskId: string, attachmentId: string) => {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === taskId
                    ? {
                        ...task,
                        attachments: (task.attachments ?? []).filter((attachment) => attachment.id !== attachmentId),
                    }
                    : task
            )
        )
    }, [])

    const getTaskById = useCallback(
        (taskId: string) => tasks.find((t) => t.id === taskId),
        [tasks]
    )

    return (
        <TasksContext.Provider
            value={{
                tasks,
                addTask,
                updateTaskStatus,
                updateTaskPriority,
                updateTaskType,
                addDevNote,
                removeTaskAttachment,
                getTaskById,
            }}
        >
            {children}
        </TasksContext.Provider>
    )
}

export function useTasks() {
    const context = useContext(TasksContext)
    if (!context) {
        throw new Error("useTasks must be used within a TasksProvider")
    }
    return context
}
