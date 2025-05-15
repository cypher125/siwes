"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  BookOpen,
  Calendar,
  ChevronLeft,
  ClipboardList,
  FileText,
  Home,
  LogOut,
  Settings,
  Users,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

type SidebarProps = {
  role: "admin" | "student" | "supervisor"
}

export function DashboardSidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navItems = {
    admin: [
      { name: "Dashboard", href: "/admin", icon: Home },
      { name: "Students", href: "/admin/students", icon: Users },
      { name: "Supervisors", href: "/admin/supervisors", icon: Users },
      { name: "Reports", href: "/admin/reports", icon: FileText },
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
    student: [
      { name: "Dashboard", href: "/student", icon: Home },
      { name: "Logbook", href: "/student/logbook", icon: BookOpen },
      { name: "Calendar", href: "/student/calendar", icon: Calendar },
      { name: "Profile", href: "/student/profile", icon: Users },
    ],
    supervisor: [
      { name: "Dashboard", href: "/supervisor", icon: Home },
      { name: "Students", href: "/supervisor/students", icon: Users },
      { name: "Evaluations", href: "/supervisor/evaluations", icon: ClipboardList },
      { name: "Reports", href: "/supervisor/reports", icon: BarChart3 },
    ],
  }

  const items = navItems[role]

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 bg-[#004C54] text-white">
          <div className="h-full flex flex-col">
            <div className="p-6">
              <h2 className="text-xl font-bold">SIWES Logbook</h2>
              <p className="text-sm text-white/70">Yaba College of Technology</p>
            </div>
            <nav className="flex-1 px-2 space-y-1">
              {items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                    pathname === item.href
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-white/10">
              <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10">
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex flex-col h-screen bg-[#004C54] text-white transition-all duration-300",
          isCollapsed ? "w-[70px]" : "w-[250px]",
        )}
      >
        <div className="p-6 flex items-center justify-between">
          {!isCollapsed && (
            <>
              <div>
                <h2 className="text-xl font-bold">SIWES Logbook</h2>
                <p className="text-sm text-white/70">Yaba College of Technology</p>
              </div>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white hover:bg-white/10"
          >
            <ChevronLeft className={cn("h-5 w-5 transition-transform", isCollapsed && "rotate-180")} />
          </Button>
        </div>
        <nav className="flex-1 px-2 space-y-1 py-4">
          {items.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                pathname === item.href ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              <item.icon className="h-5 w-5" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Button
            variant="ghost"
            className={cn(
              "w-full text-white/70 hover:text-white hover:bg-white/10",
              isCollapsed ? "justify-center" : "justify-start",
            )}
          >
            <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
            {!isCollapsed && "Logout"}
          </Button>
        </div>
      </div>
    </>
  )
}

