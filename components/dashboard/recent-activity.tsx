import React from "react"
import { mockPayments } from "@/mocks/payments"
import { mockTickets } from "@/mocks/tickets"
import { CreditCard, AlertTriangle, CheckCircle, LifeBuoy } from "lucide-react"

interface ActivityItem {
  id: string
  icon: React.ReactNode
  iconBg: string
  title: string
  description: string
  time: string
}

function getRecentActivity(): ActivityItem[] {
  const activities: ActivityItem[] = []

  const recentPayments = mockPayments
    .filter((p) => p.status === "paid")
    .slice(0, 3)
  for (const p of recentPayments) {
    activities.push({
      id: p.id,
      icon: <CreditCard className="h-4 w-4" />,
      iconBg: "bg-emerald-500/10 text-emerald-400",
      title: `Pago recibido de ${p.clientName}`,
      description: `$${p.amount.toLocaleString()} MXN - ${p.method}`,
      time: p.date,
    })
  }

  const overduePayments = mockPayments
    .filter((p) => p.status === "overdue")
    .slice(0, 2)
  for (const p of overduePayments) {
    activities.push({
      id: `${p.id}-overdue`,
      icon: <AlertTriangle className="h-4 w-4" />,
      iconBg: "bg-red-500/10 text-red-400",
      title: `Pago vencido: ${p.clientName}`,
      description: `$${p.amount.toLocaleString()} MXN pendiente`,
      time: p.dueDate,
    })
  }

  const recentTickets = mockTickets
    .filter((t) => t.status === "open" || t.status === "in_progress")
    .slice(0, 2)
  for (const t of recentTickets) {
    activities.push({
      id: t.id,
      icon: <LifeBuoy className="h-4 w-4" />,
      iconBg: "bg-blue-500/10 text-blue-400",
      title: t.subject,
      description: `${t.clientName} - ${t.assignedTo}`,
      time: t.createdAt.split("T")[0],
    })
  }

  return activities.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 6)
}

export function RecentActivity() {
  const activities = getRecentActivity()

  return (
    <div className="glass-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Actividad reciente</h3>
        <p className="text-xs text-muted-foreground">Ultimos eventos del ISP</p>
      </div>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-secondary/50"
          >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${activity.iconBg}`}>
              {activity.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
              <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
