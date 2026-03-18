"use client"

import { useState, useMemo, useEffect } from "react"
import { mockClients, mockConcessionClients, mockUplinkClients } from "@/mocks/clients"
import type { Client, ClientStatus } from "@/types/client"
import { ClientTable } from "@/components/clients/client-table"
import { ClientDetail } from "@/components/clients/client-detail"
import { cn } from "@/lib/utils"
import { ModernTabs } from "@/components/ui/tabs-modern"
import { mockPlans } from "@/mocks/plans"
import type { ConcessionClient, ConcessionClientStatus } from "@/types/concession-client"
import { ConcessionClientTable } from "@/components/clients/concession-client-table"
import { ConcessionClientDetail } from "@/components/clients/concession-client-detail"
import { estimateMRR, isContractExpiring } from "@/lib/concession-billing"
import { ConcessionKpisRow } from "@/components/clients/concession-kpis"
import type { UplinkClient, UplinkStatus } from "@/types/uplink-client"
import { UplinkClientTable } from "@/components/clients/uplink-client-table"
import { UplinkClientDetail } from "@/components/clients/uplink-client-detail"
import { UplinkKpisRow } from "@/components/clients/uplink-kpis"
import { computeHealth, estimateUplinkMRR, isContractExpiring as isUplinkContractExpiring } from "@/lib/uplink-billing"
import { InternetKpisRow } from "@/components/clients/internet-kpis"

type DrawerMode = "view" | "create"

function nextEntityId(existingIds: string[], prefix: string) {
  const max = existingIds.reduce((currentMax, id) => {
    const numericPart = Number(id.replace(/^\D+-/, ""))
    if (Number.isNaN(numericPart)) return currentMax
    return Math.max(currentMax, numericPart)
  }, 0)

  return `${prefix}-${String(max + 1).padStart(3, "0")}`
}

function todayIsoDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function createInternetDraft(existingRows: Client[]): Client {
  return {
    id: nextEntityId(existingRows.map((client) => client.id), "CLT"),
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    planId: mockPlans[0]?.id ?? "",
    status: "active",
    lifecycleStatus: "prospect",
    ip: "",
    node: "",
    cutoffDate: "",
    registeredAt: todayIsoDate(),
    lastPaymentDate: null,
    wifiName: "",
    wifiPassword: "",
    connectedDevices: 0,
    autopayEnabled: false,
    paymentMethod: "",
  }
}

function createConcessionDraft(existingRows: ConcessionClient[]): ConcessionClient {
  return {
    id: nextEntityId(existingRows.map((client) => client.id), "CON"),
    legalName: "",
    rfc: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    status: "active",
    lifecycleStatus: "active",
    registeredAt: todayIsoDate(),
    cutoffDate: "",
    billing: {
      model: "retainer_sla",
      invoicingCycle: "monthly",
      baseFee: { amount: 0, currency: "MXN" },
      slaTier: "silver",
      perIncidentFee: { amount: 0, currency: "MXN" },
      status: "active",
      notes: "",
    },
    concessionType: "unknown",
    coverageZone: "",
    contract: {
      folio: "",
      startDate: todayIsoDate(),
      endDate: "",
    },
    sla: {
      availabilityPct: undefined,
      responseHours: undefined,
    },
    notes: "",
  }
}

function createUplinkDraft(existingRows: UplinkClient[]): UplinkClient {
  return {
    id: nextEntityId(existingRows.map((client) => client.id), "UPL"),
    customerName: "",
    contactName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    status: "active",
    registeredAt: todayIsoDate(),
    upstreamCarrier: "other",
    uplinkType: "unknown",
    handoff: "unknown",
    circuitId: "",
    popA: "",
    popB: "",
    committedMbps: 0,
    burstMbps: 0,
    routing: {
      bgp: false,
      asn: undefined,
      publicPrefixes: [],
    },
    monitoring: {
      latencyMs: undefined,
      lossPct: undefined,
      jitterMs: undefined,
      lastCheckAt: todayIsoDate(),
    },
    sla: {
      availabilityPct: undefined,
      responseHours: undefined,
    },
    contract: {
      folio: "",
      startDate: todayIsoDate(),
      endDate: "",
    },
    billing: {
      model: "capacity_fee",
      invoicingCycle: "monthly",
      committedMbps: 0,
      burstMbps: 0,
      ratePerMbps: { amount: 0, currency: "MXN" },
      status: "active",
      notes: "",
    },
    notes: "",
  }
}

