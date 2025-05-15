import type React from "react"
import { SupervisorNavbar } from "@/components/supervisor-navbar"
import DashboardGuard from "../DashboardGuard"

export default function SupervisorDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardGuard allowedRole="supervisor">
      <div className="flex flex-col min-h-screen">
        <SupervisorNavbar />
        <main className="flex-1">{children}</main>
      </div>
    </DashboardGuard>
  )
}

