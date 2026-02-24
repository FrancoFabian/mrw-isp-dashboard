import type {
    RoiSimulationInput,
    RoiSimulationResult,
    RoiViability,
    ViabilityThresholds,
} from "./types"
import { DEFAULT_VIABILITY_THRESHOLDS } from "./types"

/**
 * Pure O(1) ROI simulation for a potential new node.
 *
 * No side effects, no async. Recalculates instantly on any input change.
 */
export function simulateRoi(
    input: RoiSimulationInput,
    thresholds: ViabilityThresholds = DEFAULT_VIABILITY_THRESHOLDS,
): RoiSimulationResult {
    const { assumptions } = input

    // ── Step 1: Estimate clients ──
    let estimatedClients = Math.floor(input.leadsNoCoverage * assumptions.conversionRate)
    if (assumptions.maxClientsPerNode > 0) {
        estimatedClients = Math.min(estimatedClients, assumptions.maxClientsPerNode)
    }

    // ── Step 2: Revenue ──
    const estimatedMRR = estimatedClients * assumptions.arpuMonthly

    // ── Step 3: Gross profit ──
    const monthlyGrossProfit = estimatedMRR - assumptions.monthlyOpex

    // ── Step 4: Payback ──
    let paybackMonths: number | null = null
    if (monthlyGrossProfit > 0) {
        paybackMonths = Math.round((assumptions.nodeCapex / monthlyGrossProfit) * 10) / 10
    }

    // ── Step 5: Annual ROI ──
    let annualROI: number | null = null
    if (monthlyGrossProfit > 0) {
        const annualProfit = monthlyGrossProfit * 12
        annualROI = Math.round(((annualProfit - assumptions.nodeCapex) / assumptions.nodeCapex) * 1000) / 10
    }

    // ── Step 6: Viability ──
    const viability = classifyViability(monthlyGrossProfit, paybackMonths, thresholds)

    return {
        estimatedClients,
        estimatedMRR,
        monthlyOpex: assumptions.monthlyOpex,
        monthlyGrossProfit,
        paybackMonths,
        annualROI,
        viability,
    }
}

function classifyViability(
    monthlyGrossProfit: number,
    paybackMonths: number | null,
    thresholds: ViabilityThresholds,
): RoiViability {
    if (monthlyGrossProfit <= 0) return "POOR"
    if (paybackMonths === null) return "POOR"
    if (paybackMonths <= thresholds.excellentMaxMonths) return "EXCELLENT"
    if (paybackMonths <= thresholds.goodMaxMonths) return "GOOD"
    return "RISKY"
}
