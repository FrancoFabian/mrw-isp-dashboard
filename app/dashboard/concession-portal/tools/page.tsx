"use client"

import React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { mockTools } from "@/mocks/tools"
import {
  toolPlatformLabels,
  toolStatusLabels,
  toolStatusColors,
  type Tool,
} from "@/types/tool"
import {
  Zap,
  Activity,
  Radio,
  Package,
  Smartphone,
  Globe,
  ExternalLink,
  ArrowRight,
  X,
  Wrench,
} from "lucide-react"

const toolIcons: Record<string, React.ReactNode> = {
  zap: <Zap className="h-6 w-6" />,
  activity: <Activity className="h-6 w-6" />,
  radio: <Radio className="h-6 w-6" />,
  package: <Package className="h-6 w-6" />,
}

const platformIcons: Record<string, React.ReactNode> = {
  ANDROID: <Smartphone className="h-4 w-4" />,
  WEB: <Globe className="h-4 w-4" />,
}

export default function ConcessionToolsPage() {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)

  const available = mockTools.filter((t) => t.status === "available")
  const comingSoon = mockTools.filter((t) => t.status === "coming_soon")

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Herramientas
        </h1>
        <p className="text-sm text-muted-foreground">
          Utilidades para la gestion de tu infraestructura de red
        </p>
      </div>

      {/* Info banner */}
      <div className="glass-card border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <Wrench className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Nuevas herramientas en desarrollo
            </p>
            <p className="text-xs text-muted-foreground">
              Estamos construyendo mas herramientas para facilitar la operacion
              de tu red. Algunas estan disponibles como apps descargables o como
              aplicacion web.
            </p>
          </div>
        </div>
      </div>

      {/* Available tools */}
      {available.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">
            Disponibles
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {available.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => setSelectedTool(tool)}
                className="glass-card-hover space-y-4 p-5 text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {toolIcons[tool.icon] || <Wrench className="h-6 w-6" />}
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      toolStatusColors[tool.status]
                    )}
                  >
                    {toolStatusLabels[tool.status]}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {tool.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {tool.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {tool.platforms.map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-medium text-muted-foreground"
                    >
                      {platformIcons[p]}
                      {toolPlatformLabels[p]}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
                  Ver mas
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Coming soon */}
      {comingSoon.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">
            Proximamente
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {comingSoon.map((tool) => (
              <div key={tool.id} className="glass-card space-y-3 p-5 opacity-70">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                    {toolIcons[tool.icon] || <Wrench className="h-5 w-5" />}
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      toolStatusColors[tool.status]
                    )}
                  >
                    {toolStatusLabels[tool.status]}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {tool.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {tool.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {tool.platforms.map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs text-muted-foreground"
                    >
                      {platformIcons[p]}
                      {toolPlatformLabels[p]}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tool detail modal */}
      {selectedTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg space-y-5 rounded-xl border border-border bg-card p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {toolIcons[selectedTool.icon] || (
                    <Wrench className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {selectedTool.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedTool.category}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTool(null)}
                className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground">
              {selectedTool.longDescription}
            </p>

            <div className="space-y-2">
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Disponible en
              </h4>
              <div className="space-y-2">
                {selectedTool.platforms.includes("ANDROID") && (
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg bg-secondary/50 px-4 py-3 transition-colors hover:bg-secondary"
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-emerald-400" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">
                          App Android
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Descarga para dispositivos Android
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
                {selectedTool.platforms.includes("WEB") && (
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg bg-secondary/50 px-4 py-3 transition-colors hover:bg-secondary"
                  >
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-primary" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">
                          Version Web (PWA)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Abrir en el navegador
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedTool(null)}
              className="w-full rounded-lg bg-secondary px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
