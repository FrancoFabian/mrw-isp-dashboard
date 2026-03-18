"use client"

import React from "react"
import { Globe, Satellite, Loader2 } from "lucide-react"
import { useIsMobile, useIsTablet } from "@/hooks/use-media-query"
import { BASE_MAP_OPTIONS, type BaseMapStyle } from "@/components/network/map/baseMapStyles"

/* ══════════════════════════════════════════════════════════
   Icon map
   ══════════════════════════════════════════════════════════ */
const STYLE_ICON: Record<BaseMapStyle, React.ElementType> = {
    dataviz: Globe,
    satellite: Satellite,
}

/* ══════════════════════════════════════════════════════════
   Desktop segmented control (≥1024px)
   ══════════════════════════════════════════════════════════ */
function DesktopSegmented({
    currentStyle,
    isSwitching,
    onSwitch,
}: {
    currentStyle: BaseMapStyle
    isSwitching: boolean
    onSwitch: (style: BaseMapStyle) => void
}) {
    return (
        <div className="flex items-center rounded-full border border-zinc-800/80 bg-[#0a0a0a]/85 p-0.5 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            {BASE_MAP_OPTIONS.map((opt) => {
                const Icon = STYLE_ICON[opt.id]
                const isActive = currentStyle === opt.id
                return (
                    <button
                        key={opt.id}
                        type="button"
                        disabled={isSwitching}
                        aria-label={`Cambiar a mapa ${opt.label}`}
                        aria-pressed={isActive}
                        onClick={() => onSwitch(opt.id)}
                        className={`relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition-all duration-300 ${isActive
                                ? "bg-linear-to-br from-zinc-800 from-40% to-sky-600/40 text-sky-300 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.05),0_2px_10px_rgba(56,189,248,0.15)]"
                                : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
                            } disabled:pointer-events-none disabled:opacity-50`}
                    >
                        <Icon size={14} className={isActive ? "drop-shadow-[0_0_8px_currentColor]" : "opacity-60"} />
                        {opt.label}
                    </button>
                )
            })}
            {isSwitching && (
                <Loader2 size={14} className="ml-1 mr-1 animate-spin text-sky-400" />
            )}
        </div>
    )
}

/* ══════════════════════════════════════════════════════════
   Tablet compact pill (768–1023px)
   ══════════════════════════════════════════════════════════ */
function TabletCompact({
    currentStyle,
    isSwitching,
    onSwitch,
}: {
    currentStyle: BaseMapStyle
    isSwitching: boolean
    onSwitch: (style: BaseMapStyle) => void
}) {
    return (
        <div className="flex items-center rounded-full border border-zinc-800/80 bg-[#0a0a0a]/85 p-0.5 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            {BASE_MAP_OPTIONS.map((opt) => {
                const Icon = STYLE_ICON[opt.id]
                const isActive = currentStyle === opt.id
                return (
                    <button
                        key={opt.id}
                        type="button"
                        disabled={isSwitching}
                        aria-label={`Cambiar a mapa ${opt.label}`}
                        aria-pressed={isActive}
                        onClick={() => onSwitch(opt.id)}
                        className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-bold transition-all duration-300 ${isActive
                                ? "bg-linear-to-br from-zinc-800 from-40% to-sky-600/40 text-sky-300 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.05),0_2px_10px_rgba(56,189,248,0.15)]"
                                : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
                            } disabled:pointer-events-none disabled:opacity-50`}
                    >
                        {isSwitching && isActive ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Icon size={14} className={isActive ? "drop-shadow-[0_0_8px_currentColor]" : "opacity-60"} />
                        )}
                        {opt.shortLabel}
                    </button>
                )
            })}
        </div>
    )
}

/* ══════════════════════════════════════════════════════════
   Mobile stacked buttons (<768px)
   ══════════════════════════════════════════════════════════ */
function MobileButtons({
    currentStyle,
    isSwitching,
    onSwitch,
}: {
    currentStyle: BaseMapStyle
    isSwitching: boolean
    onSwitch: (style: BaseMapStyle) => void
}) {
    return (
        <div className="flex flex-col gap-1 rounded-xl border border-zinc-800/80 bg-[#0a0a0a]/85 p-1 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            {BASE_MAP_OPTIONS.map((opt) => {
                const Icon = STYLE_ICON[opt.id]
                const isActive = currentStyle === opt.id
                return (
                    <button
                        key={opt.id}
                        type="button"
                        disabled={isSwitching}
                        aria-label={`Cambiar a mapa ${opt.label}`}
                        aria-pressed={isActive}
                        onClick={() => onSwitch(opt.id)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 ${isActive
                                ? "bg-linear-to-br from-zinc-800 from-40% to-sky-600/40 text-sky-300 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.05),0_2px_10px_rgba(56,189,248,0.15)]"
                                : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
                            } disabled:pointer-events-none disabled:opacity-50`}
                    >
                        {isSwitching && isActive ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Icon size={14} className={isActive ? "drop-shadow-[0_0_8px_currentColor]" : "opacity-60"} />
                        )}
                    </button>
                )
            })}
        </div>
    )
}

/* ══════════════════════════════════════════════════════════
   MAIN EXPORTED COMPONENT
   ══════════════════════════════════════════════════════════ */
interface BaseMapToggleProps {
    currentStyle: BaseMapStyle
    isSwitching: boolean
    onSwitch: (style: BaseMapStyle) => void
}

function BaseMapToggleInner({ currentStyle, isSwitching, onSwitch }: BaseMapToggleProps) {
    const isMobile = useIsMobile()
    const isTablet = useIsTablet()

    if (isMobile) {
        return <MobileButtons currentStyle={currentStyle} isSwitching={isSwitching} onSwitch={onSwitch} />
    }

    if (isTablet) {
        return <TabletCompact currentStyle={currentStyle} isSwitching={isSwitching} onSwitch={onSwitch} />
    }

    return <DesktopSegmented currentStyle={currentStyle} isSwitching={isSwitching} onSwitch={onSwitch} />
}

export const BaseMapToggle = React.memo(BaseMapToggleInner)
