"use client"

import { cn } from "@/lib/utils"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { X } from "lucide-react"

interface NetworkEntityDrawerProps {
    open: boolean
    onClose: () => void
    title: string
    description?: string
    children: React.ReactNode
    footer?: React.ReactNode
    className?: string
}

export function NetworkEntityDrawer({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    className,
}: NetworkEntityDrawerProps) {
    return (
        <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <SheetContent
                className={cn(
                    "w-full sm:max-w-lg bg-card border-border overflow-y-auto",
                    className
                )}
            >
                <SheetHeader className="space-y-1 pb-4 border-b border-border">
                    <div className="flex items-start justify-between">
                        <div>
                            <SheetTitle className="text-lg font-semibold text-foreground">
                                {title}
                            </SheetTitle>
                            {description && (
                                <SheetDescription className="text-sm text-muted-foreground mt-1">
                                    {description}
                                </SheetDescription>
                            )}
                        </div>
                    </div>
                </SheetHeader>

                <div className="py-4 space-y-4">
                    {children}
                </div>

                {footer && (
                    <div className="border-t border-border pt-4 mt-4">
                        {footer}
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}

interface DrawerSectionProps {
    title: string
    children: React.ReactNode
    className?: string
}

export function DrawerSection({ title, children, className }: DrawerSectionProps) {
    return (
        <div className={cn("space-y-2", className)}>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {title}
            </h4>
            {children}
        </div>
    )
}

interface DrawerFieldProps {
    label: string
    value: React.ReactNode
    className?: string
}

export function DrawerField({ label, value, className }: DrawerFieldProps) {
    return (
        <div className={cn("flex items-center justify-between py-1.5", className)}>
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-medium text-foreground">{value}</span>
        </div>
    )
}
