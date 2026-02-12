"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import type { UserRole, UserProfile } from "@/types/roles"

const mockUsers: Record<UserRole, UserProfile> = {
  admin: {
    id: "USR-001",
    firstName: "Alejandro",
    lastName: "Morales",
    email: "admin@miisp.com.mx",
    role: "admin",
  },
  installer: {
    id: "USR-010",
    firstName: "Luis",
    lastName: "Ramirez",
    email: "luis.ramirez@miisp.com.mx",
    role: "installer",
  },
  collector: {
    id: "STF-003",
    firstName: "Ricardo",
    lastName: "Perez",
    email: "ricardo.perez@miisp.com.mx",
    role: "collector",
  },
  client: {
    id: "CLT-001",
    firstName: "Carlos",
    lastName: "Martinez",
    email: "carlos.martinez@email.com",
    role: "client",
  },
  concession_client: {
    id: "CON-CLT-001",
    firstName: "Fernando",
    lastName: "Gutierrez",
    email: "fernando.gutierrez@redsur.mx",
    role: "concession_client",
  },
  captive_client: {
    id: "CAP-USR-001",
    firstName: "Visitante",
    lastName: "",
    email: "",
    role: "captive_client",
  },
  dev: {
    id: "DEV-001",
    firstName: "Developer",
    lastName: "Admin",
    email: "dev@miisp.com.mx",
    role: "dev",
  },
}

interface RoleContextValue {
  role: UserRole
  user: UserProfile
  setRole: (role: UserRole) => void
}

const RoleContext = createContext<RoleContextValue | null>(null)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("admin")

  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole)
  }, [])

  const user = mockUsers[role]

  return (
    <RoleContext.Provider value={{ role, user, setRole }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const context = useContext(RoleContext)
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider")
  }
  return context
}
