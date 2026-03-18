"use client"

import React from "react"
import { mockPayments } from "@/mocks/payments"
import { mockTickets } from "@/mocks/tickets"
import { mockNodes } from "@/mocks/network"
import {
  CreditCard,
  AlertTriangle,
  LifeBuoy,
  WifiOff,
  Activity,
  ArrowDownToLine,
  AlertCircle
} from "lucide-react"

interface ActivityItem {
  id: string
  category: "issue_critical" | "issue_warning" | "payment_success" | "payment_overdue" | "ticket"
  title: string
  subtitle: string
  date: string
  amount: number | null
}

function getRecentActivity(): ActivityItem[] {
  const activities: ActivityItem[] = []

  // Pagos Recibidos
  const recentPayments = mockPayments
    .filter((p) => p.status === "paid")
    .slice(0, 3)
  for (const p of recentPayments) {
    activities.push({
      id: `payment-${p.id}`,
      category: "payment_success",
      title: `Pago recibido: ${p.clientName}`,
      subtitle: p.method,
      date: p.date,
      amount: p.amount,
    })
  }

  // Pagos Vencidos
  const overduePayments = mockPayments
    .filter((p) => p.status === "overdue")
    .slice(0, 2)
  for (const p of overduePayments) {
    activities.push({
      id: `overdue-${p.id}`,
      category: "payment_overdue",
      title: `Pago vencido: ${p.clientName}`,
      subtitle: "Requiere atención inmediata",
      date: p.dueDate,
      amount: p.amount,
    })
  }

  // Tickets
  const recentTickets = mockTickets
    .filter((t) => t.status === "open" || t.status === "in_progress")
    .slice(0, 2)
  for (const t of recentTickets) {
    activities.push({
      id: `ticket-${t.id}`,
      category: "ticket",
      title: t.subject,
      subtitle: `${t.clientName} - ${t.assignedTo}`,
      date: t.createdAt.split("T")[0],
      amount: null,
    })
  }

  // Add severe nodes directly since they fit the "issue_critical" / "warning" category from the example
  const degradedNodes = mockNodes.filter(n => n.status === "degraded" || n.status === "offline").slice(0, 2);
  for (const n of degradedNodes) {
    activities.push({
      id: `node-${n.id}`,
      category: n.status === "offline" ? "issue_critical" : "issue_warning",
      title: n.status === "offline" ? `Nodo Caído: ${n.name}` : `Red Degradada: ${n.name}`,
      subtitle: n.location || "Ubicación desconocida",
      date: new Date().toISOString().split("T")[0], // Mocking today's date for current node issues
      amount: null,
    })
  }

  // Solo mostraremos 5 para igualar mas la altura del otro componente
  return activities.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
}

const eventConfig = {
  issue_critical: {
    icon: WifiOff,
    iconColor: 'text-zinc-400',
    iconBg: 'bg-zinc-800/50',
    amountColor: '',
  },
  issue_warning: {
    icon: Activity,
    iconColor: 'text-zinc-400',
    iconBg: 'bg-zinc-800/50',
    amountColor: '',
  },
  payment_success: {
    icon: ArrowDownToLine,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-zinc-800/50',
    amountColor: 'text-emerald-400',
  },
  payment_overdue: {
    icon: AlertTriangle,
    iconColor: 'text-rose-400',
    iconBg: 'bg-zinc-800/50',
    amountColor: 'text-rose-400',
  },
  ticket: {
    icon: LifeBuoy,
    iconColor: 'text-blue-400',
    iconBg: 'bg-zinc-800/50',
    amountColor: '',
  }
};

export function RecentActivity() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    const date = new Date(dateString);
    // Para evitar deSincronización en SSR, a veces es mejor usar un string directo o tener locale es-MX hardcodeado con timezone
    return date.toLocaleDateString('es-MX', options).replace('.', '');
  };

  const recentEvents = getRecentActivity();

  return (
    <div className="w-full bg-linear-to-b from-zinc-900/90 to-black rounded-3xl border border-zinc-800/80 shadow-2xl shadow-black overflow-hidden flex flex-col h-full font-sans text-zinc-100">

      {/* Cabecera */}
      <div className="p-4 md:p-5 border-b border-zinc-800/50 relative flex-none">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Actividad reciente</h1>
            <p className="text-zinc-400 text-xs mt-1">Últimos eventos del ISP</p>
          </div>
          <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-xs font-medium rounded-full transition-colors text-zinc-300">
            <AlertCircle size={14} className="text-zinc-400" />
            Ver reporte
          </button>
        </div>
      </div>

      {/* Lista de Eventos */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-start space-y-1 overflow-y-auto">
        {recentEvents.map((event) => {
          const config = eventConfig[event.category];
          const IconComponent = config.icon;
          const isPayment = event.category.includes('payment');

          return (
            <div
              key={event.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 rounded-xl transition-colors duration-200 hover:bg-white/5 border border-transparent hover:border-white/5 gap-3 sm:gap-0"
            >
              {/* Lado Izquierdo: Icono + Detalles */}
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 ${config.iconBg}`}>
                  <IconComponent size={16} className={config.iconColor} />
                </div>

                <div className="flex flex-col">
                  <span className="font-medium text-xs sm:text-sm text-zinc-200 group-hover:text-white transition-colors">
                    {event.title}
                  </span>
                  <span className="text-[10px] sm:text-xs text-zinc-500 mt-0.5">
                    {event.subtitle}
                  </span>
                </div>
              </div>

              {/* Lado Derecho: Cantidad (si aplica) + Fecha */}
              <div className="flex items-center justify-between sm:flex-col sm:items-end sm:text-right pl-11 sm:pl-0">
                {isPayment && event.amount && (
                  <span className={`text-xs sm:text-sm md:text-[15px] font-medium tracking-tight ${config.amountColor}`}>
                    {event.category === 'payment_success' ? '+' : ''}{formatCurrency(event.amount)}
                  </span>
                )}
                {!isPayment && <span className="hidden sm:inline-block"></span>}
                <span className={`text-[10px] sm:text-xs font-mono tracking-wider ${isPayment ? 'text-zinc-500 sm:mt-1' : 'text-zinc-500'}`}>
                  {formatDate(event.date)}
                </span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
