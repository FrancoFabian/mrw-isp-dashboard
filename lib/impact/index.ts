export { computeNodeImpact, computeImpactBatch, computeImpactStats } from "./computeImpact"
export { generateMockImpactInputs } from "./generateMockImpactData"
export {
    DEFAULT_IMPACT_CONFIG,
    DEFAULT_CLIENT_IMPACT_CONFIG,
} from "./config"
export { buildClientNodeIndex } from "./client-impact-index"
export {
    classifyClientAgainstNode,
    computeNodeClientImpact,
    computeNodeClientImpactBatch,
    recomputeNodeClientImpactIncremental,
    getAffectedSeverity,
} from "./computeClientImpact"
export { generateMockClientLinks } from "./generateMockClientLinks"
export type {
    AffectedSeverity,
    ClientImpactConfig,
    ClientImpactFilter,
    ClientNodeLink,
    ImpactTier,
    NodeImpact,
    NodeClientImpact,
    NodeImpactInput,
    NocScope,
    ImpactConfig,
    ImpactWeights,
    ImpactNormalization,
    ImpactThresholds,
    ImpactStats,
} from "./types"
