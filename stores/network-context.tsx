"use client"

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useMemo,
    type ReactNode,
} from "react"
import type {
    Olt,
    Pon,
    Nap,
    NapPort,
    Onu,
    NetworkAlert,
    NetworkEvent,
    ProvisioningJob,
    BandwidthProfile,
    NapPortStatus,
} from "@/types/network"
import {
    mockOlts,
    mockPons,
    mockNaps,
    mockNapPorts,
    mockOnus,
    mockAlerts,
    mockEvents,
    mockProvisioningJobs,
    mockBandwidthProfiles,
} from "@/mocks/network"

// ============================================================================
// State Interface
// ============================================================================

interface NetworkState {
    olts: Olt[]
    pons: Pon[]
    naps: Nap[]
    napPorts: NapPort[]
    onus: Onu[]
    alerts: NetworkAlert[]
    events: NetworkEvent[]
    jobs: ProvisioningJob[]
    profiles: BandwidthProfile[]
}

// ============================================================================
// Context Value Interface
// ============================================================================

interface NetworkContextValue extends NetworkState {
    // Selectors
    getOltById: (id: string) => Olt | undefined
    getPonById: (id: string) => Pon | undefined
    getPonsByOltId: (oltId: string) => Pon[]
    getNapById: (id: string) => Nap | undefined
    getNapsByOltId: (oltId: string) => Nap[]
    getNapsByPonId: (ponId: string) => Nap[]
    getPortsByNapId: (napId: string) => NapPort[]
    getFreePortsByNapId: (napId: string) => NapPort[]
    getOnuById: (id: string) => Onu | undefined
    getOnuByCustomerId: (customerId: string) => Onu | undefined
    getOnusByOltId: (oltId: string) => Onu[]
    getOnusByNapId: (napId: string) => Onu[]
    getAlertsForEntity: (entityType: NetworkAlert["entityType"], entityId: string) => NetworkAlert[]
    getEventsForEntity: (entityType: NetworkEvent["entityType"], entityId: string) => NetworkEvent[]
    getProfileById: (id: string) => BandwidthProfile | undefined

    // Computed stats
    stats: {
        totalOnus: number
        onlineOnus: number
        offlineOnus: number
        degradedOnus: number
        activeAlerts: number
        criticalAlerts: number
        pendingJobs: number
        avgRxPower: number
        saturatedNaps: number
    }

    // Actions
    acknowledgeAlert: (alertId: string, userId: string) => void
    updatePortStatus: (portId: string, status: NapPortStatus, notes?: string) => void
    createProvisioningJob: (job: Omit<ProvisioningJob, "id" | "createdAt" | "updatedAt" | "steps" | "logs">) => string
}

const NetworkContext = createContext<NetworkContextValue | null>(null)

// ============================================================================
// Provider Component
// ============================================================================

