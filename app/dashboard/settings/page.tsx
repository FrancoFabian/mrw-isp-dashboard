"use client"

import React, { useState } from "react"
import { Camera, LogOut } from "lucide-react"
import { ModernTabs } from "@/components/ui/tabs-modern"
import { ThemePreviewCard, type ThemeType } from "@/components/ui/theme-preview-card"

type SettingsTab = "profile" | "security" | "appearance" | "notifications" | "preferences" | "help"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile")

  const tabs: { id: SettingsTab; label: React.ReactNode }[] = [
    { id: "profile", label: "Perfil" },
    { id: "security", label: "Seguridad" },
    { id: "appearance", label: "Apariencia" },
    { id: "notifications", label: "Notificaciones" },
    { id: "preferences", label: "Preferencias" },
    { id: "help", label: "Ayuda" },
  ]

  // Estados para simular interactividad
  const [theme, setTheme] = useState<ThemeType>("dark")
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    translucentUI: false,
    pointerCursor: true,
    pagoRecibido: true,
    pagoVencido: true,
    nodoSinConexion: true,
    nuevoTicket: true,
    clienteEnRiesgo: false,
  })

  const handleToggle = (key: string) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const renderInput = (label: string, description: string, placeholder: string, type = "text", defaultValue = "") => (
    <div className="mb-8">
      <h3 className="text-base font-medium text-zinc-100 mb-1">{label}</h3>
      <p className="text-sm text-zinc-500 mb-3">{description}</p>
      <input
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full bg-[#09090b] border border-zinc-800/80 focus:border-blue-500 focus:bg-[#0f0f11] focus:outline-none text-zinc-100 rounded-xl px-4 py-3 transition-colors placeholder:text-zinc-600"
      />
    </div>
  )

  const renderSelect = (label: string, description: string, options: string[], defaultValue: string) => (
    <div className="mb-8">
      <h3 className="text-base font-medium text-zinc-100 mb-1">{label}</h3>
      <p className="text-sm text-zinc-500 mb-3">{description}</p>
      <div className="relative">
        <select
          defaultValue={defaultValue}
          className="w-full appearance-none bg-[#09090b] border border-zinc-800/80 focus:border-blue-500 focus:bg-[#0f0f11] focus:outline-none text-zinc-100 rounded-xl px-4 py-3 transition-colors"
        >
          {options.map((opt, i) => (
            <option key={i} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  )

  const renderToggle = (label: string, description: string, stateKey: string) => (
    <div className="flex items-center justify-between py-5 border-b border-zinc-800/50 last:border-0">
      <div>
        <h3 className="text-base font-medium text-zinc-100">{label}</h3>
        <p className="text-sm text-zinc-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => handleToggle(stateKey)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${toggles[stateKey] ? "bg-blue-600" : "bg-zinc-800"
          }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${toggles[stateKey] ? "translate-x-6" : "translate-x-1"
            }`}
        />
      </button>
    </div>
  )

  return (
    <div className="mx-auto max-w-4xl py-6 pb-16 font-sans">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-2 tracking-tight">Configuración</h1>
          <p className="text-zinc-500">Administra tu perfil, seguridad, preferencias y apariencia del sistema.</p>
        </div>
      </div>

      {/* Navigation using Custom Tab Component */}
      <div className="mb-10 w-full overflow-x-auto pb-2 scrollbar-hide">
        <ModernTabs
          tabs={tabs}
          value={activeTab}
          onChange={(val) => setActiveTab(val as SettingsTab)}
        />
      </div>

      {/* Content Area */}
      <div className="max-w-3xl">
        {/* PERFIL */}
        {activeTab === "profile" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-10">
              <h3 className="text-base font-medium text-zinc-100 mb-1">Avatar</h3>
              <p className="text-sm text-zinc-500 mb-4">Esta imagen se mostrará públicamente en tu perfil.</p>
              <div className="bg-[#09090b] border border-zinc-800/80 rounded-2xl p-4 flex items-center gap-4 w-fit">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                    AM
                  </div>
                  <button className="absolute bottom-0 right-0 bg-zinc-800 p-1.5 rounded-full border border-zinc-700 hover:bg-zinc-700 transition-colors">
                    <Camera size={14} className="text-white" />
                  </button>
                </div>
                <div className="pr-4">
                  <p className="text-zinc-100 font-medium">Administrador</p>
                  <p className="text-zinc-500 text-sm">admin@miisp.com.mx</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              {renderInput("Nombre", "Tu nombre de pila.", "Ej. Alejandro", "text", "Administrador")}
              {renderInput("Apellido", "Tus apellidos.", "Ej. Morales", "text", "ISP")}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              {renderInput("Email", "El correo asociado a tu cuenta.", "Ej. admin@ejemplo.com", "email", "admin@miisp.com.mx")}
              {renderInput("Teléfono", "Número de contacto.", "Ej. +52 55 1234 5678", "tel", "+52 55 1234 5678")}
            </div>

            {renderInput(
              "Nombre del ISP",
              "El nombre comercial de tu empresa proveedora de internet.",
              "Ej. Mi ISP - Internet para todos",
              "text",
              "Mi ISP - Internet para todos"
            )}

            <div className="mt-8">
              <button className="bg-zinc-100 hover:bg-zinc-300 text-black font-medium py-2.5 px-6 rounded-xl transition-colors">
                Actualizar Perfil
              </button>
            </div>
          </div>
        )}

        {/* SEGURIDAD */}
        {activeTab === "security" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-12">
              <h2 className="text-xl font-semibold text-zinc-100 mb-6">Cambiar contraseña</h2>
              {renderInput("Contraseña actual", "Ingresa tu contraseña actual para verificar tu identidad.", "••••••••", "password")}
              {renderInput("Nueva contraseña", "Debe tener al menos 8 caracteres.", "••••••••", "password")}
              {renderInput("Confirmar contraseña", "Vuelve a escribir la nueva contraseña.", "••••••••", "password")}

              <button className="bg-zinc-100 hover:bg-zinc-300 text-black font-medium py-2.5 px-6 rounded-xl transition-colors mt-2">
                Actualizar contraseña
              </button>
            </div>

            <div className="pt-8 border-t border-zinc-800/50">
              <h2 className="text-xl font-semibold text-zinc-100 mb-6">Reglas de suspensión automática</h2>
              {renderInput(
                "Días de gracia después del vencimiento",
                "Si el cliente no paga en este número de días después de su fecha de corte, su servicio será suspendido automáticamente.",
                "Ej. 5",
                "number",
                "5"
              )}
              <button className="bg-[#09090b] border border-zinc-800/80 hover:bg-zinc-900 text-zinc-100 font-medium py-2.5 px-6 rounded-xl transition-colors mt-2">
                Guardar reglas
              </button>
            </div>
          </div>
        )}

        {/* APARIENCIA */}
        {activeTab === "appearance" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-10">
              <h3 className="text-base font-medium text-zinc-100 mb-1">Tema</h3>
              <p className="text-sm text-zinc-500 mb-5">Cambia la apariencia del panel de administración.</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <ThemePreviewCard theme="light" isActive={theme === "light"} onClick={() => setTheme("light")} />
                <ThemePreviewCard theme="dark" isActive={theme === "dark"} onClick={() => setTheme("dark")} />
                <ThemePreviewCard theme="system" isActive={theme === "system"} onClick={() => setTheme("system")} />
              </div>
            </div>

            {renderSelect(
              "Tamaño de fuente",
              "Ajusta el tamaño de los textos en la web.",
              ["Pequeño", "Normal", "Grande", "Extra Grande"],
              "Normal"
            )}

            <div className="mt-8 space-y-2 border-t border-zinc-800/50 pt-4">
              {renderToggle(
                "Interfaz Translúcida",
                "Usa transparencia en elementos de la UI como barras laterales y diálogos modales.",
                "translucentUI"
              )}
              {renderToggle(
                "Usar cursor de puntero",
                "Cambia el cursor a una mano al pasar sobre elementos clickeables.",
                "pointerCursor"
              )}
            </div>
          </div>
        )}

        {/* NOTIFICACIONES */}
        {activeTab === "notifications" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">Notificaciones</h2>
            <p className="text-sm text-zinc-500 mb-6">Elige qué alertas quieres recibir en tu correo o panel.</p>

            <div className="bg-[#09090b] border border-zinc-800/60 rounded-2xl p-2 px-6">
              {renderToggle("Pago recibido", "Cuando un cliente realiza un pago exitoso.", "pagoRecibido")}
              {renderToggle("Pago vencido", "Cuando un pago pasa de su fecha límite.", "pagoVencido")}
              {renderToggle("Nodo sin conexión", "Cuando un equipo de red principal se desconecta.", "nodoSinConexion")}
              {renderToggle("Nuevo ticket", "Cuando un cliente abre un ticket de soporte técnico.", "nuevoTicket")}
              {renderToggle("Cliente en riesgo", "Cuando un cliente está próximo a vencimiento sin pagar.", "clienteEnRiesgo")}
            </div>
          </div>
        )}

        {/* PREFERENCIAS */}
        {activeTab === "preferences" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-semibold text-zinc-100 mb-6">Preferencias Generales</h2>

            {renderSelect(
              "Idioma",
              "El idioma en el que verás el panel de administración.",
              ["Español", "English", "Português"],
              "Español"
            )}
            {renderSelect(
              "Zona horaria",
              "Define cómo se muestran las fechas y horas en los reportes.",
              ["America/Mexico_City (UTC-6)", "America/Bogota (UTC-5)", "America/Argentina/Buenos_Aires (UTC-3)"],
              "America/Mexico_City (UTC-6)"
            )}
            {renderSelect(
              "Moneda",
              "La moneda utilizada para facturación y cobros.",
              ["MXN - Peso Mexicano", "USD - Dólar Estadounidense", "EUR - Euro"],
              "MXN - Peso Mexicano"
            )}

            <div className="mt-8">
              <button className="bg-zinc-100 hover:bg-zinc-300 text-black font-medium py-2.5 px-6 rounded-xl transition-colors">
                Guardar preferencias
              </button>
            </div>
          </div>
        )}

        {/* AYUDA */}
        {activeTab === "help" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-semibold text-zinc-100 mb-6">Centro de Ayuda y Soporte</h2>

            <div className="space-y-4">
              <a
                href="#"
                className="block bg-[#09090b] border border-zinc-800/60 hover:border-zinc-700 hover:bg-[#0c0c0e] p-6 rounded-2xl transition-all"
              >
                <h3 className="text-zinc-100 font-medium mb-2">Cómo gestionar clientes</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Desde la sección "Clientes" puedes ver todos tus clientes, filtrarlos por estado, ver su información y
                  realizar acciones como suspender o reactivar su servicio.
                </p>
              </a>

              <a
                href="#"
                className="block bg-[#09090b] border border-zinc-800/60 hover:border-zinc-700 hover:bg-[#0c0c0e] p-6 rounded-2xl transition-all"
              >
                <h3 className="text-zinc-100 font-medium mb-2">Cómo funciona la suspensión automática</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Cuando un cliente no paga antes de su fecha de corte, el sistema lo marca como "en riesgo". Si pasan los
                  días de gracia configurados en la pestaña Seguridad y no paga, su servicio se suspende automáticamente.
                </p>
              </a>

              <a
                href="#"
                className="block bg-[#09090b] border border-zinc-800/60 hover:border-zinc-700 hover:bg-[#0c0c0e] p-6 rounded-2xl transition-all"
              >
                <h3 className="text-zinc-100 font-medium mb-2">Qué significan los estados de red</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  "En línea" significa que el equipo funciona bien. "Degradado" significa que hay problemas de
                  rendimiento. "Sin conexión" significa que el equipo no responde y los clientes conectados no tienen
                  servicio.
                </p>
              </a>
            </div>

            <div className="mt-8 p-6 bg-blue-950/20 border border-blue-900/40 rounded-2xl">
              <h3 className="text-blue-400 font-medium mb-2">¿Necesitas asistencia técnica?</h3>
              <p className="text-sm text-zinc-400 mb-4">
                Nuestro equipo de soporte está disponible 24/7 para ayudarte con problemas graves.
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                Abrir ticket de soporte
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
