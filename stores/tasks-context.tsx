"use client"

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    type ReactNode,
} from "react"
import type { TaskItem, TaskDevNote, TaskStatus, TaskPriority, TaskType } from "@/types/task"
import {
    addTaskDevNote as requestAddTaskDevNote,
    removeTaskAttachment as requestRemoveTaskAttachment,
    requestTask,
    requestTasks,
    updateTask,
} from "@/lib/chat/tasks-client"
import { buildConnectionMessage } from "@/lib/chat/request-error"

interface TasksContextValue {
    tasks: TaskItem[]
    loading: boolean
    syncing: boolean
    errorMessage: string | null
    refreshTasks: () => Promise<void>
    addTask: (taskId: string) => Promise<TaskItem | null>
    updateTaskStatus: (taskId: string, status: TaskStatus) => void
    updateTaskPriority: (taskId: string, priority: TaskPriority) => void
    updateTaskType: (taskId: string, type: TaskType) => void
    addDevNote: (taskId: string, note: Omit<TaskDevNote, 'id' | 'createdAt'>) => void
    removeTaskAttachment: (taskId: string, attachmentId: string) => void
    getTaskById: (taskId: string) => TaskItem | undefined
}

const TasksContext = createContext<TasksContextValue | null>(null)

export function TasksProvider({ children }: { children: ReactNode }) {
    const [tasks, setTasks] = useState<TaskItem[]>([])
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const upsertTask = useCallback((task: TaskItem) => {
        setTasks((prev) => {
            const index = prev.findIndex((item) => item.id === task.id)
            if (index < 0) {
                return [task, ...prev]
            }
            const copy = [...prev]
            copy[index] = task
            return copy
        })
    }, [])

    const refreshTasks = useCallback(async () => {
        setLoading(true)
        try {
            const remoteTasks = await requestTasks()
            setTasks(remoteTasks)
            setErrorMessage(null)
        } catch (error) {
            setErrorMessage(buildConnectionMessage(error))
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void refreshTasks()
    }, [refreshTasks])

    useEffect(() => {
        const onOnline = () => void refreshTasks()
        const onOffline = () => setErrorMessage("Sin conexion a internet. No se pudo conectar con el servidor.")
        window.addEventListener("online", onOnline)
        window.addEventListener("offline", onOffline)
        return () => {
            window.removeEventListener("online", onOnline)
            window.removeEventListener("offline", onOffline)
        }
    }, [refreshTasks])

    const addTask = useCallback(async (taskId: string): Promise<TaskItem | null> => {
        setSyncing(true)
        try {
            const remoteTask = await requestTask(taskId)
            upsertTask(remoteTask)
            setErrorMessage(null)
            return remoteTask
        } catch (error) {
            setErrorMessage(buildConnectionMessage(error))
            return null
        } finally {
            setSyncing(false)
        }
    }, [upsertTask])

    const updateTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
        setSyncing(true)
        void updateTask(taskId, { status })
            .then((remoteTask) => {
                upsertTask(remoteTask)
                setErrorMessage(null)
            })
            .catch((error) => {
                setErrorMessage(buildConnectionMessage(error))
            })
            .finally(() => {
                setSyncing(false)
            })
    }, [upsertTask])

    const updateTaskPriority = useCallback((taskId: string, priority: TaskPriority) => {
        setSyncing(true)
        void updateTask(taskId, { priority })
            .then((remoteTask) => {
                upsertTask(remoteTask)
                setErrorMessage(null)
            })
            .catch((error) => {
                setErrorMessage(buildConnectionMessage(error))
            })
            .finally(() => {
                setSyncing(false)
            })
    }, [upsertTask])

    const updateTaskType = useCallback((taskId: string, type: TaskType) => {
        setSyncing(true)
        void updateTask(taskId, { type })
            .then((remoteTask) => {
                upsertTask(remoteTask)
                setErrorMessage(null)
            })
            .catch((error) => {
                setErrorMessage(buildConnectionMessage(error))
            })
            .finally(() => {
                setSyncing(false)
            })
    }, [upsertTask])

    const addDevNote = useCallback(
        (taskId: string, note: Omit<TaskDevNote, 'id' | 'createdAt'>) => {
            setSyncing(true)
            void requestAddTaskDevNote(taskId, {
                authorName: note.author.name,
                text: note.text,
            })
                .then((savedNote) => {
                    setTasks((prev) =>
                        prev.map((task) =>
                            task.id === taskId
                                ? { ...task, devNotes: [...(task.devNotes ?? []), savedNote] }
                                : task
                        )
                    )
                    setErrorMessage(null)
                })
                .catch((error) => {
                    setErrorMessage(buildConnectionMessage(error))
                })
                .finally(() => {
                    setSyncing(false)
                })
        },
        []
    )

    const removeTaskAttachment = useCallback((taskId: string, attachmentId: string) => {
        setSyncing(true)
        void requestRemoveTaskAttachment(taskId, attachmentId)
            .then(() => {
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
                setErrorMessage(null)
            })
            .catch((error) => {
                setErrorMessage(buildConnectionMessage(error))
            })
            .finally(() => {
                setSyncing(false)
            })
    }, [])

    const getTaskById = useCallback(
        (taskId: string) => tasks.find((t) => t.id === taskId),
        [tasks]
    )

    return (
        <TasksContext.Provider
            value={{
                tasks,
                loading,
                syncing,
                errorMessage,
                refreshTasks,
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
