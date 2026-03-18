"use client"

import React from "react"
import { MrwOpticalLogo } from "@/components/icons/mrw-optical-logo"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useRole } from "@/contexts/role-context"
import type { UserRole } from "@/types/roles"
import {
  LayoutDashboard,
  Users,
  CreditCard,
  GlobeIcon,
  LifeBuoy,
  Settings,
  Wifi,
  X,
  CalendarDays,
  ClipboardCheck,
  Signal,
  Receipt,
  WifiIcon,
  Banknote,
  ClipboardList,
  BookOpen,
  Building2,
  UserCog,
  Ticket,
  Wrench as WrenchIcon,
  FileText,
  Globe, // Added import for Globe
  Map as MapIcon,
  LogOut,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  roles: UserRole[]
  prefetch?: boolean
}

const navItems: NavItem[] = [
  // Admin nav
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ["admin"],
  },
  {
    label: "Clientes",
    href: "/dashboard/clients",
    icon: <Users className="h-5 w-5" />,
    roles: ["admin"],
  },
  {
    label: "Facturacion",
    href: "/dashboard/billing",
    icon: <CreditCard className="h-5 w-5" />,
    roles: ["admin"],
  },
  {
    label: "Red",
    href: "/dashboard/network",
    icon: <GlobeIcon className="h-5 w-5" />,
    roles: ["admin"],
  },
  {
    label: "Mapa NOC",
    href: "/dashboard/network/map",
    icon: <MapIcon className="h-5 w-5" />,
    roles: ["admin"],
    prefetch: false,
  },
  {
    label: "Soporte",
    href: "/dashboard/support",
    icon: <LifeBuoy className="h-5 w-5" />,
    roles: ["admin"],
  },
  {
    label: "Equipo",
    href: "/dashboard/team",
    icon: <UserCog className="h-5 w-5" />,
    roles: ["admin"],
  },
  {
    label: "Concesiones",
    href: "/dashboard/concessions",
    icon: <Building2 className="h-5 w-5" />,
    roles: ["admin"],
  },
  {
    label: "Configuracion",
    href: "/dashboard/settings",
    icon: <Settings className="h-5 w-5" />,
    roles: ["admin"],
  },
  // Installer nav
  {
    label: "Mi agenda",
    href: "/dashboard/installer",
    icon: <CalendarDays className="h-5 w-5" />,
    roles: ["installer"],
  },
  {
    label: "Instalaciones",
    href: "/dashboard/installer/jobs",
    icon: <ClipboardCheck className="h-5 w-5" />,
    roles: ["installer"],
  },
  {
    label: "Configuracion",
    href: "/dashboard/settings",
    icon: <Settings className="h-5 w-5" />,
    roles: ["installer"],
  },
  // Collector nav
  {
    label: "Mis cobros",
    href: "/dashboard/collector",
    icon: <Banknote className="h-5 w-5" />,
    roles: ["collector"],
  },
  {
    label: "Historial",
    href: "/dashboard/collector/history",
    icon: <BookOpen className="h-5 w-5" />,
    roles: ["collector"],
  },
  {
    label: "Codigos cautivo",
    href: "/dashboard/collector/captive-codes",
    icon: <Ticket className="h-5 w-5" />,
    roles: ["collector"],
  },
  {
    label: "Corte de caja",
    href: "/dashboard/collector/cashcut",
    icon: <ClipboardList className="h-5 w-5" />,
    roles: ["collector"],
  },
  {
    label: "Configuracion",
    href: "/dashboard/settings",
    icon: <Settings className="h-5 w-5" />,
    roles: ["collector"],
  },
  // Client nav
  {
    label: "Mi servicio",
    href: "/dashboard/portal",
    icon: <Signal className="h-5 w-5" />,
    roles: ["client"],
  },
  {
    label: "Mi red WiFi",
    href: "/dashboard/portal/wifi",
    icon: <WifiIcon className="h-5 w-5" />,
    roles: ["client"],
  },
  {
    label: "Pagos",
    href: "/dashboard/portal/payments",
    icon: <Receipt className="h-5 w-5" />,
    roles: ["client"],
  },
  {
    label: "Metodos de pago",
    href: "/dashboard/portal/payment-methods",
    icon: <CreditCard className="h-5 w-5" />,
    roles: ["client"],
  },
  {
    label: "Configuracion",
    href: "/dashboard/settings",
    icon: <Settings className="h-5 w-5" />,
    roles: ["client"],
  },
  // Concession Client nav
  {
    label: "Mi infraestructura",
    href: "/dashboard/concession-portal",
    icon: <Building2 className="h-5 w-5" />,
    roles: ["concession_client"],
  },
  {
    label: "Facturas",
    href: "/dashboard/concession-portal/invoices",
    icon: <FileText className="h-5 w-5" />,
    roles: ["concession_client"],
  },
  {
    label: "Herramientas",
    href: "/dashboard/concession-portal/tools",
    icon: <WrenchIcon className="h-5 w-5" />,
    roles: ["concession_client"],
  },
  {
    label: "Configuracion",
    href: "/dashboard/settings",
    icon: <Settings className="h-5 w-5" />,
    roles: ["concession_client"],
  },
  // Captive Portal Client nav
  {
    label: "Mi acceso",
    href: "/dashboard/captive",
    icon: <Globe className="h-5 w-5" />,
    roles: ["captive_client"],
  },
  {
    label: "Mis codigos",
    href: "/dashboard/captive/codes",
    icon: <Ticket className="h-5 w-5" />,
    roles: ["captive_client"],
  },
  // DEV role nav
  {
    label: "Dashboard",
    href: "/dashboard/dev",
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ["dev"],
  },
  {
    label: "Inbox de tareas",
    href: "/dashboard/dev/tasks",
    icon: <ClipboardList className="h-5 w-5" />,
    roles: ["dev"],
  },
]

