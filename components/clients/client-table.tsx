"use client"

import { cn } from "@/lib/utils"
import type { Client } from "@/types/client"
import { clientStatusLabels, clientStatusColors } from "@/types/client"
import { mockPlans } from "@/mocks/plans"
import { Eye, Pause, Play, RefreshCw } from "lucide-react"

interface ClientTableProps {
  clients: Client[]
  onSelectClient: (client: Client) => void
  selectedClientId: string | null
}

export function ClientTable({ clients, onSelectClient, selectedClientId }: ClientTableProps) {
  function getPlanName(planId: string): string {
    const plan = mockPlans.find((p) => p.id === planId)
    return plan ? plan.name : "N/A"
  }

  function getPlanPrice(planId: string): number {
    const plan = mockPlans.find((p) => p.id === planId)
    return plan ? plan.price : 0
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-border">
              <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground sm:px-4 sm:py-3">
                Cliente
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground sm:px-4 sm:py-3">
                Plan
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground sm:px-4 sm:py-3">
                Estado
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                Corte
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground sm:px-4 sm:py-3">
                Mensualidad
              </th>
              <th className="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground sm:px-4 sm:py-3">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {clients.map((client) => (
              <tr
                key={client.id}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-secondary/30",
                  selectedClientId === client.id && "bg-primary/5"
                )}
                onClick={() => onSelectClient(client)}
              >
                <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-foreground sm:h-8 sm:w-8">
                      {client.firstName[0]}
                      {client.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {client.firstName} {client.lastName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {client.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                  <span className="text-sm text-foreground">
                    {getPlanName(client.planId)}
                  </span>
                </td>
                <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium sm:px-2.5",
                      clientStatusColors[client.status]
                    )}
                  >
                    {clientStatusLabels[client.status]}
                  </span>
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {client.cutoffDate}
                  </span>
                </td>
                <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                  <span className="text-sm font-medium text-foreground">
                    ${getPlanPrice(client.planId).toLocaleString()}
                  </span>
                </td>
                <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectClient(client)
                      }}
                      className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      title="Ver detalle"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {client.status === "active" ? (
                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
                        title="Suspender servicio"
                      >
                        <Pause className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-emerald-500/10 hover:text-emerald-400"
                        title="Reactivar servicio"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="hidden rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary sm:block"
                      title="Cambiar plan"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
