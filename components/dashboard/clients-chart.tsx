"use client"

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { mockClients } from "@/mocks/clients"

const statusData = [
  {
    name: "Activos",
    value: mockClients.filter((c) => c.status === "active").length,
    color: "#22c55e",
  },
  {
    name: "Suspendidos",
    value: mockClients.filter((c) => c.status === "suspended").length,
    color: "#ef4444",
  },
  {
    name: "En riesgo",
    value: mockClients.filter((c) => c.status === "at_risk").length,
    color: "#f59e0b",
  },
]

const total = statusData.reduce((acc, d) => acc + d.value, 0)

export function ClientsChart() {
  return (
    <div className="glass-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Estado de clientes</h3>
        <p className="text-xs text-muted-foreground">Distribucion actual</p>
      </div>
      <div className="flex items-center gap-6">
        <ChartContainer
          config={{
            activos: { label: "Activos", color: "#22c55e" },
            suspendidos: { label: "Suspendidos", color: "#ef4444" },
            en_riesgo: { label: "En riesgo", color: "#f59e0b" },
          }}
          id="clients-chart"
          className="h-[180px] w-[180px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="flex-1 space-y-3">
          {statusData.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-muted-foreground">{entry.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{entry.value}</span>
                <span className="text-xs text-muted-foreground">
                  ({Math.round((entry.value / total) * 100)}%)
                </span>
              </div>
            </div>
          ))}
          <div className="border-t border-border pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-sm font-bold text-foreground">{total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
