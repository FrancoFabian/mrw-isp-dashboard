"use client"

import React from "react"

import { cn } from "@/lib/utils"
import type { NetworkNode } from "@/types/network"
import {
  nodeStatusLabels,
  nodeStatusColors,
  nodeStatusDotColors,
  nodeTypeLabels,
} from "@/types/network"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Router, Radio, ArrowRightLeft, Wifi, Users, Clock, Signal, MapPin } from "lucide-react"

const nodeTypeIcons: Record<string, React.ReactNode> = {
  router: <Router className="h-5 w-5" />,
  antenna: <Radio className="h-5 w-5" />,
  switch: <ArrowRightLeft className="h-5 w-5" />,
  ap: <Wifi className="h-5 w-5" />,
}

interface NodeCardProps {
  node: NetworkNode
}

export function NodeCard({ node }: NodeCardProps) {
  return (
    <TooltipProvider>
      <div className={cn("glass-card-hover p-4 space-y-3", node.status === "offline" && "opacity-70")}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                node.status === "online" && "bg-emerald-500/10 text-emerald-400",
                node.status === "degraded" && "bg-amber-500/10 text-amber-400",
                node.status === "offline" && "bg-red-500/10 text-red-400"
              )}
            >
              {nodeTypeIcons[node.type]}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{node.name}</h3>
              <p className="text-xs text-muted-foreground">{nodeTypeLabels[node.type]}</p>
            </div>
          </div>
          <Tooltip>
            <TooltipTrigger>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                  nodeStatusColors[node.status]
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", nodeStatusDotColors[node.status])} />
                {nodeStatusLabels[node.status]}
              </span>
            </TooltipTrigger>
            <TooltipContent className="bg-card text-card-foreground border-border">
              {node.status === "online" && "Este equipo funciona correctamente."}
              {node.status === "degraded" && "Hay problemas de rendimiento. La conexion puede ser lenta para los clientes."}
              {node.status === "offline" && "Este equipo esta desconectado. Los clientes conectados no tienen servicio."}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{node.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{node.clients} clientes</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Uptime: {node.uptime}</span>
          </div>
          {node.signal !== undefined && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Signal className="h-3 w-3" />
              <span>Senal: {node.signal}%</span>
            </div>
          )}
        </div>

        {/* Signal bar (for antennas) */}
        {node.signal !== undefined && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Calidad de senal</span>
              <span
                className={cn(
                  "font-medium",
                  node.signal >= 70 && "text-emerald-400",
                  node.signal >= 40 && node.signal < 70 && "text-amber-400",
                  node.signal < 40 && "text-red-400"
                )}
              >
                {node.signal}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  node.signal >= 70 && "bg-emerald-400",
                  node.signal >= 40 && node.signal < 70 && "bg-amber-400",
                  node.signal < 40 && "bg-red-400"
                )}
                style={{ width: `${node.signal}%` }}
              />
            </div>
          </div>
        )}

        {/* IP */}
        <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-1.5">
          <span className="text-xs text-muted-foreground">IP</span>
          <span className="text-xs font-mono text-foreground">{node.ip}</span>
        </div>
      </div>
    </TooltipProvider>
  )
}
