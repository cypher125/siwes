"use client";

import { auth } from "@/lib/api";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Bell, 
  Calendar,
  LayoutDashboard,
  GraduationCap,
  Users,
  ClipboardList,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    setUser(currentUser);
  }, []);

  // Add a style element to remove duplicate Add buttons
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Hide duplicate Add buttons that appear outside card footers */
      .flex-1.space-y-4.p-8.pt-6 > button:has(svg.h-4.w-4) {
        display: none !important;
      }
      /* Hide the second Add New Department button */
      #department-card ~ button {
        display: none !important;
      }
      /* Hide the second Add New Student button */
      .grid.gap-4.md\\:grid-cols-2 + button, 
      /* Hide the second Add New Supervisor button */
      .grid.gap-4.md\\:grid-cols-2 + button + button {
        display: none !important;
      }
      /* Hide duplicate buttons in supervisors page */
      #add-supervisor-container ~ button,
      .col-span-full + button {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    }
  }, []);

  const handleLogout = () => {
    auth.logout();
    router.push('/admin/login');
  };

  const navItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard
    },
    {
      href: "/admin/students",
      label: "Students",
      icon: GraduationCap
    },
    {
      href: "/admin/supervisors",
      label: "Supervisors",
      icon: Users
    },
    {
      href: "/admin/assignments",
      label: "Assignments",
      icon: ClipboardList
    }
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={cn(
        "bg-gradient-to-b from-[#004C54] to-[#003840] text-white flex flex-col shadow-xl transition-all duration-300 relative",
        collapsed ? "w-20" : "w-64"
      )}>
        {/* Toggle button */}
        <button 
          onClick={toggleSidebar} 
          className="absolute -right-3 top-20 bg-[#004C54] text-white p-1 rounded-full shadow-md hover:bg-[#00323a] transition-colors z-50"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className="p-6 flex-1">
          {/* Logo and Title */}
          <div className={cn(
            "flex items-center mb-10", 
            collapsed ? "justify-center" : "space-x-3 pl-2"
          )}>
            <div className="relative">
              <img src="/logo.png" alt="YCT Logo" className="w-12 h-12 rounded-md shadow-md" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-[#FFC300] rounded-full"></div>
            </div>
            {!collapsed && (
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">SIWES Portal</h2>
                <p className="text-xs font-medium text-teal-200/80">Admin Dashboard</p>
              </div>
            )}
          </div>

          {/* Admin Profile */}
          <div className={cn(
            "mb-10 p-4 bg-gradient-to-r from-[#003A40] to-[#00323a] rounded-xl border border-teal-800/30 shadow-inner hover:shadow-md transition-all duration-300 hover:border-teal-700/50 group",
            collapsed && "flex justify-center p-2"
          )}>
            <div className={cn("flex items-center", collapsed && "flex-col")}>
              <Avatar className={cn(
                "shadow-md border-2 border-teal-900/30 group-hover:border-teal-800/60 transition-all duration-300",
                collapsed ? "h-12 w-12" : "h-10 w-10"
              )}>
                <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-[#003A40] font-semibold">
                  AD
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
              <div className="ml-3">
                  <h3 className="font-medium text-white group-hover:text-teal-100 transition-colors">Admin User</h3>
                  <p className="text-xs text-teal-200/70 group-hover:text-teal-200/90 transition-colors truncate max-w-[9rem]">{user?.email || 'admin@yabatech.edu.ng'}</p>
              </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1.5">
            {!collapsed && (
              <p className="text-xs font-semibold text-teal-200/60 uppercase tracking-wider px-4 mb-2">Main Menu</p>
            )}
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center text-sm font-medium rounded-lg transition-all duration-200 relative overflow-hidden group",
                    collapsed ? "justify-center p-3" : "px-4 py-3",
                    isActive 
                      ? "bg-[#003A40] text-white shadow-md" 
                      : "text-teal-100/80 hover:bg-[#003A40]/70 hover:text-white"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  {isActive && <div className={cn(
                    "absolute bg-[#FFC300] rounded-r-full",
                    collapsed ? "top-0 left-0 h-1 w-full" : "left-0 top-0 bottom-0 w-1"
                  )}></div>}
                  <div className={cn(
                    "flex items-center",
                    collapsed ? "justify-center" : "w-full",
                    isActive && !collapsed ? "translate-x-1 transition-transform duration-200" : 
                    !collapsed ? "group-hover:translate-x-1 transition-transform duration-200" : ""
                  )}>
                    <item.icon className={cn(
                      "transition-all duration-200",
                      collapsed ? "h-6 w-6" : "h-5 w-5 mr-3",
                      isActive ? "text-[#FFC300]" : "text-teal-300/70 group-hover:text-teal-200"
                    )} />
                    {!collapsed && item.label}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div className={cn(
          "p-6 border-t border-teal-800/30",
          collapsed && "p-4"
        )}>
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center text-sm font-medium rounded-lg transition-all duration-200 text-teal-100/80 hover:bg-red-600/10 hover:text-red-200 group",
              collapsed ? "justify-center p-3" : "w-full px-4 py-3"
            )}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className={cn(
              "text-teal-300/70 group-hover:text-red-300 transition-colors duration-200",
              collapsed ? "h-6 w-6" : "h-5 w-5 mr-3"
            )} />
            {!collapsed && <span className="group-hover:translate-x-1 transition-transform duration-200">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <div className="bg-white shadow-sm">
          <div className="flex items-center justify-end h-16 px-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FFC300] text-[0.6rem] text-black font-medium">
                  3
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

