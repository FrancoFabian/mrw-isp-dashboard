"use client"

import { useEffect, useMemo, useState } from "react"
import { mockPayments } from "@/mocks/payments"
import { mockInvoices } from "@/mocks/invoices"
import type { PaymentSource, Payment } from "@/types/payment"
import { paymentSourceLabels, paymentSourceColors } from "@/types/payment"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import { TableSearch } from "@/components/ui/table-search"
import { TablePagination } from "@/components/ui/table-pagination"
import { StatusBadge } from "@/components/ui/status-badge"
import { ModernSelectTailwind } from "@/components/ui/selection-modern"
import { ModernDatePicker } from "@/components/ui/date-picker-modern"
import { PaymentKpisRow } from "@/components/billing/payment-kpis"
import {
    CreditCard,
    DollarSign,
    CheckCircle,
    Link as LinkIcon,
    Banknote,
    Building,
    User,
    ArrowRightLeft,
} from "lucide-react"

const sourceFilters: { label: string; value: PaymentSource | "all" }[] = [
    { label: "Todos", value: "all" },
    { label: "Cliente", value: "client" },
    { label: "Cobrador", value: "collector" },
    { label: "Admin", value: "admin" },
]

const reconciledFilters: { label: string; value: "all" | "true" | "false" }[] = [
    { label: "Todos", value: "all" },
    { label: "Conciliados", value: "true" },
    { label: "Pendientes", value: "false" },
]

const defaultColumns = ["reference", "client", "amount", "method", "source", "date", "invoice", "action"]
const columnOptions = [
    { keyId: "reference", label: "Referencia" },
    { keyId: "client", label: "Cliente" },
    { keyId: "amount", label: "Monto" },
    { keyId: "method", label: "Método" },
    { keyId: "source", label: "Origen" },
    { keyId: "date", label: "Fecha" },
    { keyId: "invoice", label: "Factura" },
    { keyId: "action", label: "Acción" },
]

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

const getMethodIcon = (method: string) => {
    const m = method.toLowerCase()
    if (m.includes("tarjeta") || m.includes("card")) return CreditCard
    if (m.includes("transfer")) return Building
    if (m.includes("efectivo") || m.includes("cash")) return Banknote
    if (m.includes("oxxo")) return Building
    return DollarSign
}

const getInvoiceForPayment = (invoiceId?: string) => {
    if (!invoiceId) return null
    return mockInvoices.find((inv) => inv.id === invoiceId)
}

const isSameDate = (dateStr: string, targetDate: Date) => {
    const date = new Date(`${dateStr}T00:00:00`)
    if (Number.isNaN(date.getTime())) return false

    return (
        date.getDate() === targetDate.getDate() &&
        date.getMonth() === targetDate.getMonth() &&
        date.getFullYear() === targetDate.getFullYear()
    )
}

