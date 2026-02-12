"use client"

import { cn } from "@/lib/utils"
import { useNetwork } from "@/stores/network-context"
import {
    Wifi,
    WifiOff,
    AlertTriangle,
    Signal,
    Box,
    Clock,
    TrendingDown,
} from "lucide-react"

interface KpiCardProps {
    label: string
    value: string | number
    icon: React.ReactNode
    trend?: "up" | "down" | "neutral"
    trendLabel?: string
    variant?: "default" | "success" | "warning" | "danger" | "primary"
    className?: string
}

function KpiCard({
    label,
    value,
    icon,
    trend,
    trendLabel,
    variant = "default",
    className,
}: KpiCardProps) {
    const variantStyles = {
        default: "bg-secondary/30",
        success: "bg-emerald-500/10",
        warning: "bg-amber-500/10",
        danger: "bg-red-500/10",
        primary: "bg-primary/10",
    }

    const iconStyles = {
        default: "text-muted-foreground",
        success: "text-emerald-400",
        warning: "text-amber-400",
        danger: "text-red-400",
        primary: "text-primary",
    }

    return (
        <div className={cn("glass-card p-4", className)}>
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold text-foreground">{value}</p>
                    {trendLabel && (
                        <p
                            className={cn(
                                "text-xs",
                                trend === "up" && "text-emerald-400",
                                trend === "down" && "text-red-400",
                                trend === "neutral" && "text-muted-foreground"
                            )}
                        >
                            {trendLabel}
                        </p>
                    )}
                </div>
                <div
                    className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        variantStyles[variant]
                    )}
                >
                    <span className={iconStyles[variant]}>{icon}</span>
                </div>
            </div>
        </div>
    )
}

interface NetworkKpiCardsProps {
    className?: string
}

export function NetworkKpiCards({ className }: NetworkKpiCardsProps) {
    const { stats } = useNetwork()

    return (
        <div className={cn("grid grid-cols-2 gap-3 lg:grid-cols-4", className)}>
            <KpiCard
                label="ONUs en línea"
                value={stats.onlineOnus}
                icon={<Wifi className="h-5 w-5" />}
                variant="success"
                trendLabel={`${((stats.onlineOnus / stats.totalOnus) * 100).toFixed(1)}% del total`}
            />
            <KpiCard
                label="ONUs sin conexión"
                value={stats.offlineOnus}
                icon={<WifiOff className="h-5 w-5" />}
                variant={stats.offlineOnus > 0 ? "danger" : "default"}
                trendLabel={stats.offlineOnus > 0 ? "Requieren atención" : "Todo operativo"}
                trend={stats.offlineOnus > 0 ? "down" : "neutral"}
            />
            <KpiCard
                label="Alertas activas"
                value={stats.activeAlerts}
                icon={<AlertTriangle className="h-5 w-5" />}
                variant={stats.criticalAlerts > 0 ? "danger" : stats.activeAlerts > 0 ? "warning" : "default"}
                trendLabel={stats.criticalAlerts > 0 ? `${stats.criticalAlerts} críticas` : "Sin críticas"}
            />
            <KpiCard
                label="Potencia promedio"
                value={`${stats.avgRxPower} dBm`}
                icon={<Signal className="h-5 w-5" />}
                variant={stats.avgRxPower >= -25 ? "success" : stats.avgRxPower >= -27 ? "warning" : "danger"}
                trendLabel={stats.avgRxPower >= -25 ? "Excelente" : stats.avgRxPower >= -27 ? "Aceptable" : "Revisar"}
            />
        </div>
    )
}

export function NetworkKpiCardsExtended({ className }: NetworkKpiCardsProps) {
    const { stats, naps, napPorts, jobs } = useNetwork()

    const pendingJobs = jobs.filter(j => j.status === "pending").length
    const runningJobs = jobs.filter(j => j.status === "running").length

    return (
        <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6", className)}>
            <KpiCard
                label="ONUs en línea"
                value={stats.onlineOnus}
                icon={<Wifi className="h-5 w-5" />}
                variant="success"
            />
            <KpiCard
                label="ONUs sin conexión"
                value={stats.offlineOnus + stats.degradedOnus}
                icon={<WifiOff className="h-5 w-5" />}
                variant={stats.offlineOnus > 0 ? "danger" : "default"}
            />
            <KpiCard
                label="Alertas activas"
                value={stats.activeAlerts}
                icon={<AlertTriangle className="h-5 w-5" />}
                variant={stats.criticalAlerts > 0 ? "danger" : "warning"}
            />
            <KpiCard
                label="Potencia RX avg"
                value={`${stats.avgRxPower} dBm`}
                icon={<Signal className="h-5 w-5" />}
                variant="primary"
            />
            <KpiCard
                label="NAPs saturadas"
                value={stats.saturatedNaps}
                icon={<Box className="h-5 w-5" />}
                variant={stats.saturatedNaps > 0 ? "warning" : "default"}
            />
            <KpiCard
                label="Jobs pendientes"
                value={pendingJobs + runningJobs}
                icon={<Clock className="h-5 w-5" />}
                variant={runningJobs > 0 ? "primary" : "default"}
                trendLabel={runningJobs > 0 ? `${runningJobs} en progreso` : undefined}
            />
        </div>
    )
}
