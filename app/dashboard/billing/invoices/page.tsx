"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { mockInvoices } from "@/mocks/invoices"
import type { InvoiceStatus } from "@/types/invoice"
import { invoiceStatusLabels, invoiceStatusColors } from "@/types/invoice"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import { TableSearch } from "@/components/ui/table-search"
import { TablePagination } from "@/components/ui/table-pagination"
import { StatusBadge } from "@/components/ui/status-badge"
import { ModernSelectTailwind } from "@/components/ui/selection-modern"
import { ModernDatePicker } from "@/components/ui/date-picker-modern"
import { InvoiceKpisRow } from "@/components/billing/invoice-kpis"
import type { Invoice } from "@/types/invoice"
import {
    FileText,
    Calendar,
    ChevronRight,
    Plus,
    ArrowRightLeft,
} from "lucide-react"
import Link from "next/link"

const statusFilters: { label: string; value: InvoiceStatus | "all" }[] = [
    { label: "Todas", value: "all" },
    { label: "Borrador", value: "draft" },
    { label: "Emitidas", value: "issued" },
    { label: "Pagadas", value: "paid" },
    { label: "Vencidas", value: "overdue" },
    { label: "Canceladas", value: "cancelled" },
]

const defaultColumns = ["id", "customer", "period", "amount", "dueDate", "status", "arrow"]
const columnOptions = [
    { keyId: "id", label: "Factura" },
    { keyId: "customer", label: "Cliente" },
    { keyId: "period", label: "Período" },
    { keyId: "amount", label: "Monto" },
    { keyId: "dueDate", label: "Vencimiento" },
    { keyId: "status", label: "Estado" },
    { keyId: "arrow", label: "Detalle" },
]

const formatCurrency = (amount: number) =>
    `$${amount.toLocaleString("en-US")}`

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
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

const columns: ColumnDef<Invoice>[] = [
    {
        id: "id",
        header: "Factura",
        cell: (row) => (
            <span className="font-mono text-sm font-medium text-zinc-200">{row.id}</span>
        ),
    },
    {
        id: "customer",
        header: "Cliente",
        cell: (row) => (
            <span className="text-sm font-medium text-zinc-200">{row.customerName}</span>
        ),
    },
    {
        id: "period",
        header: "Período",
        cell: (row) => (
            <div className="flex items-center gap-1.5 text-[13px] text-zinc-400">
                <Calendar className="h-3.5 w-3.5" />
                {row.period}
            </div>
        ),
    },
    {
        id: "amount",
        header: "Monto",
        cell: (row) => (
            <span className="text-sm font-medium text-zinc-200 tracking-tight">{formatCurrency(row.total)}</span>
        ),
    },
    {
        id: "dueDate",
        header: "Vencimiento",
        hiddenOnMobile: true,
        cell: (row) => (
            <span className="text-[13px] text-zinc-400">{formatDate(row.dueDate)}</span>
        ),
    },
    {
        id: "status",
        header: "Estado",
        cell: (row) => (
            <StatusBadge
                label={invoiceStatusLabels[row.status]}
                colorClass={invoiceStatusColors[row.status]}
                dot
            />
        ),
    },
    {
        id: "arrow",
        header: "",
        cell: () => (
            <ChevronRight className="h-4 w-4 text-zinc-600" />
        ),
    },
]

export default function InvoicesPage() {
    const router = useRouter()
    const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedQuery, setDebouncedQuery] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const [dueDateFilter, setDueDateFilter] = useState<Date | null>(null)
    const [visibleColumns, setVisibleColumns] = useState<string[]>(defaultColumns)

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

    const filteredInvoices = useMemo(() => {
        let result = mockInvoices

        if (statusFilter !== "all") {
            result = result.filter((inv) => inv.status === statusFilter)
        }

        if (dueDateFilter) {
            result = result.filter((inv) => isSameDate(inv.dueDate, dueDateFilter))
        }

        if (debouncedQuery.trim()) {
            const query = debouncedQuery.toLowerCase()
            result = result.filter(
                (inv) =>
                    inv.customerName.toLowerCase().includes(query) ||
                    inv.id.toLowerCase().includes(query) ||
                    inv.period.toLowerCase().includes(query)
            )
        }

        return result.sort((a, b) =>
            new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
        )
    }, [statusFilter, dueDateFilter, debouncedQuery])

    // KPIs
    const totalInvoices = mockInvoices.length
    const totalIssued = mockInvoices.filter((i) => i.status === "issued").length
    const totalOverdue = mockInvoices.filter((i) => i.status === "overdue").length
    const totalPaid = mockInvoices.filter((i) => i.status === "paid").length
    const pendingCollection = mockInvoices.filter((i) => i.status === "issued" || i.status === "overdue").length
    const clientsWithDebt = new Set(
        mockInvoices
            .filter((i) => i.status === "issued" || i.status === "overdue")
            .map((i) => i.customerId)
    ).size
    const totalRevenue = mockInvoices
        .filter((i) => i.status === "paid")
        .reduce((sum, i) => sum + i.total, 0)

    return (
        <div className="space-y-6">
            {/* KPIs */}
            <InvoiceKpisRow
                total={totalInvoices}
                paid={totalPaid}
                issued={totalIssued}
                overdue={totalOverdue}
                pendingCollection={pendingCollection}
                clientsWithDebt={clientsWithDebt}
                collectedAmount={totalRevenue}
            />

            <div className="mb-6 space-y-4">
                <div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Directorio de Facturas</h2>
                        <p className="mt-1 text-sm text-zinc-400">Gestiona emisiones, vencimientos y pagos de facturas.</p>
                    </div>
                </div>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <Link
                        href="/dashboard/billing/invoices/new"
                        className="order-1 lg:order-2 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
                    >
                        <Plus className="h-4 w-4" />
                        Nueva factura
                    </Link>

                    <div className="order-2 lg:order-1 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                        <TableSearch
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Buscar cliente o factura..."
                            isSearching={isSearching}
                        />

                        <div className="hide-scrollbar flex w-full items-center gap-2 overflow-x-auto pb-2 sm:w-auto sm:pb-0">
                            <ModernSelectTailwind
                                items={statusFilters.map((filter) => ({ keyId: filter.value, label: filter.label }))}
                                width="auto"
                                placeholder="Estado"
                                defaultSelectedKeys={[statusFilter]}
                                onSelectionChange={(keys) => {
                                    if (keys.length > 0) {
                                        setStatusFilter(keys[0] as InvoiceStatus | "all")
                                    }
                                }}
                            />

                            <ModernDatePicker
                                value={dueDateFilter}
                                onChange={setDueDateFilter}
                                placeholder="Vencimiento"
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
            </div>

            <DataTable<Invoice>
                data={filteredInvoices}
                columns={columns}
                visibleColumns={visibleColumns}
                isSearching={isSearching}
                getRowId={(row) => row.id}
                onRowClick={(row) => router.push(`/dashboard/billing/invoices/${row.id}`)}
                emptyIcon={<FileText className="h-12 w-12 text-zinc-600" />}
                emptyMessage={
                    debouncedQuery
                        ? `No se encontraron resultados para "${debouncedQuery}".`
                        : "No se encontraron facturas con los filtros seleccionados."
                }
                footer={
                    <TablePagination
                        totalItems={mockInvoices.length}
                        filteredItems={filteredInvoices.length}
                        itemName="facturas"
                        isLoading={isSearching}
                    />
                }
            />
        </div>
    )
}
