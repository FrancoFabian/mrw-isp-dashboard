"use client"

import React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { mockClients } from "@/mocks/clients"
import {
  Wifi,
  Eye,
  EyeOff,
  Copy,
  Check,
  Smartphone,
  Laptop,
  Tv,
  Gamepad2,
  Save,
  RefreshCw,
} from "lucide-react"

const currentClient = mockClients[0]

const connectedDevices = [
  { name: "iPhone de Carlos", type: "phone", ip: "192.168.1.10", signal: "Excelente" },
  { name: "MacBook Pro", type: "laptop", ip: "192.168.1.11", signal: "Excelente" },
  { name: "Smart TV Sala", type: "tv", ip: "192.168.1.12", signal: "Buena" },
  { name: "iPad Mini", type: "phone", ip: "192.168.1.13", signal: "Buena" },
  { name: "PlayStation 5", type: "game", ip: "192.168.1.14", signal: "Media" },
  { name: "Laptop trabajo", type: "laptop", ip: "192.168.1.15", signal: "Excelente" },
]

const deviceIcons: Record<string, React.ReactNode> = {
  phone: <Smartphone className="h-4 w-4" />,
  laptop: <Laptop className="h-4 w-4" />,
  tv: <Tv className="h-4 w-4" />,
  game: <Gamepad2 className="h-4 w-4" />,
}

const signalColors: Record<string, string> = {
  Excelente: "text-emerald-400",
  Buena: "text-primary",
  Media: "text-amber-400",
  Debil: "text-red-400",
}

export default function WifiManagementPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const [wifiName, setWifiName] = useState(currentClient.wifiName || "")
  const [wifiPassword, setWifiPassword] = useState(
    currentClient.wifiPassword || ""
  )

  const handleCopy = () => {
    navigator.clipboard.writeText(wifiPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Mi red WiFi
        </h1>
        <p className="text-sm text-muted-foreground">
          Administra tu red WiFi y los dispositivos conectados
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* WiFi credentials */}
        <div className="glass-card space-y-5 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Wifi className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              Datos de tu red
            </h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="wifiName"
                className="text-sm text-muted-foreground"
              >
                Nombre de la red (SSID)
              </label>
              <input
                id="wifiName"
                type="text"
                value={wifiName}
                onChange={(e) => setWifiName(e.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-secondary px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="wifiPass"
                className="text-sm text-muted-foreground"
              >
                Contrasena WiFi
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    id="wifiPass"
                    type={showPassword ? "text" : "password"}
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    className="h-9 w-full rounded-lg border border-input bg-secondary px-3 pr-20 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <div className="absolute right-1 top-1/2 flex -translate-y-1/2 gap-1">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={
                        showPassword ? "Ocultar contrasena" : "Mostrar contrasena"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label="Copiar contrasena"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Save className="h-4 w-4" />
                Guardar cambios
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
              >
                <RefreshCw className="h-4 w-4" />
                Generar nueva
              </button>
            </div>
          </div>
        </div>

        {/* Connection info */}
        <div className="glass-card space-y-4 p-4 sm:p-5">
          <h2 className="text-base font-semibold text-foreground">
            Estado de conexion
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
              <span className="text-sm text-muted-foreground">Estado</span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Conectado
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
              <span className="text-sm text-muted-foreground">IP publica</span>
              <span className="font-mono text-sm text-foreground">
                {currentClient.ip}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
              <span className="text-sm text-muted-foreground">Gateway</span>
              <span className="font-mono text-sm text-foreground">
                192.168.1.1
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
              <span className="text-sm text-muted-foreground">DNS</span>
              <span className="font-mono text-sm text-foreground">
                8.8.8.8, 8.8.4.4
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
              <span className="text-sm text-muted-foreground">Nodo</span>
              <span className="text-sm text-foreground">
                {currentClient.node}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Connected devices */}
      <div className="glass-card space-y-4 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Dispositivos conectados ({connectedDevices.length})
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {connectedDevices.map((device) => (
            <div
              key={device.ip}
              className="flex items-center gap-3 rounded-lg bg-secondary/30 px-4 py-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
                {deviceIcons[device.type]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {device.name}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {device.ip}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 text-xs font-medium",
                  signalColors[device.signal]
                )}
              >
                {device.signal}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