interface SidebarNavProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
  collapsed?: boolean
}

export function SidebarNav({ mobileOpen, onMobileClose, collapsed = false }: SidebarNavProps) {
  const pathname = usePathname()
  const { role } = useRole()

  const filteredItems = navItems.filter((item) => item.roles.includes(role))

  const renderSidebarContent = (isDesktopCollapsed: boolean, isMobile: boolean) => (
    <div className="flex h-full flex-col">
      {/* Header Area (Only visible on mobile for the close button) */}
      <div className={cn(
        "flex shrink-0 items-center justify-end px-4",
        isDesktopCollapsed && !isMobile ? "hidden" : "h-14"
      )}>
        {isMobile && (
          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-lg p-1.5 text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-sidebar-border">
        {filteredItems.map((item) => {
          const isActive =
            item.href === "/dashboard" ||
              item.href === "/dashboard/installer" ||
              item.href === "/dashboard/portal" ||
              item.href === "/dashboard/collector" ||
              item.href === "/dashboard/concession-portal" ||
              item.href === "/dashboard/captive"
              ? pathname === item.href
              : pathname.startsWith(item.href)

          const isItemCollapsed = isDesktopCollapsed && !isMobile;

          const LinkComponent = (
            <Link
              href={item.href}
              prefetch={item.prefetch}
              onClick={onMobileClose}
              className={cn(
                "flex items-center rounded-lg py-2.5 text-sm font-medium transition-all duration-200",
                isItemCollapsed ? "justify-center px-0" : "gap-3 px-3",
                isActive
                  ? "bg-primary/20 text-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <span className="shrink-0">{item.icon}</span>
              {!isItemCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )

          if (isItemCollapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  {LinkComponent}
                </TooltipTrigger>
                <TooltipContent side="right">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            )
          }

          return <React.Fragment key={item.href}>{LinkComponent}</React.Fragment>
        })}
      </nav>

      {/* Logout Button */}
      <div className={cn("shrink-0 p-2 mt-auto border-t border-sidebar-border/50")}>
        {isDesktopCollapsed && !isMobile ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-center rounded-lg py-2.5 text-sm font-medium transition-all duration-200 text-red-500 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20"
              >
                <LogOut className="h-5 w-5 shrink-0" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Cerrar sesión</TooltipContent>
          </Tooltip>
        ) : (
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 text-red-500 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className="truncate">Cerrar sesión</span>
          </button>
        )}
      </div>
    </div>
  )

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/80 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Desktop sidebar */}
      <aside className={cn(
        "fixed left-4 top-24 bottom-4 z-30 hidden flex-col rounded-xl border border-sidebar-border bg-gradient-to-br from-zinc-900/95 via-[#0a0a0a]/98 to-black/95 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 lg:flex",
        collapsed ? "w-16" : "w-60"
      )}>
        {renderSidebarContent(collapsed, false)}
      </aside>

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed left-4 top-24 bottom-4 z-40 flex w-64 flex-col rounded-xl border border-sidebar-border bg-gradient-to-br from-zinc-900/95 via-[#0a0a0a]/98 to-black/95 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-[120%]"
        )}
      >
        {renderSidebarContent(false, true)}
      </aside>
    </TooltipProvider>
  )
}