export default function PaymentsPage() {
    const [sourceFilter, setSourceFilter] = useState<PaymentSource | "all">("all")
    const [reconciledFilter, setReconciledFilter] = useState<"all" | "true" | "false">("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedQuery, setDebouncedQuery] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const [paymentDateFilter, setPaymentDateFilter] = useState<Date | null>(null)
    const [visibleColumns, setVisibleColumns] = useState<string[]>(defaultColumns)

    const paidPayments = mockPayments.filter((p) => p.status === "paid")

    useEffect(() => {
        if (searchQuery === "") {
            setDebouncedQuery("")
            setIsSearching(false)
            return
        }

        setIsSearching(true)
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery)
            setIsSearching(false)
        }, 400)

        return () => clearTimeout(timer)
    }, [searchQuery])

    const filteredPayments = useMemo(() => {
        let result = paidPayments

        if (sourceFilter !== "all") {
            result = result.filter((p) => p.source === sourceFilter)
        }

        if (reconciledFilter !== "all") {
            const isReconciled = reconciledFilter === "true"
            result = result.filter((p) => p.reconciled === isReconciled)
        }

        if (paymentDateFilter) {
            result = result.filter((p) => isSameDate(p.date, paymentDateFilter))
        }

        if (debouncedQuery.trim()) {
            const query = debouncedQuery.toLowerCase()
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
    }, [sourceFilter, reconciledFilter, paymentDateFilter, debouncedQuery, paidPayments])

    // KPIs
    const totalPayments = paidPayments.length
    const totalReconciled = paidPayments.filter((p) => p.reconciled).length
    const totalPending = paidPayments.filter((p) => !p.reconciled).length
    const sourceClientCount = paidPayments.filter((p) => p.source === "client").length
    const sourceCollectorCount = paidPayments.filter((p) => p.source === "collector").length
    const sourceAdminCount = paidPayments.filter((p) => p.source === "admin").length
    const unlinkedPayments = paidPayments.filter((p) => !p.invoiceId).length
    const totalAmount = paidPayments.reduce((sum, p) => sum + p.amount, 0)

    const columns: ColumnDef<Payment>[] = [
        {
            id: "reference",
            header: "Referencia",
            cell: (row) => (
                <span className="font-mono text-[13px] text-zinc-400">
                    {row.reference || row.id}
                </span>
            ),
        },
        {
            id: "client",
            header: "Cliente",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-zinc-500" />
                    <span className="text-sm font-medium text-zinc-200">{row.clientName}</span>
                </div>
            ),
        },
        {
            id: "amount",
            header: "Monto",
            cell: (row) => (
                <span className="text-sm font-medium text-zinc-200 tracking-tight">{formatCurrency(row.amount)}</span>
            ),
        },
        {
            id: "method",
            header: "Método",
            hiddenOnMobile: true,
            cell: (row) => {
                const MethodIcon = getMethodIcon(row.method)
                return (
                    <div className="flex items-center gap-1.5 text-[13px] text-zinc-400">
                        <MethodIcon className="h-4 w-4" />
                        {row.method}
                    </div>
                )
            },
        },
        {
            id: "source",
            header: "Origen",
            cell: (row) => (
                <StatusBadge
                    label={paymentSourceLabels[row.source]}
                    colorClass={paymentSourceColors[row.source]}
                    icon={
                        row.source === "client" ? <User className="h-3 w-3" /> :
                            row.source === "admin" ? <Building className="h-3 w-3" /> :
                                <CreditCard className="h-3 w-3" />
                    }
                />
            ),
        },
        {
            id: "date",
            header: "Fecha",
            hiddenOnMobile: true,
            cell: (row) => (
                <span className="text-[13px] text-zinc-400">{formatDate(row.date)}</span>
            ),
        },
        {
            id: "invoice",
            header: "Factura",
            hiddenOnMobile: true,
            cell: (row) => {
                const invoice = getInvoiceForPayment(row.invoiceId)
                return invoice ? (
                    <a
                        href={`/dashboard/billing/invoices/${invoice.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                        <LinkIcon className="h-3 w-3" />
                        {invoice.id}
                    </a>
                ) : (
                    <span className="text-xs text-zinc-600">—</span>
                )
            },
        },
        {
            id: "action",
            header: "Acción",
            cell: (row) =>
                row.reconciled ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                        <CheckCircle className="h-3 w-3" />
                        Conciliado
                    </span>
                ) : (
                    <button className="rounded bg-primary/20 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/30 transition-colors">
                        Conciliar
                    </button>
                ),
        },
    ]

    return (
        <div className="space-y-6">
            {/* KPIs */}
            <PaymentKpisRow
                total={totalPayments}
                reconciled={totalReconciled}
                client={sourceClientCount}
                collector={sourceCollectorCount}
                admin={sourceAdminCount}
                pendingReconciliation={totalPending}
                unlinkedPayments={unlinkedPayments}
                collectedAmount={totalAmount}
            />

            <div className="mb-6 space-y-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Directorio de Pagos</h2>
                    <p className="mt-1 text-sm text-zinc-400">Gestiona pagos recibidos y su conciliación con facturas.</p>
                </div>

                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                    <TableSearch
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Buscar cliente o referencia..."
                        isSearching={isSearching}
                    />

                    <div className="hide-scrollbar flex w-full items-center gap-2 overflow-x-auto pb-2 sm:w-auto sm:pb-0">
                        <ModernSelectTailwind
                            items={sourceFilters.map((filter) => ({ keyId: filter.value, label: filter.label }))}
                            width="auto"
                            placeholder="Origen"
                            defaultSelectedKeys={[sourceFilter]}
                            onSelectionChange={(keys) => {
                                if (keys.length > 0) {
                                    setSourceFilter(keys[0] as PaymentSource | "all")
                                }
                            }}
                        />

                        <ModernSelectTailwind
                            items={reconciledFilters.map((filter) => ({ keyId: filter.value, label: filter.label }))}
                            width="auto"
                            placeholder="Conciliación"
                            defaultSelectedKeys={[reconciledFilter]}
                            onSelectionChange={(keys) => {
                                if (keys.length > 0) {
                                    setReconciledFilter(keys[0] as "all" | "true" | "false")
                                }
                            }}
                        />

                        <ModernDatePicker
                            value={paymentDateFilter}
                            onChange={setPaymentDateFilter}
                            placeholder="Fecha de pago"
                        />

                        <ModernSelectTailwind
                            items={columnOptions}
                            multiple
                            width="auto"
                            placeholder="Columnas"
                            displayValue="Columnas"
                            icon={<ArrowRightLeft size={16} />}
                            defaultSelectedKeys={visibleColumns}
                            onSelectionChange={(keys) => setVisibleColumns(keys)}
                        />
                    </div>
                </div>
            </div>

            <DataTable<Payment>
                data={filteredPayments}
                columns={columns}
                visibleColumns={visibleColumns}
                isSearching={isSearching}
                getRowId={(row) => row.id}
                emptyIcon={<CreditCard className="h-12 w-12 text-zinc-600" />}
                emptyMessage={
                    debouncedQuery
                        ? `No se encontraron resultados para "${debouncedQuery}".`
                        : "No se encontraron pagos con los filtros seleccionados."
                }
                footer={
                    <TablePagination
                        totalItems={paidPayments.length}
                        filteredItems={filteredPayments.length}
                        itemName="pagos"
                        isLoading={isSearching}
                    />
                }
            />
        </div>
    )
}