export function NetworkProvider({ children }: { children: ReactNode }) {
    // Initialize state from mocks
    const [olts] = useState<Olt[]>(mockOlts)
    const [pons] = useState<Pon[]>(mockPons)
    const [naps] = useState<Nap[]>(mockNaps)
    const [napPorts, setNapPorts] = useState<NapPort[]>(mockNapPorts)
    const [onus] = useState<Onu[]>(mockOnus)
    const [alerts, setAlerts] = useState<NetworkAlert[]>(mockAlerts)
    const [events, setEvents] = useState<NetworkEvent[]>(mockEvents)
    const [jobs, setJobs] = useState<ProvisioningJob[]>(mockProvisioningJobs)
    const [profiles] = useState<BandwidthProfile[]>(mockBandwidthProfiles)

    // ============================================================================
    // Selectors
    // ============================================================================

    const getOltById = useCallback((id: string) => olts.find(o => o.id === id), [olts])
    const getPonById = useCallback((id: string) => pons.find(p => p.id === id), [pons])
    const getPonsByOltId = useCallback((oltId: string) => pons.filter(p => p.oltId === oltId), [pons])
    const getNapById = useCallback((id: string) => naps.find(n => n.id === id), [naps])
    const getNapsByOltId = useCallback((oltId: string) => naps.filter(n => n.oltId === oltId), [naps])
    const getNapsByPonId = useCallback((ponId: string) => naps.filter(n => n.ponId === ponId), [naps])
    const getPortsByNapId = useCallback((napId: string) => napPorts.filter(p => p.napId === napId), [napPorts])
    const getFreePortsByNapId = useCallback((napId: string) => napPorts.filter(p => p.napId === napId && p.status === "free"), [napPorts])
    const getOnuById = useCallback((id: string) => onus.find(o => o.id === id), [onus])
    const getOnuByCustomerId = useCallback((customerId: string) => onus.find(o => o.customerId === customerId), [onus])
    const getOnusByOltId = useCallback((oltId: string) => onus.filter(o => o.oltId === oltId), [onus])
    const getOnusByNapId = useCallback((napId: string) => onus.filter(o => o.napId === napId), [onus])
    const getProfileById = useCallback((id: string) => profiles.find(p => p.id === id), [profiles])

    const getAlertsForEntity = useCallback(
        (entityType: NetworkAlert["entityType"], entityId: string) =>
            alerts.filter(a => a.entityType === entityType && a.entityId === entityId),
        [alerts]
    )

    const getEventsForEntity = useCallback(
        (entityType: NetworkEvent["entityType"], entityId: string) =>
            events
                .filter(e => e.entityType === entityType && e.entityId === entityId)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        [events]
    )

    // ============================================================================
    // Computed Stats
    // ============================================================================

    const stats = useMemo(() => {
        const onlineOnus = onus.filter(o => o.status === "online").length
        const offlineOnus = onus.filter(o => o.status === "offline" || o.status === "los").length
        const degradedOnus = onus.filter(o => o.status === "degraded").length
        const activeAlerts = alerts.filter(a => !a.resolvedAt).length
        const criticalAlerts = alerts.filter(a => a.severity === "critical" && !a.resolvedAt).length
        const pendingJobs = jobs.filter(j => j.status === "pending" || j.status === "running").length

        const onusWithPower = onus.filter(o => o.rxPowerDbm !== null)
        const avgRxPower = onusWithPower.length > 0
            ? parseFloat((onusWithPower.reduce((sum, o) => sum + (o.rxPowerDbm ?? 0), 0) / onusWithPower.length).toFixed(2))
            : 0

        // NAPs with less than 20% free ports
        const saturatedNaps = naps.filter(nap => {
            const ports = napPorts.filter(p => p.napId === nap.id)
            const freePorts = ports.filter(p => p.status === "free").length
            return freePorts / nap.totalPorts < 0.2
        }).length

        return {
            totalOnus: onus.length,
            onlineOnus,
            offlineOnus,
            degradedOnus,
            activeAlerts,
            criticalAlerts,
            pendingJobs,
            avgRxPower,
            saturatedNaps,
        }
    }, [onus, alerts, jobs, naps, napPorts])

    // ============================================================================
    // Actions
    // ============================================================================

    const acknowledgeAlert = useCallback((alertId: string, userId: string) => {
        setAlerts(prev => prev.map(alert =>
            alert.id === alertId
                ? { ...alert, acknowledgedAt: new Date().toISOString(), acknowledgedBy: userId }
                : alert
        ))
    }, [])

    const updatePortStatus = useCallback((portId: string, status: NapPortStatus, notes?: string) => {
        setNapPorts(prev => prev.map(port =>
            port.id === portId
                ? { ...port, status, notes, updatedAt: new Date().toISOString() }
                : port
        ))
    }, [])

    const createProvisioningJob = useCallback((
        jobData: Omit<ProvisioningJob, "id" | "createdAt" | "updatedAt" | "steps" | "logs">
    ): string => {
        const newId = `JOB-${(jobs.length + 1).toString().padStart(3, "0")}`
        const now = new Date().toISOString()

        const newJob: ProvisioningJob = {
            ...jobData,
            id: newId,
            steps: [
                { id: "step-1", order: 1, name: "Validar cliente", description: "Verificar datos del cliente", status: "pending" },
                { id: "step-2", order: 2, name: "Reservar puerto", description: "Reservar puerto NAP seleccionado", status: "pending" },
                { id: "step-3", order: 3, name: "Registrar ONU", description: "Registrar ONU en OLT", status: "pending" },
                { id: "step-4", order: 4, name: "Configurar perfil", description: "Aplicar perfil de velocidad", status: "pending" },
                { id: "step-5", order: 5, name: "Activar servicio", description: "Habilitar tráfico de datos", status: "pending" },
            ],
            logs: [{ timestamp: now, level: "info", message: "Job creado, esperando inicio" }],
            createdAt: now,
            updatedAt: now,
        }

        setJobs(prev => [newJob, ...prev])

        // Add event
        setEvents(prev => [{
            id: `EVT-JOB-${newId}`,
            entityType: "customer",
            entityId: jobData.customerId,
            type: "PROVISIONED",
            description: `Provisioning job ${newId} creado`,
            payload: { jobId: newId },
            triggeredBy: jobData.createdBy,
            createdAt: now,
        }, ...prev])

        return newId
    }, [jobs.length])

    // ============================================================================
    // Context Value
    // ============================================================================

    const value: NetworkContextValue = {
        olts,
        pons,
        naps,
        napPorts,
        onus,
        alerts,
        events,
        jobs,
        profiles,
        getOltById,
        getPonById,
        getPonsByOltId,
        getNapById,
        getNapsByOltId,
        getNapsByPonId,
        getPortsByNapId,
        getFreePortsByNapId,
        getOnuById,
        getOnuByCustomerId,
        getOnusByOltId,
        getOnusByNapId,
        getAlertsForEntity,
        getEventsForEntity,
        getProfileById,
        stats,
        acknowledgeAlert,
        updatePortStatus,
        createProvisioningJob,
    }

    return (
        <NetworkContext.Provider value={value}>
            {children}
        </NetworkContext.Provider>
    )
}

// ============================================================================
// Hook
// ============================================================================

export function useNetwork() {
    const context = useContext(NetworkContext)
    if (!context) {
        throw new Error("useNetwork must be used within a NetworkProvider")
    }
    return context
}
