"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { mockInvoices } from "@/mocks/invoices"
import type { InvoiceStatus } from "@/types/invoice"
import { InvoiceStatusBadge } from "@/components/billing/InvoiceStatusBadge"
import {
    FileText,
    Search,
    Filter,
    ChevronRight,
    Calendar,
    DollarSign,
    AlertTriangle,
    Clock,
    CheckCircle,
    Plus
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const statusFilters: { label: string; value: InvoiceStatus | "all" }[] = [
    { label: "Todas", value: "all" },
    { label: "Emitidas", value: "issued" },
    { label: "Pagadas", value: "paid" },
    { label: "Vencidas", value: "overdue" },
    { label: "Canceladas", value: "cancelled" },
]

export default function InvoicesPage() {
    const router = useRouter()
    const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all")
    const [searchQuery, setSearchQuery] = useState("")

    const filteredInvoices = useMemo(() => {
        let result = mockInvoices

        if (statusFilter !== "all") {
            result = result.filter((inv) => inv.status === statusFilter)
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(
                (inv) =>
                    inv.customerName.toLowerCase().includes(query) ||
                    inv.id.toLowerCase().includes(query) ||
                    inv.period.includes(query)
            )
        }

        return result.sort((a, b) =>
            new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
        )
    }, [statusFilter, searchQuery])

    // KPIs
    const totalIssued = mockInvoices.filter((i) => i.status === "issued").length
    const totalOverdue = mockInvoices.filter((i) => i.status === "overdue").length
    const totalPaid = mockInvoices.filter((i) => i.status === "paid").length
    const totalRevenue = mockInvoices
        .filter((i) => i.status === "paid")
        .reduce((sum, i) => sum + i.total, 0)

    const formatCurrency = (amount: number) =>
        `$${amount.toLocaleString("en-US")}`

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                        Facturas
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Gestiona las facturas internas de tus clientes
                    </p>
                </div>
                <Link
                    href="/dashboard/billing/invoices/new"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Nueva Factura
                </Link>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="glass-card flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                        <FileText className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Emitidas</p>
                        <p className="text-lg font-bold text-foreground">{totalIssued}</p>
                    </div>
                </div>
                <div className="glass-card flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Vencidas</p>
                        <p className="text-lg font-bold text-foreground">{totalOverdue}</p>
                    </div>
                </div>
                <div className="glass-card flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Pagadas</p>
                        <p className="text-lg font-bold text-foreground">{totalPaid}</p>
                    </div>
                </div>
                <div className="glass-card flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Cobrado</p>
                        <p className="text-lg font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente o factura..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border-0 bg-secondary py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto">
                    <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
                    {statusFilters.map((filter) => (
                        <button
                            key={filter.value}
                            type="button"
                            onClick={() => setStatusFilter(filter.value)}
                            className={cn(
                                "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                                statusFilter === filter.value
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                            )}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/50 text-left">
                                <th className="px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
                                    Factura
                                </th>
                                <th className="px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
                                    Cliente
                                </th>
                                <th className="px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
                                    Período
                                </th>
                                <th className="px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
                                    Monto
                                </th>
                                <th className="px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
                                    Vencimiento
                                </th>
                                <th className="px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
                                    Estado
                                </th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {filteredInvoices.map((invoice) => (
                                <tr
                                    key={invoice.id}
                                    onClick={() => router.push(`/dashboard/billing/invoices/${invoice.id}`)}
                                    className="cursor-pointer transition-colors hover:bg-secondary/50"
                                >
                                    <td className="px-4 py-3">
                                        <span className="font-mono text-sm text-foreground">
                                            {invoice.id}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-foreground">
                                            {invoice.customerName}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {invoice.period}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-medium text-foreground">
                                            {formatCurrency(invoice.total)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-muted-foreground">
                                            {formatDate(invoice.dueDate)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <InvoiceStatusBadge status={invoice.status} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredInvoices.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground/50" />
                        <p className="mt-4 text-sm text-muted-foreground">
                            No se encontraron facturas
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
