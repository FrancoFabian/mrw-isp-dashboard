import { KpiStatCard } from "@/components/dashboard/kpi-stat-card"
import { NetworkStatusCard } from "@/components/dashboard/network-status-card"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { ClientsChart } from "@/components/dashboard/clients-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { NetworkOverview } from "@/components/dashboard/network-overview"
import { mockClients } from "@/mocks/clients"
import { mockPayments } from "@/mocks/payments"
import { mockTickets } from "@/mocks/tickets"
import { mockNodes } from "@/mocks/network"
import { Users, DollarSign, LifeBuoy } from "lucide-react"

const dataToPoints = (dataArray: number[]) => {
  const min = Math.min(...dataArray);
  const max = Math.max(...dataArray);
  const range = max - min || 1;
  return dataArray.map((d, i) => ({
    x: (i / (dataArray.length - 1)) * 100,
    y: ((d - min) / range) * 100,
  }));
};

const clientesData = dataToPoints([10, 15, 12, 20, 25, 22, 35, 30, 45, 58]);
const ingresosData = dataToPoints([30, 32, 28, 35, 34, 40, 38, 45, 42, 48]);
const ticketsData = dataToPoints([80, 85, 70, 60, 65, 50, 40, 45, 30, 20]);

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
        <KpiStatCard
          title="Clientes activos"
          value={<>{activeClients} <span className="text-sm font-normal text-zinc-500">/{mockClients.length}</span></>}
          deltaPct={12.5}
          subtitle="vs mes anterior"
          points={clientesData}
          tone="success"
          icon={<Users size={16} />}
        />
        <KpiStatCard
          title="Ingresos del mes"
          value={`$${totalRevenue.toLocaleString()}`}
          deltaPct={8.3}
          subtitle="vs mes anterior"
          points={ingresosData}
          tone="success"
          icon={<DollarSign size={16} />}
        />
        <KpiStatCard
          title="Tickets abiertos"
          value={openTickets.toString()}
          deltaPct={-15}
          subtitle="vs semana pasada"
          points={ticketsData}
          tone="warning"
          icon={<LifeBuoy size={16} />}
        />
        <NetworkStatusCard
          status={networkAlerts > 1 ? 'critical' : networkAlerts === 1 ? 'warning' : 'success'}
          alertsCount={networkAlerts}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 items-start xl:items-center">
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
