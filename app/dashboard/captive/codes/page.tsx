"use client"

import { cn } from "@/lib/utils"
import { mockCaptiveCodes } from "@/mocks/captiveAccess"
import {
  captiveCodeStatusLabels,
  captiveCodeStatusColors,
  captiveUserTypeLabels,
} from "@/types/captive"
import { Ticket, Clock, CheckCircle, XCircle } from "lucide-react"

export default function CaptiveCodesPage() {
  const active = mockCaptiveCodes.filter((c) => c.status === "active")
  const used = mockCaptiveCodes.filter((c) => c.status === "used")
  const expired = mockCaptiveCodes.filter((c) => c.status === "expired")

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Mis codigos
        </h1>
        <p className="text-sm text-muted-foreground">
          Historial de codigos de acceso adquiridos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{active.length}</p>
          <p className="text-xs text-muted-foreground">Activos</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-muted-foreground">
            {used.length}
          </p>
          <p className="text-xs text-muted-foreground">Usados</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{expired.length}</p>
          <p className="text-xs text-muted-foreground">Expirados</p>
        </div>
      </div>

      {/* Active codes */}
      {active.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">
            Codigos activos
          </h2>
          <div className="space-y-2">
            {active.map((code) => (
              <div
                key={code.id}
                className="glass-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-mono text-sm font-medium text-foreground">
                      {code.code}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {code.duration}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          captiveCodeStatusColors[code.status]
                        )}
                      >
                        {captiveCodeStatusLabels[code.status]}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm font-bold text-foreground">
                  {code.price === 0 ? "Gratis" : `$${code.price} MXN`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All codes history */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          Historial completo
        </h2>
        <div className="glass-card overflow-hidden">
          <div className="hidden sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Codigo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Duracion
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Precio
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockCaptiveCodes.map((code) => (
                  <tr
                    key={code.id}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="px-4 py-3 font-mono text-sm text-foreground">
                      {code.code}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {code.duration}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(code.soldAt).toLocaleDateString("es-MX")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                          captiveCodeStatusColors[code.status]
                        )}
                      >
                        {captiveCodeStatusLabels[code.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                      {code.discountedPrice !== undefined
                        ? code.discountedPrice === 0
                          ? "Gratis"
                          : `$${code.discountedPrice}`
                        : `$${code.price}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile */}
          <div className="space-y-px sm:hidden">
            {mockCaptiveCodes.map((code) => (
              <div
                key={code.id}
                className="flex items-center justify-between border-b border-border/50 px-4 py-3 last:border-0"
              >
                <div>
                  <p className="font-mono text-sm font-medium text-foreground">
                    {code.code}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {code.duration} --{" "}
                    {new Date(code.soldAt).toLocaleDateString("es-MX")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      captiveCodeStatusColors[code.status]
                    )}
                  >
                    {captiveCodeStatusLabels[code.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
