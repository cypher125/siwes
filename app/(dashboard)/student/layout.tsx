import type React from "react"
import { StudentNavbar } from "@/components/student-navbar"
import DashboardGuard from "../DashboardGuard"

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardGuard allowedRole="student">
      <div className="flex flex-col min-h-screen">
        <StudentNavbar />
        <main className="flex-1">{children}</main>
      </div>
    </DashboardGuard>
  )
}

