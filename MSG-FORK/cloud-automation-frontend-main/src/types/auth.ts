export interface User {
  id: string
  email: string
  username: string
  roles: Role[]
  primaryRole: Role
  organizationId: string
  organizationName: string
  firstName?: string
  middleName?: string
  lastName?: string
  avatar?: string
}

export interface Role {
  id: string
  name: RoleName
  displayName: string
  permissions: Permission[]
}

export type RoleName = 'SuperAdmin' | 'Client Admin' | 'CEO' | 'CFO' | 'CTO' | 'Engineer' | 'Product Owner'

export interface Permission {
  resource: string
  actions: string[]
}

export interface Organization {
  id: string
  name: string
  enabledRoles: RoleName[]
  config: {
    features: string[]
    branding?: {
      logo?: string
      primaryColor?: string
      companyName?: string
    }
  }
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  organization: Organization | null
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  success: boolean
  token?: string
  user?: User
  organization?: Organization
  message?: string
}
