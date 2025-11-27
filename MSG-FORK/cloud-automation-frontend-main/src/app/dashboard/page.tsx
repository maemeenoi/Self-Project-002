'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

// Helper function to get the correct dashboard path based on user role
const getDashboardPath = (userRole?: string): string => {
  console.log('getDashboardPath called with userRole:', userRole, 'type:', typeof userRole)
  
  if (!userRole) {
    console.log('No userRole provided, returning /dashboard')
    return '/dashboard'
  }
  
  switch (userRole) {
    case 'SuperAdmin':
      console.log('Matched SuperAdmin, returning /superadmin')
      return '/superadmin'
    case 'Client Admin':
      console.log('Matched Client Admin, returning /admin')
      return '/admin'
    case 'CEO':
      return '/ceo'
    case 'CTO':
      return '/cto'
    case 'CFO':
      return '/cfo'
    case 'CIO':
      console.log('Matched CIO, returning /cio')
      return '/cio'
    case 'CISO':
      console.log('Matched CISO, returning /ciso')
      return '/ciso'
    case 'Delivery Executive':
      console.log('Matched Delivery Executive, returning /delivery-executive')
      return '/delivery-executive'
    case 'Engineer':
      return '/engineer'
    case 'Product Owner':
      return '/product-owner'
    case 'UNKNOWN':
      console.log('Unknown role detected, redirecting to role assignment page')
      return '/role-assignment-needed'
    default:
      console.log('No match found for role:', userRole, 'returning /role-assignment-needed for security')
      return '/role-assignment-needed' // Secure fallback - unknown roles need proper assignment
  }
}

export default function DashboardRedirect() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        console.log('Dashboard redirect - user:', user)
        console.log('Dashboard redirect - user.primaryRole:', user.primaryRole)
        console.log('Dashboard redirect - user.primaryRole?.name:', user.primaryRole?.name)
        
        const dashboardPath = getDashboardPath(user.primaryRole?.name)
        console.log('Dashboard redirect - redirecting to:', dashboardPath)
        router.replace(dashboardPath) // Use replace to avoid back button issues
      } else {
        router.push('/login')
      }
    }
  }, [isAuthenticated, isLoading, user, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="loading loading-spinner loading-lg"></div>
      <div className="ml-4 text-gray-600">Redirecting to your dashboard...</div>
    </div>
  )
}
