"use client"

import { useMemo } from "react"
import Link from "next/link"
import { mockInvoices, getInvoicesByCustomer } from "@/mocks/invoices"
import { getPromiseByInvoice } from "@/mocks/paymentPromises"
import { InvoiceStatusBadge } from "@/components/billing/InvoiceStatusBadge"
import {
    FileText,
    Calendar,
    DollarSign,
    ChevronRight,
    Download,
    CreditCard,
    Clock,
    AlertTriangle
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mock: In real app, get from auth context
const MOCK_CLIENT_ID = "CLT-001"

export default function ClientInvoicesPage() {
    const invoices = useMemo(() =>
        getInvoicesByCustomer(MOCK_CLIENT_ID).sort((a, b) =>
            new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
        ),
        [])

    const pendingInvoice = invoices.find((i) => i.status === "issued" || i.status === "overdue")
    const hasActivePromise = pendingInvoice ? !!getPromiseByInvoice(pendingInvoice.id) : false

    const formatCurrency = (amount: number) =>
        `$${amount.toLocaleString("en-US")}`

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
    }

    const totalDue = invoices
        .filter((i) => i.status === "issued" || i.status === "overdue")
        .reduce((sum, i) => sum + i.total, 0)

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    Mis Facturas
                </h1>
                <p className="text-sm text-muted-foreground">
                    Consulta y paga tus facturas de servicio
                </p>
            </div>

            {/* Summary Card */}
            {totalDue > 0 && (
                <div className={cn(
                    "glass-card p-4 border-l-4",
                    pendingInvoice?.status === "overdue" ? "border-red-500 bg-red-500/5" : "border-amber-500 bg-amber-500/5"
                )}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            {pendingInvoice?.status === "overdue" ? (
                                <AlertTriangle className="h-6 w-6 text-red-400 mt-0.5" />
                            ) : (
                                <Clock className="h-6 w-6 text-amber-400 mt-0.5" />
                            )}
                            <div>
                                <p className="font-semibold text-foreground">
                                    {pendingInvoice?.status === "overdue" ? "Tienes pagos vencidos" : "Pago pendiente"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Total por pagar: <span className="font-bold text-foreground">{formatCurrency(totalDue)}</span>
                                </p>
                                {hasActivePromise && (
                                    <p className="text-xs text-amber-400 mt-1">
                                        ✓ Promesa de pago activa
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {!hasActivePromise && pendingInvoice?.status === "overdue" && (
                                <button className="rounded-lg bg-amber-600/20 px-4 py-2 text-sm font-medium text-amber-400 hover:bg-amber-600/30 transition-colors">
                                    <Clock className="inline h-4 w-4 mr-1" />
                                    Crear Promesa
                                </button>
                            )}
                            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                                <CreditCard className="inline h-4 w-4 mr-1" />
                                Pagar Ahora
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Invoices List */}
            <div className="space-y-3">
                {invoices.map((invoice) => (
                    <Link
                        key={invoice.id}
                        href={`/dashboard/portal/invoices/${invoice.id}`}
                        className="glass-card group flex items-center justify-between p-4 transition-colors hover:bg-secondary/80"
                    >
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "flex h-12 w-12 items-center justify-center rounded-lg",
                                invoice.status === "paid" ? "bg-emerald-500/10" :
                                    invoice.status === "overdue" ? "bg-red-500/10" : "bg-blue-500/10"
                            )}>
                                <FileText className={cn(
                                    "h-6 w-6",
                                    invoice.status === "paid" ? "text-emerald-400" :
                                        invoice.status === "overdue" ? "text-red-400" : "text-blue-400"
                                )} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-foreground">
                                        Período {invoice.period}
                                    </p>
                                    <InvoiceStatusBadge status={invoice.status} />
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Vence: {formatDate(invoice.dueDate)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" />
                                        {formatCurrency(invoice.total)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={(e) => { e.preventDefault(); /* download mock */ }}
                                className="rounded-lg bg-secondary p-2 text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors"
                            >
                                <Download className="h-4 w-4" />
                            </button>
                            <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                        </div>
                    </Link>
                ))}
            </div>

            {invoices.length === 0 && (
                <div className="glass-card flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-sm text-muted-foreground">
                        No tienes facturas registradas
                    </p>
                </div>
            )}
        </div>
    )
}
