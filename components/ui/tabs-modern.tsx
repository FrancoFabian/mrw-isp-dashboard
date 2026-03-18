"use client"

import React, { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export interface TabOption {
    id: string
    label: React.ReactNode
}

export interface ModernTabsProps {
    tabs: TabOption[]
    value: string
    onChange: (id: string) => void
    className?: string
}

export function ModernTabs({ tabs, value, onChange, className }: ModernTabsProps) {
    const [pillStyle, setPillStyle] = useState({ width: 0, left: 0, opacity: 0 })
    const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({})

    useEffect(() => {
        const updatePill = () => {
            const activeItem = buttonRefs.current[value]
            if (!activeItem) return

            setPillStyle({
                width: activeItem.offsetWidth,
                left: activeItem.offsetLeft,
                opacity: 1,
            })
        }

        updatePill()
        window.addEventListener("resize", updatePill)
        return () => window.removeEventListener("resize", updatePill)
    }, [value, tabs])

    return (
        <div
            className={cn(
                "relative inline-flex w-fit max-w-full self-start overflow-x-auto overflow-y-hidden rounded-lg p-1 isolate [&::-webkit-scrollbar]:hidden bg-[hsl(var(--input-surface,0_0%_6%))] border border-[hsl(var(--input-border,0_0%_13%))]",
                className
            )}
            style={{
                "--tab-active-border": "rgba(255,255,255,0.05)",
                "--tab-active-text": "#f4f4f5", // zinc-100
                "--tab-inactive-text": "#f4f4f5", // zinc-100 (Bright when not active)
                "--tab-hover-bg": "transparent", // No background fill on hover
                "--tab-hover-text": "#71717a", // zinc-500 (Dim text when hovering)
                scrollbarWidth: "none",
                msOverflowStyle: "none",
            } as React.CSSProperties}
        >
            {/* Sliding Pill Background inside the container */}
            <div
                className="pointer-events-none absolute left-0 top-1 bottom-1 -z-10 rounded-md border border-[var(--tab-active-border)] bg-gradient-to-b from-[#18181b] to-[#000000]"
                style={{
                    width: pillStyle.width,
                    transform: `translateX(${pillStyle.left}px)`,
                    opacity: pillStyle.opacity,
                    transition: "transform 260ms cubic-bezier(0.22, 1, 0.36, 1), width 260ms cubic-bezier(0.22, 1, 0.36, 1), opacity 260ms ease",
                    willChange: "transform, width, opacity",
                }}
            />

            {tabs.map((tab) => {
                const isActive = value === tab.id
                return (
                    <button
                        key={tab.id}
                        ref={(el) => { buttonRefs.current[tab.id] = el }}
                        type="button"
                        onClick={() => onChange(tab.id)}
                        className={cn(
                            "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-[0.9rem] font-medium transition-colors duration-200 outline-none select-none",
                            isActive
                                ? "text-[var(--tab-active-text)]"
                                : "text-[var(--tab-inactive-text)] hover:text-[var(--tab-hover-text)]"
                        )}
                        // Prevent the button from creating its own stacking context unexpectedly
                        style={{ position: 'relative', zIndex: 1 }}
                    >
                        {tab.label}
                    </button>
                )
            })}
        </div>
    )
}
