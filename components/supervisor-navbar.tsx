"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, ChevronDown, ClipboardList, Home, LogOut, Menu, User, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { supervisor } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

const navItems = [
  { name: "Dashboard", href: "/supervisor", icon: Home },
  { name: "Students", href: "/supervisor/students", icon: Users },
  { name: "Evaluations", href: "/supervisor/evaluations", icon: ClipboardList },
  { name: "Reports", href: "/supervisor/reports", icon: BarChart3 },
]

export function SupervisorNavbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const { logout } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchSupervisorProfile() {
      try {
        const response = await supervisor.getProfile()
        if (response.data) {
          setProfile(response.data)
        } else if (response.error) {
          console.error("Failed to load supervisor profile:", response.error)
        }
      } catch (error) {
        console.error("Error fetching supervisor profile:", error)
      }
    }

    fetchSupervisorProfile()
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "Failed to logout. Please try again.",
      })
    }
  }

  // Helper function to get initials
  const getInitials = (name: string = "") => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

  const fullName = profile ? `${profile.user.first_name} ${profile.user.last_name}` : "Loading..."
  const initials = profile ? getInitials(fullName) : "..."
  const staffId = profile?.staff_id || "..."

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0 sm:max-w-xs">
              <div className="px-7">
                <Link href="/supervisor" className="flex items-center" onClick={() => setIsOpen(false)}>
                  <div className="h-8 w-8 relative">
                    <Image
                      src="/images/yct-logo.png"
                      alt="YCT Logo"
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                  <span className="font-bold">SIWES Portal</span>
                  <div className="h-8 w-8 relative">
                    <Image src="/images/itf-logo.png" alt="ITF Logo" width={32} height={32} className="object-contain" />
                  </div>
                </Link>
              </div>
              <nav className="mt-8 flex flex-col gap-3 px-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                      pathname === item.href ? "bg-[#004C54] text-white" : "hover:bg-muted",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-muted text-left"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <Link href="/supervisor" className="flex items-center gap-2 mr-8">
          <div className="h-8 w-8 relative">
            <Image src="/images/yct-logo.png" alt="YCT Logo" width={32} height={32} className="object-contain" />
          </div>
          <span className="font-bold hidden md:inline-block">SIWES Portal</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-1 font-medium transition-colors hover:text-[#004C54]",
                pathname === item.href ? "text-[#004C54]" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative h-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.profile_picture || "/placeholder.svg?height=32&width=32"} alt={fullName} />
                  <AvatarFallback className="bg-[#004C54] text-white">{initials}</AvatarFallback>
                </Avatar>
                <span className="ml-2 hidden md:inline-block">{fullName}</span>
                <ChevronDown className="ml-1 h-4 w-4 hidden md:inline-block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{fullName}</p>
                  <p className="text-xs text-muted-foreground">{staffId}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/supervisor/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/supervisor/settings">
                  <User className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

