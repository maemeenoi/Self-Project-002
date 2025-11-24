'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { RoleName } from '@/types/auth'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRoles?: RoleName[]
  fallbackPath?: string
}

export default function ProtectedRoute({ 
  children, 
  requiredRoles = [], 
  fallbackPath = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(fallbackPath)
        return
      }

      // Check role requirements
      if (requiredRoles.length > 0 && user) {
        const userRoles = user.roles.map(role => role.name)
        const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role))
        
        if (!hasRequiredRole) {
          // Redirect to dashboard if user doesn't have required role
          router.push(fallbackPath)
          return
        }
      }
    }
  }, [isAuthenticated, isLoading, user, router, requiredRoles, fallbackPath])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  if (requiredRoles.length > 0 && user) {
    const userRoles = user.roles.map(role => role.name)
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role))
    
    if (!hasRequiredRole) {
      return null // Will redirect to dashboard
    }
  }

  return <>{children}</>
}
