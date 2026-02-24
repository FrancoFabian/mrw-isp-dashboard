"use client"

import dynamic from "next/dynamic"

// Single SSR-disable point for the entire map tree
const NocMapShell = dynamic(
    () => import("@/components/network/map/NocMapShell").then((m) => m.NocMapShell),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-[calc(100vh-7rem)] items-center justify-center rounded-2xl border border-white/6 bg-slate-950/60">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500/30 border-t-sky-400" />
                    <span className="text-sm text-white/40">Cargando mapa NOC…</span>
                </div>
            </div>
        ),
    },
)

export default function NetworkMapPage() {
    return <NocMapShell />
}
