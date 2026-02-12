"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { mockInvoices } from "@/mocks/invoices"
import { mockPayments } from "@/mocks/payments"
import { getPromiseByInvoice } from "@/mocks/paymentPromises"
import { InvoiceStatusBadge } from "@/components/billing/InvoiceStatusBadge"
import {
    ArrowLeft,
    FileText,
    Calendar,
    DollarSign,
    CreditCard,
    Clock,
    Download,
    CheckCircle,
    AlertTriangle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PageProps {
    params: Promise<{ id: string }>
}

export default function ClientInvoiceDetailPage({ params }: PageProps) {
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

    const isPending = invoice.status === "issued" || invoice.status === "overdue"

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/portal/invoices"
                    className="rounded-full bg-secondary p-2 text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            Factura {invoice.period}
                        </h1>
                        <InvoiceStatusBadge status={invoice.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {invoice.id}
                    </p>
                </div>
                <button className="rounded-lg bg-secondary p-2 text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors">
                    <Download className="h-5 w-5" />
                </button>
            </div>

            {/* Promise Warning */}
            {activePromise && (
                <div className="glass-card border-l-4 border-amber-500 bg-amber-500/5 p-4">
                    <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-amber-400 mt-0.5" />
                        <div>
                            <p className="font-medium text-amber-400">Promesa de Pago Activa</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Has prometido pagar antes del {formatDate(activePromise.promisedUntil)}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Invoice Summary */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-xl",
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
                            <p className="text-sm text-muted-foreground">Total a pagar</p>
                            <p className="text-2xl font-bold text-primary">{formatCurrency(invoice.total)}</p>
                        </div>
                    </div>
                    {isPending && (
                        <button className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                            <CreditCard className="inline h-4 w-4 mr-2" />
                            Pagar Ahora
                        </button>
                    )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Fecha de emisión</p>
                            <p className="text-sm font-medium text-foreground">{formatDate(invoice.issuedAt)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Fecha de vencimiento</p>
                            <p className={cn(
                                "text-sm font-medium",
                                invoice.status === "overdue" ? "text-red-400" : "text-foreground"
                            )}>
                                {formatDate(invoice.dueDate)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoice Items */}
            <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Detalle</h2>

                <div className="space-y-3">
                    {invoice.items.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between py-3 border-b border-border/30 last:border-0"
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
                    <div className="flex justify-between text-lg font-bold text-foreground">
                        <span>Total</span>
                        <span className="text-primary">{formatCurrency(invoice.total)}</span>
                    </div>
                </div>
            </div>

            {/* Payments */}
            {relatedPayments.length > 0 && (
                <div className="glass-card p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                        Pago Registrado
                    </h2>

                    {relatedPayments.map((payment) => (
                        <div
                            key={payment.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/5"
                        >
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    {formatCurrency(payment.amount)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {payment.method} • {payment.reference}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-emerald-400 font-medium">Pagado</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDate(payment.date)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Promise Option */}
            {isPending && !activePromise && (
                <div className="glass-card p-6">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-medium text-foreground">¿Necesitas más tiempo?</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Puedes crear una promesa de pago para extender tu fecha límite.
                            </p>
                        </div>
                        <button className="rounded-lg bg-amber-600/20 px-4 py-2 text-sm font-medium text-amber-400 hover:bg-amber-600/30 transition-colors">
                            Crear Promesa
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
