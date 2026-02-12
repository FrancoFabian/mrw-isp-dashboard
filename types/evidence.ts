/** Evidence/attachment type */
export type EvidenceType = "photo" | "document" | "signature" | "video"

/** Evidence/attachment for work orders (mock storage) */
export interface Evidence {
    id: string
    workOrderId: string
    type: EvidenceType
    filename: string
    url: string // Mock URL for now
    mimeType: string
    sizeBytes: number
    uploadedAt: string
    uploadedBy: string
    uploadedByName: string
    uploadedByRole: "installer" | "admin"
    description?: string
    checklistItemId?: string // Optional: link to specific checklist item
    thumbnailUrl?: string // For preview
}

/** Evidence type labels */
export const evidenceTypeLabels: Record<EvidenceType, string> = {
    photo: "Fotografía",
    document: "Documento",
    signature: "Firma",
    video: "Video",
}

/** Evidence type icons (lucide-react icon names) */
export const evidenceTypeIcons: Record<EvidenceType, string> = {
    photo: "Image",
    document: "FileText",
    signature: "PenTool",
    video: "Video",
}

/** Evidence type colors */
export const evidenceTypeColors: Record<EvidenceType, string> = {
    photo: "text-blue-400",
    document: "text-purple-400",
    signature: "text-green-400",
    video: "text-red-400",
}
