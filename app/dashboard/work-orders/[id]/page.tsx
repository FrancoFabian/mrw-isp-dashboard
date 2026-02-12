"use client"

import { use } from "react"
import { useState } from "react"
import { mockWorkOrders } from "@/mocks/workOrders"
import { WorkOrderDetailPanel } from "@/components/work-orders/WorkOrderDetailPanel"
import { AssignTechnicianModal } from "@/components/work-orders/AssignTechnicianModal"
import { RescheduleModal } from "@/components/work-orders/RescheduleModal"
import { ArrowLeft, Edit, Calendar, UserPlus } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { toast } from "sonner" // Assuming sonner is used, or console log if not

interface PageProps {
    params: Promise<{ id: string }>
}

export default function WorkOrderDetailPage({ params }: PageProps) {
    const { id } = use(params)
    // In a real app, this would be a state or fetched data
    const workOrder = mockWorkOrders.find((w) => w.id === id)

    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)

    if (!workOrder) {
        notFound()
    }

    const handleAssignTechnician = (technicianId: string) => {
        console.log(`Assigning technician ${technicianId} to order ${id}`)
        // In a real app: await updateWorkOrder({ assignedTechnicianId: technicianId })
        // toast.success("Técnico asignado correctamente")
        setIsAssignModalOpen(false)
    }

    const handleReschedule = (date: Date, timeSlot: string) => {
        console.log(`Rescheduling order ${id} to ${date} at ${timeSlot}`)
        // In a real app: await updateWorkOrder({ date, timeSlot })
        // toast.success("Orden reprogramada correctamente")
        setIsRescheduleModalOpen(false)
    }

    return (
        <div className="space-y-6">
            {/* Nav & Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Link
                    href="/dashboard/work-orders"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a órdenes
                </Link>

                <div className="flex gap-2">
                    <button
                        onClick={() => setIsAssignModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors"
                    >
                        <UserPlus className="h-4 w-4" />
                        Reasignar
                    </button>
                    <button
                        onClick={() => setIsRescheduleModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors"
                    >
                        <Calendar className="h-4 w-4" />
                        Reprogramar
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                        <Edit className="h-4 w-4" />
                        Editar
                    </button>
                </div>
            </div>

            <WorkOrderDetailPanel workOrder={workOrder} />

            <AssignTechnicianModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                onAssign={handleAssignTechnician}
                currentTechnicianId={workOrder.assignedTechnicianId}
                workOrderZone={workOrder.city} // Just using city as zone proxy for now
            />

            <RescheduleModal
                isOpen={isRescheduleModalOpen}
                onClose={() => setIsRescheduleModalOpen(false)}
                onReschedule={handleReschedule}
                currentDate={workOrder.date}
                currentTimeSlot={workOrder.timeSlot}
            />
        </div>
    )
}
