import { MetricCard } from "@/components/dashboard/metric-card"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { ClientsChart } from "@/components/dashboard/clients-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { NetworkOverview } from "@/components/dashboard/network-overview"
import { mockClients } from "@/mocks/clients"
import { mockPayments } from "@/mocks/payments"
import { mockTickets } from "@/mocks/tickets"
import { mockNodes } from "@/mocks/network"
import { Users, DollarSign, LifeBuoy, Wifi } from "lucide-react"

export default function DashboardPage() {
  const activeClients = mockClients.filter((c) => c.status === "active").length
  const suspendedClients = mockClients.filter((c) => c.status === "suspended").length
  const totalRevenue = mockPayments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0)
  const openTickets = mockTickets.filter(
    (t) => t.status === "open" || t.status === "in_progress"
  ).length
  const networkAlerts =
    mockNodes.filter((n) => n.status === "offline" || n.status === "degraded").length

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-balance text-foreground sm:text-2xl">
          Buenos dias, Administrador
        </h1>
        <p className="text-sm text-muted-foreground">
          Resumen general de tu red y clientes
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <MetricCard
          title="Clientes activos"
          value={`${activeClients}/${mockClients.length}`}
          change={12.5}
          changeLabel="vs mes anterior"
          icon={<Users className="h-5 w-5" />}
          iconColor="bg-primary/10 text-primary"
        />
        <MetricCard
          title="Ingresos del mes"
          value={`$${totalRevenue.toLocaleString()}`}
          change={8.3}
          changeLabel="vs mes anterior"
          icon={<DollarSign className="h-5 w-5" />}
          iconColor="bg-emerald-500/10 text-emerald-400"
        />
        <MetricCard
          title="Tickets abiertos"
          value={openTickets.toString()}
          change={-15}
          changeLabel="vs semana pasada"
          icon={<LifeBuoy className="h-5 w-5" />}
          iconColor="bg-amber-500/10 text-amber-400"
        />
        <MetricCard
          title="Estado de red"
          value={networkAlerts > 0 ? `${networkAlerts} Alertas` : "Todo bien"}
          icon={<Wifi className="h-5 w-5" />}
          iconColor={
            networkAlerts > 0
              ? "bg-red-500/10 text-red-400"
              : "bg-emerald-500/10 text-emerald-400"
          }
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RevenueChart />
        </div>
        <ClientsChart />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <RecentActivity />
        <NetworkOverview />
      </div>
    </div>
  )
}
