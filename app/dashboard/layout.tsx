"use client"

import React, { Suspense } from "react"

import { useEffect, useState } from "react"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { MrwOpticalLogo } from "@/components/icons/mrw-optical-logo"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { RoleSwitcher } from "@/components/dashboard/role-switcher"
import { RoleProvider } from "@/contexts/role-context"
import { TasksProvider } from "@/stores/tasks-context"
import { ChatProvider } from "@/stores/chat-context"
import { NetworkProvider } from "@/stores/network-context"
import { FeedbackChatWidget } from "@/components/feedback/FeedbackChatWidget"
import { QueryProvider } from "@/components/providers/query-provider"
import { Bell, Menu, Search } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useIsNocCompact } from "@/hooks/use-media-query"
import "maplibre-gl/dist/maplibre-gl.css"
function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userCollapsed, setUserCollapsed] = useState(false)
  const isNocCompact = useIsNocCompact() // auto-collapse below 1440px
  const searchParams = useSearchParams()

  // Sidebar collapses automatically on compact viewports, or manually via hamburger
  const sidebarCollapsed = isNocCompact || userCollapsed

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        collapsed={sidebarCollapsed}
      />

      {/* Top bar (Island) */}
      <header className="fixed left-4 right-4 top-4 z-50 flex h-16 items-center justify-between rounded-xl border border-border bg-gradient-to-br from-zinc-900/95 via-[#0a0a0a]/98 to-black/95 px-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setUserCollapsed(!userCollapsed)}
            className="hidden rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:block"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo in Navbar */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <MrwOpticalLogo className="h-11 w-auto ml-1" />
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search moved to the right side */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar..."
              className="h-9 w-48 rounded-lg border border-input bg-secondary pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary md:w-64"
            />
          </div>

          <button
            type="button"
            className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
          </button>

          <RoleSwitcher />
        </div>
      </header>

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 pt-24 transition-all duration-300",
        sidebarCollapsed ? "lg:ml-22" : "lg:ml-66"
      )}>
        <main className="p-4 sm:p-6">{children}</main>
      </div>

      {/* Feedback Chat Widget - appears on all dashboard routes */}
      <FeedbackChatWidget />
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryProvider>
      <RoleProvider>
        <TasksProvider>
          <ChatProvider>
            <NetworkProvider>
              <Suspense fallback={<div>Loading...</div>}>
                <DashboardLayoutInner>{children}</DashboardLayoutInner>
              </Suspense>
            </NetworkProvider>
          </ChatProvider>
        </TasksProvider>
      </RoleProvider>
    </QueryProvider>
  )
}
