"use client"

import React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  User,
  Shield,
  Bell,
  Sliders,
  HelpCircle,
  LogOut,
  Save,
} from "lucide-react"

type SettingsTab = "profile" | "security" | "notifications" | "preferences" | "help"

const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Perfil", icon: <User className="h-4 w-4" /> },
  { id: "security", label: "Seguridad", icon: <Shield className="h-4 w-4" /> },
  { id: "notifications", label: "Notificaciones", icon: <Bell className="h-4 w-4" /> },
  { id: "preferences", label: "Preferencias", icon: <Sliders className="h-4 w-4" /> },
  { id: "help", label: "Ayuda y soporte", icon: <HelpCircle className="h-4 w-4" /> },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Configuracion
        </h1>
        <p className="text-sm text-muted-foreground">
          Administra tu perfil, seguridad y preferencias del sistema
        </p>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar tabs */}
        <div className="lg:col-span-1">
          <nav className="glass-card space-y-1 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
            <div className="my-2 border-t border-border" />
            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesion
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === "profile" && <ProfileSection />}
          {activeTab === "security" && <SecuritySection />}
          {activeTab === "notifications" && <NotificationsSection />}
          {activeTab === "preferences" && <PreferencesSection />}
          {activeTab === "help" && <HelpSection />}
        </div>
      </div>
    </div>
  )
}

function ProfileSection() {
  return (
    <div className="glass-card p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Perfil</h2>
        <p className="text-sm text-muted-foreground">
          Informacion de tu ISP y cuenta de administrador
        </p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
          AM
        </div>
        <div>
          <p className="text-foreground font-medium">Administrador</p>
          <p className="text-sm text-muted-foreground">admin@miisp.com.mx</p>
          <button
            type="button"
            className="mt-1 rounded-lg bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
          >
            Cambiar foto
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="firstName" className="text-sm text-muted-foreground">Nombre</label>
          <input
            id="firstName"
            type="text"
            defaultValue="Administrador"
            className="h-9 w-full rounded-lg border border-input bg-secondary px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="lastName" className="text-sm text-muted-foreground">Apellido</label>
          <input
            id="lastName"
            type="text"
            defaultValue="ISP"
            className="h-9 w-full rounded-lg border border-input bg-secondary px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm text-muted-foreground">Email</label>
          <input
            id="email"
            type="email"
            defaultValue="admin@miisp.com.mx"
            className="h-9 w-full rounded-lg border border-input bg-secondary px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-sm text-muted-foreground">Telefono</label>
          <input
            id="phone"
            type="tel"
            defaultValue="+52 55 1234 5678"
            className="h-9 w-full rounded-lg border border-input bg-secondary px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="ispName" className="text-sm text-muted-foreground">Nombre del ISP</label>
          <input
            id="ispName"
            type="text"
            defaultValue="Mi ISP - Internet para todos"
            className="h-9 w-full rounded-lg border border-input bg-secondary px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <Save className="h-4 w-4" />
        Guardar cambios
      </button>
    </div>
  )
}

