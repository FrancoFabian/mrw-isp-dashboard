"use client"

import { cn } from "@/lib/utils"
import type { Evidence } from "@/types/evidence"
import { evidenceTypeLabels, evidenceTypeColors } from "@/types/evidence"
import { Image, FileText, PenTool, Video, Download, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface EvidenceCardProps {
    evidence: Evidence
    onDelete?: (evidenceId: string) => void
    canDelete?: boolean
    className?: string
}

const evidenceIcons: Record<Evidence["type"], React.ReactNode> = {
    photo: <Image className="h-5 w-5" />,
    document: <FileText className="h-5 w-5" />,
    signature: <PenTool className="h-5 w-5" />,
    video: <Video className="h-5 w-5" />,
}

const evidenceIconColors: Record<Evidence["type"], string> = {
    photo: "text-blue-400",
    document: "text-purple-400",
    signature: "text-green-400",
    video: "text-red-400",
}

export function EvidenceCard({
    evidence,
    onDelete,
    canDelete = false,
    className,
}: EvidenceCardProps) {
    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
    }

    return (
        <div
            className={cn(
                "glass-card group relative overflow-hidden p-4 transition-colors hover:border-primary/30",
                className
            )}
        >
            {/* Thumbnail/Icon */}
            <div className="mb-3 flex items-center justify-center rounded-lg bg-secondary/30 p-6">
                {evidence.type === "photo" && evidence.thumbnailUrl ? (
                    <div className="relative h-24 w-full">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Image className="h-12 w-12 text-blue-400 opacity-50" />
                        </div>
                        <div className="text-xs text-center text-muted-foreground mt-6">
                            [Mock Image Preview]
                        </div>
                    </div>
                ) : (
                    <div className={cn("flex flex-col items-center gap-2", evidenceIconColors[evidence.type])}>
                        {evidenceIcons[evidence.type]}
                        <span className="text-xs font-medium">{evidenceTypeLabels[evidence.type]}</span>
                    </div>
                )}
            </div>

            {/* File info */}
            <div className="space-y-1">
                <p className="text-sm font-medium text-foreground truncate" title={evidence.filename}>
                    {evidence.filename}
                </p>
                <p className="text-xs text-muted-foreground">
                    {formatBytes(evidence.sizeBytes)}
                </p>
                {evidence.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                        {evidence.description}
                    </p>
                )}
                <p className="text-xs text-muted-foreground">
                    Por {evidence.uploadedByName}
                </p>
                <p className="text-xs text-muted-foreground">
                    {format(new Date(evidence.uploadedAt), "d MMM yyyy HH:mm", { locale: es })}
                </p>
            </div>

            {/* Actions */}
            <div className="mt-3 flex items-center gap-2">
                <button
                    type="button"
                    className="flex flex-1 items-center justify-center gap-1 rounded bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                >
                    <Download className="h-3 w-3" />
                    Descargar
                </button>

                {canDelete && onDelete && (
                    <button
                        type="button"
                        onClick={() => onDelete(evidence.id)}
                        className="flex items-center justify-center gap-1 rounded bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
                    >
                        <Trash2 className="h-3 w-3" />
                    </button>
                )}
            </div>
        </div>
    )
}
