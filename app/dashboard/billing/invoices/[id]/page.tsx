"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { mockInvoices } from "@/mocks/invoices"
import { mockPayments } from "@/mocks/payments"
import { getPromiseByInvoice } from "@/mocks/paymentPromises"
import { InvoiceStatusBadge } from "@/components/billing/InvoiceStatusBadge"
import { PaymentSourceBadge } from "@/components/billing/PaymentSourceBadge"
import {
    ArrowLeft,
    FileText,
    Calendar,
    User,
    DollarSign,
    CreditCard,
    Clock,
    CheckCircle,
    Send,
    XCircle,
    Download,
    AlertTriangle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PageProps {
    params: Promise<{ id: string }>
}

export default function InvoiceDetailPage({ params }: PageProps) {
    const { id } = use(params)
    const invoice = mockInvoices.find((inv) => inv.id === id)

    if (!invoice) {
        notFound()
    }

    // Get related payments
    const relatedPayments = mockPayments.filter((p) => p.invoiceId === invoice.id)

    // Get active promise if any
    const activePromise = getPromiseByInvoice(invoice.id)

    const formatCurrency = (amount: number) =>
        `$${amount.toLocaleString("en-US")}`

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        })
    }

    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/billing/invoices"
                        className="rounded-full bg-secondary p-2 text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                                {invoice.id}
                            </h1>
                            <InvoiceStatusBadge status={invoice.status} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {invoice.customerName} • Período {invoice.period}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors">
                        <Download className="h-4 w-4" />
                        PDF
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors">
                        <Send className="h-4 w-4" />
                        Reenviar
                    </button>
                    {invoice.status === "issued" && (
                        <button className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors">
                            <CheckCircle className="h-4 w-4" />
                            Marcar Pagada
                        </button>
                    )}
                    {invoice.status !== "cancelled" && invoice.status !== "paid" && (
                        <button className="inline-flex items-center gap-2 rounded-lg bg-red-600/20 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-600/30 transition-colors">
                            <XCircle className="h-4 w-4" />
                            Cancelar
                        </button>
                    )}
                </div>
            </div>

            {/* Promise Warning */}
            {activePromise && (
                <div className="glass-card border-l-4 border-amber-500 bg-amber-500/5 p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
                        <div>
                            <p className="font-medium text-amber-400">Promesa de Pago Activa</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                El cliente prometió pagar antes del {formatDate(activePromise.promisedUntil)}
                            </p>
                            {activePromise.note && (
                                <p className="text-sm text-muted-foreground mt-1 italic">
                                    "{activePromise.note}"
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Invoice Items */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Detalle de la Factura
                        </h2>

                        <div className="space-y-3">
                            {invoice.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{item.description}</p>
                                        <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
                                    </div>
                                    <p className={cn(
                                        "font-medium",
                                        item.amount < 0 ? "text-emerald-400" : "text-foreground"
                                    )}>
                                        {item.amount < 0 ? "-" : ""}{formatCurrency(Math.abs(item.amount))}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-border/50">
                            <div className="flex justify-between text-sm text-muted-foreground mb-2">
                                <span>Subtotal</span>
                                <span>{formatCurrency(invoice.subtotal)}</span>
                            </div>
                            {invoice.tax && (
                                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                                    <span>IVA</span>
                                    <span>{formatCurrency(invoice.tax)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold text-foreground">
                                <span>Total</span>
                                <span className="text-primary">{formatCurrency(invoice.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payments */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-primary" />
                            Pagos Asociados
                        </h2>

                        {relatedPayments.length > 0 ? (
                            <div className="space-y-3">
                                {relatedPayments.map((payment) => (
                                    <div
                                        key={payment.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                                                <CheckCircle className="h-5 w-5 text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">
                                                    {formatCurrency(payment.amount)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {payment.method} • {payment.reference}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <PaymentSourceBadge source={payment.source} />
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatDateTime(payment.date)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <CreditCard className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                                <p className="text-sm text-muted-foreground mt-2">
                                    No hay pagos registrados para esta factura
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Invoice Info */}
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                            Información
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Cliente</p>
                                    <p className="text-sm font-medium text-foreground">{invoice.customerName}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Fecha Emisión</p>
                                    <p className="text-sm font-medium text-foreground">{formatDate(invoice.issuedAt)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Fecha Vencimiento</p>
                                    <p className={cn(
                                        "text-sm font-medium",
                                        invoice.status === "overdue" ? "text-red-400" : "text-foreground"
                                    )}>
                                        {formatDate(invoice.dueDate)}
                                    </p>
                                </div>
                            </div>

                            {invoice.paidAt && (
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Fecha Pago</p>
                                        <p className="text-sm font-medium text-emerald-400">{formatDate(invoice.paidAt)}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Total</p>
                                    <p className="text-lg font-bold text-primary">{formatCurrency(invoice.total)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {invoice.notes && (
                        <div className="glass-card p-6">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Notas
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {invoice.notes}
                            </p>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                            Acciones Rápidas
                        </h3>
                        <div className="space-y-2">
                            <Link
                                href={`/dashboard/clients/${invoice.customerId}`}
                                className="flex items-center gap-2 w-full rounded-lg bg-secondary px-3 py-2 text-sm text-foreground hover:bg-secondary/80 transition-colors"
                            >
                                <User className="h-4 w-4" />
                                Ver Perfil del Cliente
                            </Link>
                            <button className="flex items-center gap-2 w-full rounded-lg bg-secondary px-3 py-2 text-sm text-foreground hover:bg-secondary/80 transition-colors">
                                <Clock className="h-4 w-4" />
                                Crear Promesa de Pago
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
