"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { MessageCircle } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { useRole } from "@/contexts/role-context"
import { ChatPanel } from "./ChatPanel"

export function FeedbackChatWidget() {
    const [open, setOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const { role, user } = useRole()
    const pathname = usePathname()

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button
                    type="button"
                    className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-200 hover:scale-105 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                    aria-label="Abrir chat de feedback"
                >
                    <MessageCircle className="h-6 w-6" />
                </button>
            </SheetTrigger>
            <SheetContent
                side="right"
                className="flex w-full flex-col p-0 sm:max-w-md"
            >
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
