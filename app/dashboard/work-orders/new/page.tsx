"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Save, User, MapPin, Wifi } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { mockStaff } from "@/mocks/staff"
import { mockChecklistTemplates } from "@/mocks/checklistTemplates"

// Mock plans for selection
const plans = [
    { id: "PLN-001", name: "Basico 10 Mbps" },
    { id: "PLN-002", name: "Hogar 30 Mbps" },
    { id: "PLN-003", name: "Plus 50 Mbps" },
    { id: "PLN-004", name: "Premium 100 Mbps" },
]

export default function NewWorkOrderPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const installers = mockStaff.filter(s => s.role === "installer")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Redirect to list
        router.push("/dashboard/work-orders")
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/work-orders"
                    className="rounded-full bg-secondary p-2 text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Nueva Orden de Trabajo
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Crear una nueva instalación o servicio manualmente.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Client Info */}
                <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <User className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold text-foreground">Información del Cliente</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="clientName">Nombre Completo</Label>
                            <Input id="clientName" placeholder="Ej. Juan Perez" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="clientPhone">Teléfono</Label>
                            <Input id="clientPhone" placeholder="+52 55 1234 5678" required />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">Dirección</Label>
                            <Input id="address" placeholder="Calle, Número, Colonia" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city">Ciudad</Label>
                            <Input id="city" placeholder="Ej. Ciudad de México" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="coordinates">Coordenadas (Opcional)</Label>
                            <Input id="coordinates" placeholder="Lat, Lng" />
                        </div>
                    </div>
                </div>

                {/* Service Info */}
                <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Wifi className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold text-foreground">Detalles del Servicio</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="plan">Plan / Servicio</Label>
                            <Select required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar plan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {plans.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="template">Plantilla de Checklist</Label>
                            <Select required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar plantilla" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockChecklistTemplates.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.name} ({t.category})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="priority">Prioridad</Label>
                            <Select defaultValue="normal">
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar prioridad" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Baja</SelectItem>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="high">Alta</SelectItem>
                                    <SelectItem value="urgent">Urgente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Schedule Info */}
                <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold text-foreground">Programación</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Fecha Programada</Label>
                            <Input type="date" id="date" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="timeSlot">Horario</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar horario" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="09:00 - 11:00">09:00 - 11:00</SelectItem>
                                    <SelectItem value="11:00 - 13:00">11:00 - 13:00</SelectItem>
                                    <SelectItem value="13:00 - 15:00">13:00 - 15:00</SelectItem>
                                    <SelectItem value="15:00 - 17:00">15:00 - 17:00</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="technician">Asignar Técnico (Opcional)</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sin asignar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {installers.map(i => (
                                        <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2 mt-4">
                        <Label htmlFor="notes">Notas Adicionales</Label>
                        <Textarea
                            id="notes"
                            placeholder="Instrucciones especiales, referencias de ubicación, etc."
                            className="resize-none h-24"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={() => router.back()}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Guardando..." : "Crear Orden de Trabajo"}
                        <Save className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </form>
        </div>
    )
}
