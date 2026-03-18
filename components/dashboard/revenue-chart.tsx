"use client"

import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { monthlyRevenue } from "@/mocks/payments"

export function RevenueChart() {
  return (
    <div className="bg-linear-to-b from-[#1c1c1e] to-[#0a0a0a] border border-white/5 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col w-full font-sans text-gray-200">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight mb-1">Ingresos vs Gastos</h2>
          <p className="text-gray-400 text-xs">Ultimos 12 meses</p>
        </div>
      </div>
      <ChartContainer
        config={{
          revenue: { label: "Ingresos", color: "#3b82f6" },
          expenses: { label: "Gastos", color: "#6366f1" },
        }}
        id="revenue-chart"
        className="h-[280px] w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyRevenue} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 16%)" />
            <XAxis
              dataKey="month"
              stroke="hsl(215 15% 40%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(215 15% 40%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#revenueGrad)"
              name="Ingresos"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#expenseGrad)"
              name="Gastos"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
