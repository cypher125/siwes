"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronLeft, Home, LogOut, Menu, Users, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"

export function AdminSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Students", href: "/admin/students", icon: Users },
    { name: "Supervisors", href: "/admin/supervisors", icon: Users },
    { name: "Assignments", href: "/admin/assignments", icon: UserPlus },
  ]

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
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 relative">
                  <Image src="/images/yct-logo.png" alt="YCT Logo" width={40} height={40} className="object-contain" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">SIWES Portal</h2>
                  <p className="text-sm text-white/70">Admin Dashboard</p>
                </div>
              </div>
            </div>
            <div className="px-4 py-2">
              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg">
                <Avatar className="h-10 w-10 border-2 border-white/20">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt="@admin" />
                  <AvatarFallback className="bg-[#FFC300] text-[#004C54]">AD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Admin User</p>
                  <p className="text-xs text-white/70">admin@yabatech.edu.ng</p>
                </div>
              </div>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navItems.map((item) => (
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
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 relative">
                <Image src="/images/yct-logo.png" alt="YCT Logo" width={40} height={40} className="object-contain" />
              </div>
              <div>
                <h2 className="text-xl font-bold">SIWES Portal</h2>
                <p className="text-sm text-white/70">Admin Dashboard</p>
              </div>
            </div>
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

        {!isCollapsed && (
          <div className="px-4 py-2">
            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg">
              <Avatar className="h-10 w-10 border-2 border-white/20">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="@admin" />
                <AvatarFallback className="bg-[#FFC300] text-[#004C54]">AD</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Admin User</p>
                <p className="text-xs text-white/70">admin@yabatech.edu.ng</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 px-2 space-y-1 py-4">
          {navItems.map((item) => (
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

