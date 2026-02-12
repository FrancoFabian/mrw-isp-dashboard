"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    ticketCategoryLabels,
    ticketPriorityLabels,
} from "@/types/ticket"
import type { TicketCategory, TicketPriority } from "@/types/ticket"
import {
    ArrowLeft,
    Send,
    Paperclip,
    HelpCircle,
} from "lucide-react"

const categories: { value: TicketCategory; label: string; description: string }[] = [
    { value: "technical", label: "Técnico", description: "Problemas con tu conexión o equipo" },
    { value: "billing", label: "Facturación", description: "Dudas sobre pagos o facturas" },
    { value: "installation", label: "Instalación", description: "Cambios o reinstalaciones" },
    { value: "general", label: "General", description: "Otras consultas" },
]

export default function NewTicketPage() {
    const router = useRouter()
    const [category, setCategory] = useState<TicketCategory | "">("")
    const [priority, setPriority] = useState<TicketPriority>("medium")
    const [subject, setSubject] = useState("")
    const [description, setDescription] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Mock submit - in real app would POST to API
        alert("Ticket creado exitosamente (demo)")
        router.push("/dashboard/portal/support")
    }

    const isValid = category && subject.trim() && description.trim()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link href="/dashboard/portal/support" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2">
                    <ArrowLeft className="h-4 w-4" />
                    Volver a mis solicitudes
                </Link>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                    Nueva Solicitud
                </h1>
                <p className="text-sm text-muted-foreground">
                    Cuéntanos cómo podemos ayudarte
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category selection */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">
                        ¿Qué tipo de ayuda necesitas?
                    </label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {categories.map((cat) => (
                            <button
                                key={cat.value}
                                type="button"
                                onClick={() => setCategory(cat.value)}
                                className={`glass-card p-4 text-left transition-all ${category === cat.value
                                        ? "border-primary/40 bg-primary/5"
                                        : "hover:border-border/60"
                                    }`}
                            >
                                <p className="text-sm font-medium text-foreground">{cat.label}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{cat.description}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium text-foreground">
                        Asunto
                    </label>
                    <input
                        id="subject"
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Describe brevemente tu problema"
                        className="w-full rounded-lg border border-border bg-secondary/50 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium text-foreground">
                        Descripción
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Cuéntanos más detalles sobre tu problema o consulta..."
                        rows={6}
                        className="w-full rounded-lg border border-border bg-secondary/50 p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    />
                </div>

                {/* Attachment placeholder */}
                <div className="glass-card p-4">
                    <div className="flex items-center gap-3">
                        <Paperclip className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium text-foreground">Adjuntar archivos</p>
                            <p className="text-xs text-muted-foreground">
                                Puedes adjuntar capturas de pantalla o fotos para ayudarnos a entender mejor tu problema
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="mt-3 rounded-lg border border-dashed border-border px-4 py-2 text-sm text-muted-foreground hover:border-border/80 hover:text-foreground"
                    >
                        Seleccionar archivos
                    </button>
                </div>

                {/* Tip */}
                <div className="glass-card p-4 bg-primary/5 border-primary/20">
                    <div className="flex items-start gap-3">
                        <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-foreground">Tip</p>
                            <p className="text-xs text-muted-foreground">
                                Entre más detalles nos proporciones, más rápido podremos ayudarte.
                                Incluye información como horarios en que ocurre el problema, qué dispositivos afecta, etc.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3">
                    <Link
                        href="/dashboard/portal/support"
                        className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={!isValid}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="h-4 w-4" />
                        Enviar solicitud
                    </button>
                </div>
            </form>
        </div>
    )
}