function SecuritySection() {
  return (
    <div className="space-y-4">
      <div className="glass-card p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Cambiar contrasena</h2>
          <p className="text-sm text-muted-foreground">
            Actualiza tu contrasena regularmente para mantener tu cuenta segura
          </p>
        </div>
        <div className="max-w-md space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="currentPass" className="text-sm text-muted-foreground">Contrasena actual</label>
            <input
              id="currentPass"
              type="password"
              className="h-9 w-full rounded-lg border border-input bg-secondary px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="newPass" className="text-sm text-muted-foreground">Nueva contrasena</label>
            <input
              id="newPass"
              type="password"
              className="h-9 w-full rounded-lg border border-input bg-secondary px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="confirmPass" className="text-sm text-muted-foreground">Confirmar contrasena</label>
            <input
              id="confirmPass"
              type="password"
              className="h-9 w-full rounded-lg border border-input bg-secondary px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="button"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Actualizar contrasena
          </button>
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Reglas de suspension automatica</h2>
          <p className="text-sm text-muted-foreground">
            Define cuando suspender automaticamente a clientes que no paguen
          </p>
        </div>
        <div className="max-w-md space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="suspDays" className="text-sm text-muted-foreground">
              Dias de gracia despues del vencimiento
            </label>
            <input
              id="suspDays"
              type="number"
              defaultValue={5}
              className="h-9 w-full rounded-lg border border-input bg-secondary px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground">
              Si el cliente no paga en este numero de dias despues de su fecha de corte, su servicio sera suspendido automaticamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function NotificationsSection() {
  const notifications = [
    { id: "pay_received", label: "Pago recibido", description: "Cuando un cliente realiza un pago", defaultOn: true },
    { id: "pay_overdue", label: "Pago vencido", description: "Cuando un pago pasa de su fecha limite", defaultOn: true },
    { id: "node_offline", label: "Nodo sin conexion", description: "Cuando un equipo de red se desconecta", defaultOn: true },
    { id: "ticket_new", label: "Nuevo ticket", description: "Cuando un cliente abre un ticket de soporte", defaultOn: true },
    { id: "client_risk", label: "Cliente en riesgo", description: "Cuando un cliente esta proximo a vencimiento sin pagar", defaultOn: false },
  ]

  return (
    <div className="glass-card p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Notificaciones</h2>
        <p className="text-sm text-muted-foreground">
          Elige que alertas quieres recibir
        </p>
      </div>
      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{n.label}</p>
              <p className="text-xs text-muted-foreground">{n.description}</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center" htmlFor={`notif-${n.id}`}>
              <input
                id={`notif-${n.id}`}
                type="checkbox"
                defaultChecked={n.defaultOn}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-secondary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-muted-foreground after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:bg-primary-foreground" />
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

function PreferencesSection() {
  return (
    <div className="glass-card p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Preferencias</h2>
        <p className="text-sm text-muted-foreground">
          Personaliza como funciona tu panel de administracion
        </p>
      </div>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label htmlFor="lang" className="text-sm text-muted-foreground">Idioma</label>
          <select
            id="lang"
            defaultValue="es"
            className="h-9 w-full rounded-lg border border-input bg-secondary px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="es">Espanol</option>
            <option value="en">English</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="tz" className="text-sm text-muted-foreground">Zona horaria</label>
          <select
            id="tz"
            defaultValue="america_mexico"
            className="h-9 w-full rounded-lg border border-input bg-secondary px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="america_mexico">America/Mexico City (UTC-6)</option>
            <option value="america_cancun">America/Cancun (UTC-5)</option>
            <option value="america_tijuana">America/Tijuana (UTC-8)</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="currency" className="text-sm text-muted-foreground">Moneda</label>
          <select
            id="currency"
            defaultValue="mxn"
            className="h-9 w-full rounded-lg border border-input bg-secondary px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="mxn">MXN - Peso Mexicano</option>
            <option value="usd">USD - Dolar Estadounidense</option>
          </select>
        </div>
      </div>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <Save className="h-4 w-4" />
        Guardar preferencias
      </button>
    </div>
  )
}

function HelpSection() {
  return (
    <div className="glass-card p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Ayuda y soporte</h2>
        <p className="text-sm text-muted-foreground">
          Recursos para aprender a usar el panel de administracion
        </p>
      </div>
      <div className="space-y-3">
        <div className="rounded-lg bg-secondary/30 p-4">
          <h3 className="text-sm font-medium text-foreground">Como gestionar clientes</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Desde la seccion &quot;Clientes&quot; puedes ver todos tus clientes, filtrarlos por estado, ver su informacion y realizar acciones como suspender o reactivar su servicio.
          </p>
        </div>
        <div className="rounded-lg bg-secondary/30 p-4">
          <h3 className="text-sm font-medium text-foreground">Como funciona la suspension automatica</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Cuando un cliente no paga antes de su fecha de corte, el sistema lo marca como &quot;en riesgo&quot;. Si pasan los dias de gracia configurados y no paga, su servicio se suspende automaticamente.
          </p>
        </div>
        <div className="rounded-lg bg-secondary/30 p-4">
          <h3 className="text-sm font-medium text-foreground">Que significan los estados de red</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            &quot;En linea&quot; significa que el equipo funciona bien. &quot;Degradado&quot; significa que hay problemas de rendimiento. &quot;Sin conexion&quot; significa que el equipo no responde y los clientes conectados no tienen servicio.
          </p>
        </div>
      </div>
    </div>
  )
}
