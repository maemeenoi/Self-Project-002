import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params
    
    // Simulate getting user widget permissions from database
    const mockPermissions = {
      userId: userId,
      permissions: {
        'team-velocity': { access: 'allow', source: 'role' },
        'code-reviews': { access: 'allow', source: 'role' },
        'deployment-frequency': { access: 'deny', source: 'override' },
        'bug-count': { access: 'allow', source: 'role' },
        'cloud-cost-analysis': { access: 'allow', source: 'role' },
        'bottleneck-alert': { access: 'deny', source: 'override' }
      }
    }
    
    return NextResponse.json(mockPermissions)
  } catch (error) {
    console.error('Error fetching widget permissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params
    const body = await request.json()
    
    console.log('Updating widget permissions for user:', userId, 'with data:', body)
    
    // Simulate database update delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock successful response
    const updatedPermissions = {
      success: true,
      message: 'Widget permissions updated successfully',
      userId: userId,
      permissions: body.permissions,
      updatedAt: new Date().toISOString()
    }
    
    return NextResponse.json(updatedPermissions)
  } catch (error) {
    console.error('Error updating widget permissions:', error)
    return NextResponse.json(
      { error: 'Failed to update widget permissions' },
      { status: 500 }
    )
  }
}
