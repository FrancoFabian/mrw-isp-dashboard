"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { MessageCircle } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { SileoToaster } from "@/components/ui/sileo-toaster"
import { useRole } from "@/contexts/role-context"
import { isChatRouteExcluded } from "@/helpers/routeToSection"
import { ChatPanel } from "./ChatPanel"

export function FeedbackChatWidget() {
    const [open, setOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const { role, user } = useRole()
    const pathname = usePathname()

    // Drag state definitions via refs to avoid re-renders
    const buttonRef = useRef<HTMLButtonElement>(null)
    const isDragging = useRef(false)
    const dragStart = useRef({ x: 0, y: 0 })
    const lastPos = useRef({ x: 0, y: 0 })
    const bounds = useRef({ minX: 0, maxX: 0, minY: 0, maxY: 0 })

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted || isChatRouteExcluded(pathname)) {
        return null
    }

    const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
        if (!buttonRef.current) return
        isDragging.current = false
        dragStart.current = { x: e.clientX, y: e.clientY }
        buttonRef.current.setPointerCapture(e.pointerId)
        buttonRef.current.style.cursor = "grabbing"

        // Calculate boundaries dynamically
        const rect = buttonRef.current.getBoundingClientRect()
        const isDesktop = window.innerWidth >= 1024

        // Navbar is ~80px (top-4 + h-16 = 16px + 64px = 80px), safe margin at 90px
        const minTop = 90
        // Sidebar max is 272px (left-4 + w-64 = 272px), safe margin at 285px. Mobile is 16px.
        const minLeft = isDesktop ? 285 : 16
        // Edges of viewport
        const maxRight = window.innerWidth - 16
        const maxBottom = window.innerHeight - 16

        bounds.current = {
            minX: minLeft - rect.left,
            maxX: maxRight - rect.right,
            minY: minTop - rect.top,
            maxY: maxBottom - rect.bottom
        }
    }

    const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
        if (!buttonRef.current || !buttonRef.current.hasPointerCapture(e.pointerId)) return

        let deltaX = e.clientX - dragStart.current.x
        let deltaY = e.clientY - dragStart.current.y

        if (!isDragging.current && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
            isDragging.current = true
        }

        if (isDragging.current) {
            deltaX = Math.max(bounds.current.minX, Math.min(deltaX, bounds.current.maxX))
            deltaY = Math.max(bounds.current.minY, Math.min(deltaY, bounds.current.maxY))

            const newX = lastPos.current.x + deltaX
            const newY = lastPos.current.y + deltaY
            // Direct DOM update avoiding any React re-render queue
            buttonRef.current.style.translate = `${newX}px ${newY}px`
        }
    }

    const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
        if (!buttonRef.current) return
        if (buttonRef.current.hasPointerCapture(e.pointerId)) {
            buttonRef.current.releasePointerCapture(e.pointerId)
        }
        buttonRef.current.style.cursor = "pointer"

        if (isDragging.current) {
            let deltaX = e.clientX - dragStart.current.x
            let deltaY = e.clientY - dragStart.current.y

            deltaX = Math.max(bounds.current.minX, Math.min(deltaX, bounds.current.maxX))
            deltaY = Math.max(bounds.current.minY, Math.min(deltaY, bounds.current.maxY))

            lastPos.current = {
                x: lastPos.current.x + deltaX,
                y: lastPos.current.y + deltaY
            }
        }
    }

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (isDragging.current) {
            e.preventDefault()
            e.stopPropagation()
            return
        }
        setOpen(true)
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <button
                ref={buttonRef}
                type="button"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onClick={handleClick}
                className="fixed bottom-6 right-6 z-20 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors duration-200 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background touch-none"
                aria-label="Abrir chat de feedback"
            >
                <MessageCircle className="pointer-events-none h-6 w-6" />
            </button>
            <SheetContent
                side="right"
                className="flex w-full flex-col p-0 sm:max-w-md"
                onInteractOutside={(event) => {
                    const target = event.target as HTMLElement | null
                    if (target?.closest("[data-sileo-viewport]")) {
                        event.preventDefault()
                    }
                }}
            >
                <SileoToaster />
                <SheetHeader className="border-b border-border px-4 py-3">
                    <SheetTitle className="flex items-center gap-2 text-lg">
                        <MessageCircle className="h-5 w-5 text-primary" />
                        Feedback y Sugerencias
                    </SheetTitle>
                </SheetHeader>
                <ChatPanel
                    role={role}
                    pathname={pathname}
                    userName={`${user.firstName} ${user.lastName}`.trim()}
                    onClose={() => setOpen(false)}
                />
            </SheetContent>
        </Sheet>
    )
}
