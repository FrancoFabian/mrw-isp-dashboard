"use client"

import { cn } from "@/lib/utils"
import type { Evidence } from "@/types/evidence"
import { EvidenceCard } from "./EvidenceCard"
import { Upload, FileUp } from "lucide-react"

interface EvidenceGalleryProps {
    evidence: Evidence[]
    onDelete?: (evidenceId: string) => void
    canDelete?: boolean
    canUpload?: boolean
    onUpload?: () => void
    className?: string
}

export function EvidenceGallery({
    evidence,
    onDelete,
    canDelete = false,
    canUpload = false,
    onUpload,
    className,
}: EvidenceGalleryProps) {
    return (
        <div className={cn("space-y-4", className)}>
            {/* Header with upload button */}
            {canUpload && (
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-foreground">
                            Evidencias ({evidence.length})
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Fotos, documentos y firmas de la instalación
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onUpload}
                        className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        <Upload className="h-4 w-4" />
                        Subir evidencia
                    </button>
                </div>
            )}

            {/* Evidence grid */}
            {evidence.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {evidence.map((item) => (
                        <EvidenceCard
                            key={item.id}
                            evidence={item}
                            onDelete={onDelete}
                            canDelete={canDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="glass-card flex flex-col items-center justify-center p-12 text-center">
                    <FileUp className="h-10 w-10 text-muted-foreground/30" />
                    <p className="mt-3 text-sm text-muted-foreground">
                        {canUpload
                            ? "No hay evidencias. Haz clic en 'Subir evidencia' para agregar."
                            : "No hay evidencias adjuntas"}
                    </p>
                </div>
            )}
        </div>
    )
}
