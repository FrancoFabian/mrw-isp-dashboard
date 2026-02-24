/* ── Viability classification ── */
export type RoiViability = "POOR" | "RISKY" | "GOOD" | "EXCELLENT"

export const ROI_VIABILITY_LABELS: Record<RoiViability, string> = {
    EXCELLENT: "Excelente",
    GOOD: "Bueno",
    RISKY: "Riesgoso",
    POOR: "No viable",
}

export const ROI_VIABILITY_EMOJI: Record<RoiViability, string> = {
    EXCELLENT: "🟢",
    GOOD: "🟡",
    RISKY: "🟠",
    POOR: "🔴",
}

/* ── Editable assumptions ── */
export interface RoiAssumptions {
    arpuMonthly: number
    conversionRate: number
    nodeCapex: number
    monthlyOpex: number
    maxClientsPerNode: number
}

/* ── Input for simulation ── */
export interface RoiSimulationInput {
    location: [number, number]  // [lng, lat]
    h3Index: string
    leadsNoCoverage: number
    potentialMRR: number
    nearestNodeDistanceM: number
    assumptions: RoiAssumptions
}

/* ── Output from simulation ── */
export interface RoiSimulationResult {
    estimatedClients: number
    estimatedMRR: number
    monthlyOpex: number
    monthlyGrossProfit: number
    paybackMonths: number | null
    annualROI: number | null
    viability: RoiViability
}

/* ── Viability thresholds (configurable) ── */
export interface ViabilityThresholds {
    excellentMaxMonths: number
    goodMaxMonths: number
    riskyMaxMonths: number
}

export const DEFAULT_VIABILITY_THRESHOLDS: ViabilityThresholds = {
    excellentMaxMonths: 12,
    goodMaxMonths: 24,
    riskyMaxMonths: Infinity,  // anything above good is RISKY; POOR = no profit
}

/* ── Default assumptions (MXN) ── */
export const DEFAULT_ROI_ASSUMPTIONS: RoiAssumptions = {
    arpuMonthly: 450,
    conversionRate: 0.35,
    nodeCapex: 25_000,
    monthlyOpex: 2_500,
    maxClientsPerNode: 64,
}
