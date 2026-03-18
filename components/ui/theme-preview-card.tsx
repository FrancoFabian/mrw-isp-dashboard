import React from "react"
import { Moon, Sun, Monitor } from "lucide-react"

export type ThemeType = "light" | "dark" | "system"

export interface ThemePreviewCardProps {
    theme: ThemeType
    isActive: boolean
    onClick: () => void
}

export function ThemePreviewCard({ theme, isActive, onClick }: ThemePreviewCardProps) {
    const renderLightMock = () => (
        <div className="w-full h-28 rounded-t-xl bg-white flex flex-col px-3 py-3 gap-3 border border-b-0 border-zinc-200 mt-auto">
            <div className="flex gap-2 w-full">
                <div className="h-2.5 w-8 rounded-full bg-zinc-200"></div>
                <div className="h-2.5 w-20 rounded-full bg-zinc-200"></div>
            </div>
            <div className="flex gap-3 flex-1">
                <div className="flex flex-col gap-2.5 w-[35%] mt-1">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-zinc-200 shrink-0"></div>
                            <div className="h-2.5 w-full rounded-full bg-zinc-200"></div>
                        </div>
                    ))}
                </div>
                <div className="flex-1 rounded-lg bg-zinc-100 border border-zinc-100/50"></div>
            </div>
        </div>
    )

    const renderDarkMock = () => (
        <div className="w-full h-28 rounded-t-xl bg-black flex flex-col px-3 py-3 gap-3 border border-b-0 border-zinc-800/80 mt-auto">
            <div className="flex gap-2 w-full">
                <div className="h-2.5 w-8 rounded-full bg-zinc-800"></div>
                <div className="h-2.5 w-20 rounded-full bg-zinc-800"></div>
            </div>
            <div className="flex gap-3 flex-1">
                <div className="flex flex-col gap-2.5 w-[35%] mt-1">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-zinc-800 shrink-0"></div>
                            <div className="h-2.5 w-full rounded-full bg-zinc-800"></div>
                        </div>
                    ))}
                </div>
                <div className="flex-1 rounded-lg bg-[#09090b] border border-zinc-800/50"></div>
            </div>
        </div>
    )

    const renderSystemMock = () => (
        <div className="w-full h-28 rounded-t-xl bg-linear-to-br from-zinc-200 via-zinc-600 to-black flex flex-col px-3 py-3 gap-3 border border-b-0 border-zinc-700/80 mt-auto relative">
            {/* Overlay to normalize contrast slightly */}
            <div className="absolute inset-0 bg-black/10 rounded-t-xl"></div>

            <div className="flex gap-2 w-full relative z-10">
                <div className="h-2.5 w-8 rounded-full bg-zinc-400/50 backdrop-blur-sm"></div>
                <div className="h-2.5 w-20 rounded-full bg-zinc-400/50 backdrop-blur-sm"></div>
            </div>
            <div className="flex gap-3 flex-1 relative z-10">
                <div className="flex flex-col gap-2.5 w-[35%] mt-1">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-zinc-400/50 backdrop-blur-sm shrink-0"></div>
                            <div className="h-2.5 w-full rounded-full bg-zinc-400/50 backdrop-blur-sm"></div>
                        </div>
                    ))}
                </div>
                <div className="flex-1 rounded-lg bg-zinc-500/20 backdrop-blur-md border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"></div>
            </div>
        </div>
    )

    const getIcon = () => {
        switch (theme) {
            case "light": return <Sun size={16} />
            case "dark": return <Moon size={16} />
            case "system": return <Monitor size={16} />
        }
    }

    const getLabel = () => {
        switch (theme) {
            case "light": return "Claro"
            case "dark": return "Oscuro"
            case "system": return "Sistema"
        }
    }

    const getMockUI = () => {
        switch (theme) {
            case "light": return renderLightMock()
            case "dark": return renderDarkMock()
            case "system": return renderSystemMock()
        }
    }

    return (
        <button
            onClick={onClick}
            className={`
                relative pt-4 px-4 pb-0 rounded-2xl border text-left transition-all flex flex-col overflow-hidden 
                ${isActive
                    ? 'border-blue-500 bg-[#0a0a0c] shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                    : 'border-zinc-800/80 bg-[#050505] hover:bg-[#0a0a0c]'
                }
            `}
        >
            <div className="flex items-center justify-between w-full mb-4">
                <span className="font-medium text-white flex items-center gap-2">
                    {getIcon()} {getLabel()}
                </span>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isActive ? 'border-blue-500' : 'border-zinc-700'}`}>
                    {isActive && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                </div>
            </div>
            {getMockUI()}
        </button>
    )
}
