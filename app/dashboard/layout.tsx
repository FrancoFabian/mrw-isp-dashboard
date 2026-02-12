"use client"

import React, { Suspense } from "react"

import { useState } from "react"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { RoleSwitcher } from "@/components/dashboard/role-switcher"
import { RoleProvider } from "@/contexts/role-context"
import { TasksProvider } from "@/stores/tasks-context"
import { ChatProvider } from "@/stores/chat-context"
import { NetworkProvider } from "@/stores/network-context"
import { FeedbackChatWidget } from "@/components/feedback/FeedbackChatWidget"
import { Bell, Menu, Search } from "lucide-react"
import { useSearchParams } from "next/navigation"

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const searchParams = useSearchParams()

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className="lg:ml-60">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar..."
                className="h-9 w-48 rounded-lg border border-input bg-secondary pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary md:w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
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
  )
}

