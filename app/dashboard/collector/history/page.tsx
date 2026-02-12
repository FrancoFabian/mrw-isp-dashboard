"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { mockCashPayments } from "@/mocks/collectors"
import {
  Banknote,
  Search,
  Calendar,
  MapPin,
  Receipt,
} from "lucide-react"

export default function CollectorHistoryPage() {
  const [filter, setFilter] = useState("")

  const filtered = mockCashPayments.filter(
    (p) =>
      p.clientName.toLowerCase().includes(filter.toLowerCase()) ||
      p.reference.toLowerCase().includes(filter.toLowerCase())
  )

  const total = filtered.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Historial de cobros
        </h1>
        <p className="text-sm text-muted-foreground">
          Todos los pagos en efectivo registrados
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total registros</p>
              <p className="text-lg font-bold text-foreground">
                {filtered.length}
              </p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
              <Banknote className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total cobrado</p>
              <p className="text-lg font-bold text-foreground">
                ${total.toLocaleString()} MXN
              </p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
              <Calendar className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Periodo</p>
              <p className="text-lg font-bold text-foreground">Feb 2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nombre o referencia..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-10 w-full rounded-lg border border-input bg-secondary pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground sm:px-5">
                  Referencia
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground sm:px-5">
                  Cliente
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell sm:px-5">
                  Direccion
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground sm:px-5">
                  Monto
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell sm:px-5">
                  Fecha y hora
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((payment) => {
                const dt = new Date(payment.collectedAt)
                return (
                  <tr
                    key={payment.id}
                    className="transition-colors hover:bg-secondary/20"
                  >
                    <td className="whitespace-nowrap px-4 py-3 sm:px-5">
                      <span className="text-xs font-mono text-muted-foreground">
                        {payment.reference}
                      </span>
                    </td>
                    <td className="px-4 py-3 sm:px-5">
                      <p className="text-sm font-medium text-foreground">
                        {payment.clientName}
                      </p>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell sm:px-5">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {payment.clientAddress}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 sm:px-5">
                      <span className="text-sm font-semibold text-emerald-400">
                        ${payment.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 sm:table-cell sm:px-5">
                      <span className="text-sm text-muted-foreground">
                        {dt.toLocaleDateString("es-MX", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        {dt.toLocaleTimeString("es-MX", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
