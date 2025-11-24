import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

export type UserRole = 'admin' | 'ceo' | 'cto' | 'cfo' | 'engineer' | 'product-owner' | 'customer'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  department?: string
  permissions: string[]
}

export interface AuthUser extends User {
  iat?: number
  exp?: number
}

// Mock user database - in production this would be from your database
const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'hamish@makestuffgo.com',
    name: 'Hamish Watson',
    role: 'ceo',
    department: 'Executive',
    permissions: ['read:all', 'write:strategic', 'manage:company']
  },
  {
    id: '2',
    email: 'sajeewa@makestuffgo.com',
    name: 'Sajeewa Arachchillage',
    role: 'cto',
    department: 'Engineering',
    permissions: ['read:technical', 'write:engineering', 'manage:team']
  },
  {
    id: '3',
    email: 'cushla@makestuffgo.com',
    name: 'Cushla Smith',
    role: 'cfo',
    department: 'Finance',
    permissions: ['read:financial', 'write:budget', 'manage:finance']
  },
  {
    id: '4',
    email: 'jade@makestuffgo.com',
    name: 'Jade Sainui',
    role: 'engineer',
    department: 'Engineering',
    permissions: ['read:own', 'write:code', 'manage:personal']
  },
  {
    id: '5',
    email: 'sophia@makestuffgo.com',
    name: 'Sophia Liang',
    role: 'product-owner',
    department: 'Product',
    permissions: ['read:product', 'write:features', 'manage:roadmap']
  },
  {
    id: '6',
    email: 'amit@makestuffgo.com',
    name: 'Amit Kumar',
    role: 'admin',
    department: 'IT',
    permissions: ['read:all', 'write:all', 'manage:all', 'admin:system']
  }
]

const JWT_SECRET = process.env.JWT_SECRET || 'makestuffgo-secret-key-2025'

export class AuthService {
  static generateToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        permissions: user.permissions
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    )
  }

  static verifyToken(token: string): AuthUser | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUser
      return decoded
    } catch (error) {
      console.error('Token verification failed:', error)
      return null
    }
  }

  static getUserFromRequest(request: NextRequest): AuthUser | null {
    // Try to get token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      return this.verifyToken(token)
    }

    // Try to get token from cookie
    const tokenCookie = request.cookies.get('auth-token')
    if (tokenCookie) {
      return this.verifyToken(tokenCookie.value)
    }

    return null
  }

  static authenticateUser(email: string, password: string): User | null {
    // In production, this would verify against database with hashed passwords
    const user = MOCK_USERS.find(u => u.email === email)
    
    // Mock password validation (in production use bcrypt)
    if (user && password === 'makestuffgo2025') {
      return user
    }
    
    return null
  }

  static hasPermission(user: AuthUser, permission: string): boolean {
    return user.permissions.includes(permission) || user.permissions.includes('manage:all')
  }

  static canAccessRole(user: AuthUser, targetRole: UserRole): boolean {
    // Users can only access their own role dashboard
    if (user.role === targetRole) return true
    
    // Admins can access all dashboards for management purposes
    if (user.role === 'admin' && user.permissions.includes('admin:system')) return true
    
    return false
  }

  static getRolePermissions(role: UserRole): string[] {
    const rolePermissions: Record<UserRole, string[]> = {
      'admin': ['read:all', 'write:all', 'manage:all', 'admin:system'],
      'ceo': ['read:all', 'write:strategic', 'manage:company'],
      'cto': ['read:technical', 'read:team', 'write:engineering', 'manage:team'],
      'cfo': ['read:financial', 'read:budget', 'write:budget', 'manage:finance'],
      'engineer': ['read:own', 'read:technical', 'write:code', 'manage:personal'],
      'product-owner': ['read:product', 'read:features', 'write:features', 'manage:roadmap'],
      'customer': ['read:public', 'read:billing', 'write:support']
    }
    
    return rolePermissions[role] || []
  }

  static getAuthorizedData(user: AuthUser, dataType: string, data: any): any {
    switch (user.role) {
      case 'admin':
        return data // Admins see everything
      
      case 'ceo':
        // CEOs see high-level strategic data
        return this.filterForCEO(data, dataType)
      
      case 'cto':
        // CTOs see technical and team data
        return this.filterForCTO(data, dataType)
      
      case 'cfo':
        // CFOs see financial data
        return this.filterForCFO(data, dataType)
      
      case 'engineer':
        // Engineers see only their own data
        return this.filterForEngineer(data, dataType, user)
      
      case 'product-owner':
        // POs see product and feature data
        return this.filterForPO(data, dataType)
      
      case 'customer':
        // Customers see public-facing data only
        return this.filterForCustomer(data, dataType)
      
      default:
        return {}
    }
  }

  private static filterForCEO(data: any, dataType: string): any {
    // Filter data to show strategic, high-level information
    if (dataType === 'dashboard-stats') {
      return {
        ...data,
        // CEO sees all metrics but strategic focus
        focus: 'strategic'
      }
    }
    return data
  }

  private static filterForCTO(data: any, dataType: string): any {
    // Filter data to show technical and team information
    if (dataType === 'activity') {
      return {
        ...data,
        data: data.data?.filter((activity: any) => 
          ['GitHub', 'Jira', 'Portal'].includes(activity.service)
        )
      }
    }
    return data
  }

  private static filterForCFO(data: any, dataType: string): any {
    // Filter data to show financial information
    if (dataType === 'dashboard-stats') {
      return {
        ...data,
        // CFO sees cost and budget focused metrics
        focus: 'financial'
      }
    }
    return data
  }

  private static filterForEngineer(data: any, dataType: string, user: AuthUser): any {
    // Filter data to show only user's own information
    if (dataType === 'activity') {
      return {
        ...data,
        data: data.data?.filter((activity: any) => 
          activity.user === user.name || activity.user === user.email
        )
      }
    }
    if (dataType === 'jira') {
      return {
        ...data,
        tasks: data.tasks?.filter((task: any) => 
          task.assignee === user.name
        )
      }
    }
    return data
  }

  private static filterForPO(data: any, dataType: string): any {
    // Filter data to show product and feature information
    if (dataType === 'jira') {
      return {
        ...data,
        tasks: data.tasks?.filter((task: any) => 
          task.title.toLowerCase().includes('feature') ||
          task.title.toLowerCase().includes('story') ||
          task.title.toLowerCase().includes('epic')
        )
      }
    }
    return data
  }

  private static filterForCustomer(data: any, dataType: string): any {
    // Filter data to show only public-facing information
    if (dataType === 'dashboard-stats') {
      return {
        serviceStatus: 'healthy',
        uptime: '99.9%',
        publicMetrics: true
      }
    }
    return {}
  }
}

export default AuthService
