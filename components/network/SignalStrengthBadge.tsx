"use client"

import { cn } from "@/lib/utils"
import { getSignalQuality, signalThresholds } from "@/types/network"
import { Signal, SignalLow, SignalZero } from "lucide-react"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface SignalStrengthBadgeProps {
    rxPowerDbm: number | null
    txPowerDbm?: number | null
    showTx?: boolean
    size?: "sm" | "md"
    className?: string
}

export function SignalStrengthBadge({
    rxPowerDbm,
    txPowerDbm,
    showTx = false,
    size = "md",
    className,
}: SignalStrengthBadgeProps) {
    const quality = getSignalQuality(rxPowerDbm)

    const qualityColors = {
        good: "text-emerald-400",
        warning: "text-amber-400",
        critical: "text-red-400",
        unknown: "text-gray-400",
    }

    const qualityLabels = {
        good: "Excelente",
        warning: "Aceptable",
        critical: "Crítica",
        unknown: "Sin datos",
    }

    const qualityBgColors = {
        good: "bg-emerald-500/10",
        warning: "bg-amber-500/10",
        critical: "bg-red-500/10",
        unknown: "bg-gray-500/10",
    }

    const SignalIcon = quality === "critical" ? SignalZero : quality === "warning" ? SignalLow : Signal

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div
                        className={cn(
                            "inline-flex items-center gap-1.5 rounded-lg px-2 py-1",
                            qualityBgColors[quality],
                            className
                        )}
                    >
                        <SignalIcon className={cn("h-4 w-4", qualityColors[quality])} />
                        <span
                            className={cn(
                                "font-mono font-medium",
                                qualityColors[quality],
                                size === "sm" ? "text-xs" : "text-sm"
                            )}
                        >
                            {rxPowerDbm !== null ? `${rxPowerDbm.toFixed(1)} dBm` : "N/A"}
                        </span>
                    </div>
                </TooltipTrigger>
                <TooltipContent className="bg-card border-border">
                    <div className="space-y-1 text-sm">
                        <div className="font-medium">Potencia óptica</div>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">RX:</span>
                            <span className={qualityColors[quality]}>
                                {rxPowerDbm !== null ? `${rxPowerDbm.toFixed(2)} dBm` : "N/A"}
                            </span>
                        </div>
                        {showTx && (
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-muted-foreground">TX:</span>
                                <span className="text-foreground">
                                    {txPowerDbm !== null ? `${txPowerDbm.toFixed(2)} dBm` : "N/A"}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center justify-between gap-4 pt-1 border-t border-border">
                            <span className="text-muted-foreground">Calidad:</span>
                            <span className={qualityColors[quality]}>{qualityLabels[quality]}</span>
                        </div>
                        <div className="text-xs text-muted-foreground pt-1">
                            Umbral: {">"} {signalThresholds.rx.good} dBm (bueno)
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
