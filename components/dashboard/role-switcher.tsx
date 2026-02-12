"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useRole } from "@/contexts/role-context"
import { cn } from "@/lib/utils"
import { ChevronDown, Shield, Wrench, User, Check, Banknote, Building2, Globe } from "lucide-react"
import type { UserRole } from "@/types/roles"
import { roleLabels, roleDescriptions } from "@/types/roles"

const roleIcons: Record<UserRole, React.ReactNode> = {
  admin: <Shield className="h-4 w-4" />,
  installer: <Wrench className="h-4 w-4" />,
  collector: <Banknote className="h-4 w-4" />,
  client: <User className="h-4 w-4" />,
  concession_client: <Building2 className="h-4 w-4" />,
  captive_client: <Globe className="h-4 w-4" />,
}

const roleColors: Record<UserRole, string> = {
  admin: "bg-primary text-primary-foreground",
  installer: "bg-cyan-600 text-white",
  collector: "bg-amber-600 text-white",
  client: "bg-emerald-600 text-white",
  concession_client: "bg-violet-600 text-white",
  captive_client: "bg-rose-600 text-white",
}

const roleRedirects: Record<UserRole, string> = {
  admin: "/dashboard",
  installer: "/dashboard/installer",
  collector: "/dashboard/collector",
  client: "/dashboard/portal",
  concession_client: "/dashboard/concession-portal",
  captive_client: "/dashboard/captive",
}

export function RoleSwitcher() {
  const { role, user, setRole } = useRole()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const initials = `${user.firstName[0]}${user.lastName[0]}`

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-secondary sm:gap-3 sm:pr-2"
      >
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
            roleColors[role]
          )}
        >
          {initials}
        </div>
        <div className="hidden text-left text-sm sm:block">
          <p className="font-medium text-foreground">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-muted-foreground">{roleLabels[role]}</p>
        </div>
        <ChevronDown
          className={cn(
            "hidden h-4 w-4 text-muted-foreground transition-transform sm:block",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Cambiar rol
            </p>
          </div>
          <div className="p-1.5">
            {(["admin", "installer", "collector", "client", "concession_client", "captive_client"] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRole(r)
                  setOpen(false)
                  router.push(roleRedirects[r])
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                  role === r
                    ? "bg-primary/10"
                    : "hover:bg-secondary"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    role === r
                      ? "bg-primary/20 text-primary"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {roleIcons[r]}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      role === r ? "text-primary" : "text-foreground"
                    )}
                  >
                    {roleLabels[r]}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {roleDescriptions[r]}
                  </p>
                </div>
                {role === r && (
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
