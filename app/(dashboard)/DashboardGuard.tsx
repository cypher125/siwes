"use client"

import { useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface DashboardGuardProps {
  children: ReactNode
  allowedRole: 'student' | 'supervisor' | 'admin'
}

export default function DashboardGuard({ children, allowedRole }: DashboardGuardProps) {
  const { isAuthenticated, isLoading, userRole } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip during server-side rendering or when auth is still loading
    if (typeof window === 'undefined' || isLoading) {
      return
    }

    // Debug info
    console.log('DashboardGuard check:', {
      isAuthenticated,
      userRole,
      allowedRole,
      pathname
    })

    // If user is not authenticated, redirect to home
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to home')
      router.push('/')
      return
    }

    // For supervisor paths, just allow access if authenticated (temporary fix)
    if (allowedRole === 'supervisor' && isAuthenticated) {
      console.log('Allowing access to supervisor dashboard regardless of role')
      return
    }

    // If user role doesn't match the allowed role for this layout, redirect to their correct dashboard
    if (userRole && userRole !== allowedRole) {
      console.log(`Invalid role: ${userRole} for ${allowedRole} dashboard, redirecting`)
      
      // Redirect to the appropriate dashboard
      switch (userRole) {
        case 'student':
          router.push('/student')
          break
        case 'supervisor':
          router.push('/supervisor')
          break
        case 'admin':
          router.push('/admin')
          break
        default:
          router.push('/')
      }
    }
  }, [isAuthenticated, isLoading, userRole, router, allowedRole, pathname])

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#004C54]" />
        <p className="mt-2 text-muted-foreground">Loading...</p>
      </div>
    )
  }

  // Allow access to supervisor dashboard regardless of role check (temporary fix)
  if (allowedRole === 'supervisor' && isAuthenticated) {
    return <>{children}</>
  }

  // If not authenticated or wrong role, show nothing (redirect effect will handle this)
  if (!isAuthenticated || (userRole && userRole !== allowedRole)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#004C54]" />
        <p className="mt-2 text-muted-foreground">Redirecting...</p>
      </div>
    )
  }

  // User is authenticated and has correct role, render children
  return <>{children}</>
} 