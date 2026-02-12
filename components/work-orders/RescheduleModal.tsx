"use client"

import { useState } from "react"
import type { WorkOrderExtended } from "@/types/workOrder"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface RescheduleModalProps {
    isOpen: boolean
    onClose: () => void
    onReschedule: (date: Date, timeSlot: string) => void
    currentDate?: string
    currentTimeSlot?: string
}

const timeSlots = [
    "08:00 - 10:00",
    "09:00 - 11:00",
    "10:00 - 12:00",
    "11:00 - 13:00",
    "12:00 - 14:00",
    "13:00 - 15:00",
    "14:00 - 16:00",
    "15:00 - 17:00",
    "16:00 - 18:00",
]

export function RescheduleModal({
    isOpen,
    onClose,
    onReschedule,
    currentDate,
    currentTimeSlot,
}: RescheduleModalProps) {
    const [date, setDate] = useState<Date | undefined>(
        currentDate ? new Date(currentDate) : undefined
    )
    const [timeSlot, setTimeSlot] = useState<string>(currentTimeSlot || "")

    const handleReschedule = () => {
        if (date && timeSlot) {
            onReschedule(date, timeSlot)
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Reprogramar Cita</DialogTitle>
                    <DialogDescription>
                        Selecciona la nueva fecha y hora para la instalación.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Fecha</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? (
                                        format(date, "PPP", { locale: es })
                                    ) : (
                                        <span>Seleccionar fecha</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Horario</label>
                        <Select value={timeSlot} onValueChange={setTimeSlot}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar horario" />
                            </SelectTrigger>
                            <SelectContent>
                                {timeSlots.map((slot) => (
                                    <SelectItem key={slot} value={slot}>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            {slot}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button onClick={handleReschedule} disabled={!date || !timeSlot}>
                        Guardar Cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