function upsertRow<T extends { id: string }>(rows: T[], row: T) {
  if (rows.some((current) => current.id === row.id)) {
    return rows.map((current) => (current.id === row.id ? row : current))
  }

  return [row, ...rows]
}

export default function ClientsPage() {
  const [activeTab, setActiveTab] = useState("internet")
  const [internetRows, setInternetRows] = useState<Client[]>(mockClients)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [internetDrawerMode, setInternetDrawerMode] = useState<DrawerMode>("view")

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all")
  const [dateFilter, setDateFilter] = useState<Date | null>(null)

  const [concessionRows, setConcessionRows] = useState<ConcessionClient[]>(mockConcessionClients)
  const [concessionSelectedClient, setConcessionSelectedClient] = useState<ConcessionClient | null>(null)
  const [concessionDrawerMode, setConcessionDrawerMode] = useState<DrawerMode>("view")
  const [concessionSearchQuery, setConcessionSearchQuery] = useState("")
  const [concessionDebouncedQuery, setConcessionDebouncedQuery] = useState("")
  const [concessionIsSearching, setConcessionIsSearching] = useState(false)
  const [concessionStatusFilter, setConcessionStatusFilter] = useState<ConcessionClientStatus | "all">("all")
  const [concessionDateFilter, setConcessionDateFilter] = useState<Date | null>(null)

  const [uplinkRows, setUplinkRows] = useState<UplinkClient[]>(mockUplinkClients)
  const [uplinkSelectedClient, setUplinkSelectedClient] = useState<UplinkClient | null>(null)
  const [uplinkDrawerMode, setUplinkDrawerMode] = useState<DrawerMode>("view")
  const [uplinkSearchQuery, setUplinkSearchQuery] = useState("")
  const [uplinkDebouncedQuery, setUplinkDebouncedQuery] = useState("")
  const [uplinkIsSearching, setUplinkIsSearching] = useState(false)
  const [uplinkStatusFilter, setUplinkStatusFilter] = useState<UplinkStatus | "all">("all")
  const [uplinkDateFilter, setUplinkDateFilter] = useState<Date | null>(null)

  // Debounce effect
  useEffect(() => {
    if (searchQuery === '') {
      setDebouncedQuery('')
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
      setIsSearching(false)
    }, 400) // 400ms simulate delay

    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    if (concessionSearchQuery === "") {
      setConcessionDebouncedQuery("")
      setConcessionIsSearching(false)
      return
    }

    setConcessionIsSearching(true)
    const timer = setTimeout(() => {
      setConcessionDebouncedQuery(concessionSearchQuery)
      setConcessionIsSearching(false)
    }, 400)

    return () => clearTimeout(timer)
  }, [concessionSearchQuery])

  useEffect(() => {
    if (uplinkSearchQuery === "") {
      setUplinkDebouncedQuery("")
      setUplinkIsSearching(false)
      return
    }

    setUplinkIsSearching(true)
    const timer = setTimeout(() => {
      setUplinkDebouncedQuery(uplinkSearchQuery)
      setUplinkIsSearching(false)
    }, 400)

    return () => clearTimeout(timer)
  }, [uplinkSearchQuery])

  const filteredClients = useMemo(() => {
    let result = internetRows

    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter)
    }

    if (dateFilter) {
      result = result.filter((c) => {
        const baseDate = c.cutoffDate || c.registeredAt
        if (!baseDate) return false;
        try {
          const cutDate = new Date(baseDate + 'T00:00:00');
          if (isNaN(cutDate.getTime())) return false;
          return cutDate.getDate() === dateFilter.getDate() &&
            cutDate.getMonth() === dateFilter.getMonth() &&
            cutDate.getFullYear() === dateFilter.getFullYear();
        } catch (e) {
          return false;
        }
      });
    }

    if (debouncedQuery.trim()) {
      const query = debouncedQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.firstName.toLowerCase().includes(query) ||
          c.lastName.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.id.toLowerCase().includes(query)
      )
    }

    return result
  }, [internetRows, statusFilter, debouncedQuery, dateFilter])

  const filteredConcessionClients = useMemo(() => {
    let result = concessionRows

    if (concessionStatusFilter !== "all") {
      result = result.filter((c) => c.status === concessionStatusFilter)
    }

    if (concessionDateFilter) {
      result = result.filter((c) => {
        const baseDate = c.cutoffDate ?? c.registeredAt
        if (!baseDate) return false
        try {
          const parsedDate = new Date(`${baseDate}T00:00:00`)
          if (Number.isNaN(parsedDate.getTime())) return false
          return (
            parsedDate.getDate() === concessionDateFilter.getDate() &&
            parsedDate.getMonth() === concessionDateFilter.getMonth() &&
            parsedDate.getFullYear() === concessionDateFilter.getFullYear()
          )
        } catch {
          return false
        }
      })
    }

    if (concessionDebouncedQuery.trim()) {
      const query = concessionDebouncedQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.legalName.toLowerCase().includes(query) ||
          c.rfc?.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.id.toLowerCase().includes(query)
      )
    }

    return result
  }, [concessionRows, concessionStatusFilter, concessionDebouncedQuery, concessionDateFilter])

  const filteredUplinkClients = useMemo(() => {
    let result = uplinkRows

    if (uplinkStatusFilter !== "all") {
      result = result.filter((c) => c.status === uplinkStatusFilter)
    }

    if (uplinkDateFilter) {
      result = result.filter((c) => {
        const baseDate = c.registeredAt
        if (!baseDate) return false
        try {
          const parsedDate = new Date(`${baseDate}T00:00:00`)
          if (Number.isNaN(parsedDate.getTime())) return false
          return (
            parsedDate.getDate() === uplinkDateFilter.getDate() &&
            parsedDate.getMonth() === uplinkDateFilter.getMonth() &&
            parsedDate.getFullYear() === uplinkDateFilter.getFullYear()
          )
        } catch {
          return false
        }
      })
    }

    if (uplinkDebouncedQuery.trim()) {
      const query = uplinkDebouncedQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.customerName.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.circuitId?.toLowerCase().includes(query) ||
          c.popA?.toLowerCase().includes(query) ||
          c.popB?.toLowerCase().includes(query) ||
          c.upstreamCarrier.toLowerCase().includes(query)
      )
    }

    return result
  }, [uplinkRows, uplinkStatusFilter, uplinkDateFilter, uplinkDebouncedQuery])

  const totalCount = internetRows.length
  const activeCount = internetRows.filter((c) => c.status === "active").length
  const suspendedCount = internetRows.filter((c) => c.status === "suspended").length
  const atRiskCount = internetRows.filter((c) => c.status === "at_risk").length
  const autopayEnabledCount = internetRows.filter((c) => c.autopayEnabled === true).length
  const autopayDisabledCount = totalCount - autopayEnabledCount
  const internetEstimatedMrr = internetRows.reduce((acc, client) => {
    if (client.status !== "active") return acc
    const plan = mockPlans.find((p) => p.id === client.planId)
    return acc + (plan?.price ?? 0)
  }, 0)

  const concessionTotalCount = filteredConcessionClients.length
  const concessionActiveCount = filteredConcessionClients.filter((c) => c.status === "active").length
  const concessionSuspendedCount = filteredConcessionClients.filter((c) => c.status === "suspended").length
  const concessionAtRiskCount = filteredConcessionClients.filter((c) => c.status === "at_risk").length
  const concessionRevShareCount = filteredConcessionClients.filter((c) => c.billing.model === "revenue_share").length
  const concessionEstimatedMrr = filteredConcessionClients.reduce((acc, client) => acc + estimateMRR(client.billing), 0)
  const concessionExpiringContractsCount = filteredConcessionClients.filter((c) => isContractExpiring(c.contract?.endDate, 30)).length

  const uplinkTotalCount = filteredUplinkClients.length
  const uplinkActiveCount = filteredUplinkClients.filter((c) => c.status === "active").length
  const uplinkDegradedCount = filteredUplinkClients.filter((c) => c.status === "degraded" || computeHealth(c.monitoring) === "degraded").length
  const uplinkCommittedTotal = filteredUplinkClients.reduce(
    (acc, client) => acc + (client.committedMbps ?? client.billing.committedMbps ?? 0),
    0
  )
  const uplinkEstimatedMrr = filteredUplinkClients.reduce((acc, client) => acc + estimateUplinkMRR(client.billing), 0)
  const uplinkExpiringContractsCount = filteredUplinkClients.filter((c) =>
    isUplinkContractExpiring(c.contract?.endDate, 30)
  ).length

  const concessionMrrDeltaPct = useMemo(() => {
    if (concessionTotalCount === 0) return 0
    const trendBase = ((concessionActiveCount - concessionSuspendedCount) / concessionTotalCount) * 10
    return Number(trendBase.toFixed(1))
  }, [concessionTotalCount, concessionActiveCount, concessionSuspendedCount])

  const concessionMrrTrend = useMemo(
    () =>
      [62, 68, 58, 76, 74, 88, 83, 97, 91, 100].map((y, index, arr) => ({
        x: (index / (arr.length - 1)) * 100,
        y: y - Math.min(concessionAtRiskCount * 2, 10),
      })),
    [concessionAtRiskCount]
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="mb-6">
        <ModernTabs
          value={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: 'internet', label: 'Internet' },
            { id: 'consesion', label: 'Consesion' },
            { id: 'uplink', label: 'Uplink' }
          ]}
        />
      </div>

      {activeTab === 'internet' && (
        <>
          <InternetKpisRow
            total={totalCount}
            active={activeCount}
            suspended={suspendedCount}
            atRisk={atRiskCount}
            estimatedMrr={internetEstimatedMrr}
            autopayEnabled={autopayEnabledCount}
            withoutAutopay={autopayDisabledCount}
          />

          {/* Content */}
          <div className="relative block h-full">
            <ClientTable
              clients={internetRows}
              onCreateClient={() => {
                setInternetDrawerMode("create")
                setSelectedClient(createInternetDraft(internetRows))
              }}
              filteredClients={filteredClients}
              onSelectClient={(client) => {
                setInternetDrawerMode("view")
                setSelectedClient(client)
              }}
              selectedClientId={selectedClient?.id ?? null}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              debouncedQuery={debouncedQuery}
              isSearching={isSearching}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
            />

            {/* Non-blocking Drawer */}
            <div
              className={cn(
                "fixed top-[88px] bottom-4 right-4 z-40 w-full max-w-[400px] transform transition-transform duration-500 ease-in-out",
                selectedClient ? "translate-x-0" : "translate-x-[150%]"
              )}
            >
              {selectedClient && (
                <ClientDetail
                  client={selectedClient}
                  mode={internetDrawerMode}
                  onClose={() => {
                    setInternetDrawerMode("view")
                    setSelectedClient(null)
                  }}
                  onSaveClient={(updatedClient) => {
                    setInternetRows((prev) => upsertRow(prev, updatedClient))
                    setInternetDrawerMode("view")
                    setSelectedClient(updatedClient)
                  }}
                />
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'consesion' && (
        <>
          <ConcessionKpisRow
            estimatedMrr={concessionEstimatedMrr}
            mrrDeltaPct={concessionMrrDeltaPct}
            mrrTrend={concessionMrrTrend}
            total={concessionTotalCount}
            active={concessionActiveCount}
            suspended={concessionSuspendedCount}
            revShare={concessionRevShareCount}
            expiringContracts={concessionExpiringContractsCount}
            atRisk={concessionAtRiskCount}
          />

          <div className="relative block h-full">
            <ConcessionClientTable
              clients={concessionRows}
              onCreateClient={() => {
                setConcessionDrawerMode("create")
                setConcessionSelectedClient(createConcessionDraft(concessionRows))
              }}
              filteredClients={filteredConcessionClients}
              onSelectClient={(client) => {
                setConcessionDrawerMode("view")
                setConcessionSelectedClient(client)
              }}
              selectedClientId={concessionSelectedClient?.id ?? null}
              searchQuery={concessionSearchQuery}
              setSearchQuery={setConcessionSearchQuery}
              debouncedQuery={concessionDebouncedQuery}
              isSearching={concessionIsSearching}
              statusFilter={concessionStatusFilter}
              setStatusFilter={setConcessionStatusFilter}
              dateFilter={concessionDateFilter}
              setDateFilter={setConcessionDateFilter}
            />

            <div
              className={cn(
                "fixed top-[88px] bottom-4 right-4 z-40 w-full max-w-[400px] transform transition-transform duration-500 ease-in-out",
                concessionSelectedClient ? "translate-x-0" : "translate-x-[150%]"
              )}
            >
              {concessionSelectedClient && (
                <ConcessionClientDetail
                  client={concessionSelectedClient}
                  mode={concessionDrawerMode}
                  onClose={() => {
                    setConcessionDrawerMode("view")
                    setConcessionSelectedClient(null)
                  }}
                  onSaveClient={(updatedClient) => {
                    setConcessionRows((prev) => upsertRow(prev, updatedClient))
                    setConcessionDrawerMode("view")
                    setConcessionSelectedClient(updatedClient)
                  }}
                />
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'uplink' && (
        <>
          <UplinkKpisRow
            total={uplinkTotalCount}
            active={uplinkActiveCount}
            degraded={uplinkDegradedCount}
            committedMbps={uplinkCommittedTotal}
            estimatedMrr={uplinkEstimatedMrr}
            expiringContracts={uplinkExpiringContractsCount}
          />

          <div className="relative block h-full">
            <UplinkClientTable
              clients={uplinkRows}
              onCreateClient={() => {
                setUplinkDrawerMode("create")
                setUplinkSelectedClient(createUplinkDraft(uplinkRows))
              }}
              filteredClients={filteredUplinkClients}
              onSelectClient={(client) => {
                setUplinkDrawerMode("view")
                setUplinkSelectedClient(client)
              }}
              selectedClientId={uplinkSelectedClient?.id ?? null}
              searchQuery={uplinkSearchQuery}
              setSearchQuery={setUplinkSearchQuery}
              debouncedQuery={uplinkDebouncedQuery}
              isSearching={uplinkIsSearching}
              statusFilter={uplinkStatusFilter}
              setStatusFilter={setUplinkStatusFilter}
              dateFilter={uplinkDateFilter}
              setDateFilter={setUplinkDateFilter}
            />

            <div
              className={cn(
                "fixed top-[88px] bottom-4 right-4 z-40 w-full max-w-[400px] transform transition-transform duration-500 ease-in-out",
                uplinkSelectedClient ? "translate-x-0" : "translate-x-[150%]"
              )}
            >
              {uplinkSelectedClient && (
                <UplinkClientDetail
                  client={uplinkSelectedClient}
                  mode={uplinkDrawerMode}
                  onClose={() => {
                    setUplinkDrawerMode("view")
                    setUplinkSelectedClient(null)
                  }}
                  onSaveClient={(updatedClient) => {
                    setUplinkRows((prev) => upsertRow(prev, updatedClient))
                    setUplinkDrawerMode("view")
                    setUplinkSelectedClient(updatedClient)
                  }}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
