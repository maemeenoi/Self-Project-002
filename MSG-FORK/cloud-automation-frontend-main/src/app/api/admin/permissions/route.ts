import { NextResponse } from 'next/server'
import { getRepositoryPermissions, getJiraProjectPermissions, getAdminToken } from '@/lib/permissionHelpers'

// API endpoints for permission management
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const service = searchParams.get('service')
    
    if (!role) {
      return NextResponse.json(
        { success: false, error: 'Role parameter is required' },
        { status: 400 }
      )
    }

    let permissions = {}
    
    if (!service || service === 'github') {
      permissions = {
        ...permissions,
        github: {
          repositories: getRepositoryPermissions('makestuffgo-org', role)
        }
      }
    }
    
    if (!service || service === 'jira') {
      permissions = {
        ...permissions,
        jira: {
          projects: getJiraProjectPermissions('makestuffgo-org', role)
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: permissions,
      role,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch permissions' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { service, role, permissions } = body
    
    // In production, this would update the database with new permissions
    // Only admin users would be allowed to call this endpoint
    
    return NextResponse.json({
      success: true,
      message: `Permissions updated for ${role} in ${service}`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error updating permissions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update permissions' },
      { status: 500 }
    )
  }
}
