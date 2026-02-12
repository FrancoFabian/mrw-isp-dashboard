"use client"

import { useState, useMemo } from "react"
import { mockPayments } from "@/mocks/payments"
import { mockInvoices } from "@/mocks/invoices"
import type { PaymentSource } from "@/types/payment"
import { PaymentSourceBadge } from "@/components/billing/PaymentSourceBadge"
import {
    Search,
    Filter,
    CreditCard,
    DollarSign,
    CheckCircle,
    Clock,
    Link as LinkIcon,
    Banknote,
    Building,
    User
} from "lucide-react"
import { cn } from "@/lib/utils"

const sourceFilters: { label: string; value: PaymentSource | "all" }[] = [
    { label: "Todos", value: "all" },
    { label: "Cliente", value: "client" },
    { label: "Cobrador", value: "collector" },
    { label: "Admin", value: "admin" },
]

const reconciledFilters = [
    { label: "Todos", value: "all" },
    { label: "Conciliados", value: "true" },
    { label: "Pendientes", value: "false" },
]

export default function PaymentsPage() {
    const [sourceFilter, setSourceFilter] = useState<PaymentSource | "all">("all")
    const [reconciledFilter, setReconciledFilter] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")

    const paidPayments = mockPayments.filter((p) => p.status === "paid")

    const filteredPayments = useMemo(() => {
        let result = paidPayments

        if (sourceFilter !== "all") {
            result = result.filter((p) => p.source === sourceFilter)
        }

        if (reconciledFilter !== "all") {
            const isReconciled = reconciledFilter === "true"
            result = result.filter((p) => p.reconciled === isReconciled)
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(
                (p) =>
                    p.clientName.toLowerCase().includes(query) ||
                    p.reference.toLowerCase().includes(query) ||
                    p.id.toLowerCase().includes(query)
            )
        }

        return result.sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        )
    }, [sourceFilter, reconciledFilter, searchQuery, paidPayments])

    // KPIs
    const totalPayments = paidPayments.length
    const totalReconciled = paidPayments.filter((p) => p.reconciled).length
    const totalPending = paidPayments.filter((p) => !p.reconciled).length
    const totalAmount = paidPayments.reduce((sum, p) => sum + p.amount, 0)

    const formatCurrency = (amount: number) =>
        `$${amount.toLocaleString("en-US")}`

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "-"
        const date = new Date(dateStr)
        return date.toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        })
    }

    const getInvoiceForPayment = (invoiceId?: string) => {
        if (!invoiceId) return null
        return mockInvoices.find((inv) => inv.id === invoiceId)
    }

    const getMethodIcon = (method: string) => {
        const m = method.toLowerCase()
        if (m.includes("tarjeta") || m.includes("card")) return CreditCard
        if (m.includes("transfer")) return Building
        if (m.includes("efectivo") || m.includes("cash")) return Banknote
        if (m.includes("oxxo")) return Building
        return DollarSign
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    Pagos y Conciliación
                </h1>
                <p className="text-sm text-muted-foreground">
                    Gestiona y concilia los pagos recibidos con las facturas
                </p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="glass-card flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Total Pagos</p>
                        <p className="text-lg font-bold text-foreground">{totalPayments}</p>
                    </div>
                </div>
                <div className="glass-card flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Conciliados</p>
                        <p className="text-lg font-bold text-foreground">{totalReconciled}</p>
                    </div>
                </div>
                <div className="glass-card flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                        <Clock className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Pendientes</p>
                        <p className="text-lg font-bold text-foreground">{totalPending}</p>
                    </div>
                </div>
                <div className="glass-card flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                        <DollarSign className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Monto Total</p>
                        <p className="text-lg font-bold text-foreground">{formatCurrency(totalAmount)}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente o referencia..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border-0 bg-secondary py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Origen:</span>
                        {sourceFilters.map((filter) => (
                            <button
                                key={filter.value}
                                type="button"
                                onClick={() => setSourceFilter(filter.value)}
                                className={cn(
                                    "shrink-0 rounded-lg px-2 py-1 text-xs font-medium transition-colors",
                                    sourceFilter === filter.value
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                                )}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Estado:</span>
                        {reconciledFilters.map((filter) => (
                            <button
                                key={filter.value}
                                type="button"
                                onClick={() => setReconciledFilter(filter.value)}
                                className={cn(
                                    "shrink-0 rounded-lg px-2 py-1 text-xs font-medium transition-colors",
                                    reconciledFilter === filter.value
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                                )}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/50 text-left">
                                <th className="px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
                                    Referencia
                                </th>
                                <th className="px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
                                    Cliente
                                </th>
                                <th className="px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
                                    Monto
                                </th>
                                <th className="px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
                                    Método
                                </th>
                                <th className="px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
                                    Origen
                                </th>
                                <th className="px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
                                    Fecha
                                </th>
                                <th className="px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
                                    Factura
                                </th>
                                <th className="px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
                                    Acción
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {filteredPayments.map((payment) => {
                                const invoice = getInvoiceForPayment(payment.invoiceId)
                                const MethodIcon = getMethodIcon(payment.method)

                                return (
                                    <tr
                                        key={payment.id}
                                        className="transition-colors hover:bg-secondary/50"
                                    >
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-xs text-foreground">
                                                {payment.reference || payment.id}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm text-foreground">
                                                    {payment.clientName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-medium text-foreground">
                                                {formatCurrency(payment.amount)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                <MethodIcon className="h-4 w-4" />
                                                {payment.method}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <PaymentSourceBadge source={payment.source} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-muted-foreground">
                                                {formatDate(payment.date)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {invoice ? (
                                                <a
                                                    href={`/dashboard/billing/invoices/${invoice.id}`}
                                                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                                                >
                                                    <LinkIcon className="h-3 w-3" />
                                                    {invoice.id}
                                                </a>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {payment.reconciled ? (
                                                <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                                                    <CheckCircle className="h-3 w-3" />
                                                    Conciliado
                                                </span>
                                            ) : (
                                                <button className="rounded bg-primary/20 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/30 transition-colors">
                                                    Conciliar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredPayments.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <CreditCard className="h-12 w-12 text-muted-foreground/50" />
                        <p className="mt-4 text-sm text-muted-foreground">
                            No se encontraron pagos
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
