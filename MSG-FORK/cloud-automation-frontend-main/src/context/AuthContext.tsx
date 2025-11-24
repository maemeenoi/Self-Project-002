'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, AuthState, LoginCredentials, LoginResponse, Organization, RoleName } from '@/types/auth'
import { unifiedApi } from '@/services/unifiedApi'

// Map backend role names to frontend role names
const getRealRoleName = (backendRole: string): RoleName => {
  console.log('getRealRoleName called with:', backendRole)
  
  // Map backend role names to proper frontend role names
  const roleMapping: Record<string, RoleName> = {
    'superadmin': 'SuperAdmin',
    'super-admin': 'SuperAdmin',
    'SuperAdmin': 'SuperAdmin',
    'clientadmin': 'Client Admin',
    'client-admin': 'Client Admin', 
    'company-admin': 'Client Admin',
    'Client Admin': 'Client Admin',
    'ceo': 'CEO',
    'CEO': 'CEO',
    'cfo': 'CFO', 
    'CFO': 'CFO',
    'cto': 'CTO',
    'CTO': 'CTO',
    'engineer': 'Engineer',
    'Engineer': 'Engineer',
    'productowner': 'Product Owner',
    'product-owner': 'Product Owner',
    'Product Owner': 'Product Owner'
  }
  
  return roleMapping[backendRole] || 'Client Admin' // Default fallback
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<LoginResponse>
  logout: () => void
  refreshToken: () => Promise<boolean>
  hasRole: (roleName: string) => boolean
  hasPermission: (resource: string, action: string) => boolean
  getUserDisplayName: () => string
  getRoleDisplayNames: () => string[]
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    organization: null
  })

  useEffect(() => {
    // Check for existing token on mount
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (token) {
        // Set the token in the unified API service
        unifiedApi.setAuthToken(token)
        
        // Verify token with backend
        const userData = await unifiedApi.getCurrentUser()
        
        if (userData) {
          // Determine primary role based on user data
          let primaryRoleName: RoleName = 'Client Admin' // default
          
          // Check is_super_admin flag first (highest priority)
          if (userData.user?.isSuperAdmin) {
            primaryRoleName = 'SuperAdmin'
          } else if (userData.user?.role) {
            // Use the role from user data
            primaryRoleName = getRealRoleName(userData.user.role)
          }

          const user: User = {
            // Use email as ID if user_id is not available
            id: userData.user?.id || userData.user?.email || 'unknown',
            email: userData.user?.email || '',
            username: userData.user?.email || '',
            firstName: userData.user?.firstName || '',
            middleName: '',
            lastName: userData.user?.lastName || '',
            organizationId: userData.user?.companyId?.toString() || '',
            organizationName: userData.user?.companyName || '',
            roles: [{
              id: primaryRoleName.toLowerCase().replace(/\s+/g, '-'),
              name: primaryRoleName,
              displayName: primaryRoleName,
              permissions: [] // Will be populated based on role
            }],
            primaryRole: {
              id: primaryRoleName.toLowerCase().replace(/\s+/g, '-'),
              name: primaryRoleName,
              displayName: primaryRoleName,
              permissions: []
            }
          }

          const organization: Organization = {
            id: userData.user?.companyId?.toString() || '0',
            name: userData.user?.companyName || 'makeStuffGo',
            enabledRoles: ['SuperAdmin', 'Client Admin', 'CEO', 'CTO', 'CFO', 'Engineer', 'Product Owner'],
            config: {
              features: ['dashboard', 'analytics', 'reports'],
              branding: {
                companyName: userData.user?.companyName || 'makeStuffGo'
              }
            }
          }

          setAuthState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            organization
          })
          return
        } else {
          // Token invalid, remove it
          localStorage.removeItem('auth_token')
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error)
      localStorage.removeItem('auth_token')
    }
    
    setAuthState(prev => ({ ...prev, isLoading: false }))
  }

  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      // Use unified API for login
      const backendResponse = await unifiedApi.login(credentials)

      if (backendResponse.access_token && backendResponse.user) {
        // Use real database role names directly from JWT token
        // Extract JWT payload to get the actual roles
        const payload = JSON.parse(atob(backendResponse.access_token.split('.')[1]))
        console.log('JWT payload:', payload)
        
        // Determine primary role based on JWT payload
        let primaryRoleName: RoleName = 'Client Admin' // default
        
        // Check is_super_admin flag first (highest priority)
        if (payload.is_super_admin) {
          primaryRoleName = 'SuperAdmin'
        } else if (payload.roles && payload.roles.length > 0) {
          // Use the first role from the roles array
          const backendRoleName = payload.roles[0]
          primaryRoleName = getRealRoleName(backendRoleName)
        }
        
        console.log('Primary role name:', primaryRoleName)

        // Convert backend user data to frontend format
        const user: User = {
          id: backendResponse.user.id,
          email: backendResponse.user.email,
          username: backendResponse.user.email,
          firstName: backendResponse.user.firstName,
          lastName: backendResponse.user.lastName,
          organizationId: backendResponse.user.organizationId || '',
          organizationName: backendResponse.company.name || '',
          roles: [{
            id: primaryRoleName.toLowerCase().replace(/\s+/g, '-'),
            name: primaryRoleName,
            displayName: primaryRoleName,
            permissions: []
          }],
          primaryRole: {
            id: primaryRoleName.toLowerCase().replace(/\s+/g, '-'),
            name: primaryRoleName,
            displayName: primaryRoleName,
            permissions: []
          }
        }

        const organization: Organization = {
          id: backendResponse.company.id || '0',
          name: backendResponse.company.name || 'makeStuffGo',
          enabledRoles: ['SuperAdmin', 'Client Admin', 'CEO', 'CTO', 'CFO', 'Engineer', 'Product Owner'],
          config: {
            features: ['dashboard', 'analytics', 'reports'],
            branding: {
              companyName: backendResponse.company.name || 'makeStuffGo'
            }
          }
        }

        setAuthState({
          user,
          token: backendResponse.access_token,
          isAuthenticated: true,
          isLoading: false,
          organization
        })

        return {
          success: true,
          token: backendResponse.access_token,
          user,
          organization,
          message: 'Login successful'
        }
      }

      return {
        success: false,
        message: 'Login failed. Please try again.'
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: 'Login failed. Please try again.'
      }
    }
  }

  const logout = async () => {
    try {
      // Call logout API using unified service
      await unifiedApi.logout()
    } catch (error) {
      console.error('Logout API error:', error)
    }
    
    // Clean up local storage and state
    localStorage.removeItem('auth_token')
    sessionStorage.removeItem('auth_token')
    localStorage.removeItem('user') // Also remove user data from login page
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      organization: null
    })
    // Redirect to login page
    window.location.href = '/login'
  }

  const refreshToken = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
      if (!token) return false

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setAuthState(prev => ({
          ...prev,
          token: data.token,
          user: data.user
        }))
        return true
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
    }
    
    logout()
    return false
  }

  const hasRole = (roleName: string): boolean => {
    return authState.user?.roles.some(role => role.name === roleName) || false
  }

  const hasPermission = (resource: string, action: string): boolean => {
    return authState.user?.roles.some(role =>
      role.permissions.some(permission =>
        permission.resource === resource && permission.actions.includes(action)
      )
    ) || false
  }

  const getUserDisplayName = (): string => {
    const { user } = authState
    if (!user) return 'User'
    
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    
    if (user.username) {
      return user.username
    }
    
    if (user.email) {
      return user.email
    }
    
    return 'User'
  }

  const getRoleDisplayNames = (): string[] => {
    return authState.user?.roles.map(role => role.displayName) || []
  }

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshToken,
    hasRole,
    hasPermission,
    getUserDisplayName,
    getRoleDisplayNames
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
