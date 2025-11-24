import { NextRequest, NextResponse } from 'next/server'
import { getVisibleWidgets, canSeeWidget, getWidgetSummary } from '@/lib/widgetUtils'
import { UserWithWidgets } from '@/lib/widgetUtils'

// Mock user data with widget permissions
const mockUsers: UserWithWidgets[] = [
  {
    id: '1',
    name: 'Amit Sarkar',
    email: 'amit@makestuffgo.com',
    role: 'CEO',
    widgetOverrides: [
      {
        widgetId: 'team-velocity',
        access: 'allow',
        source: 'override',
        grantedBy: 'Admin',
        grantedAt: '2024-01-15T10:00:00Z'
      }
    ]
  },
  {
    id: '2',
    name: 'Sarah Chen',
    email: 'sarah@makestuffgo.com',
    role: 'PO',
    widgetOverrides: [
      {
        widgetId: 'cost-analysis',
        access: 'allow',
        source: 'override',
        grantedBy: 'Admin',
        grantedAt: '2024-01-16T14:30:00Z'
      }
    ]
  }
]

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params
    const user = mockUsers.find(u => u.id === userId)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const visibleWidgets = getVisibleWidgets(user)
    const summary = getWidgetSummary(user)

    return NextResponse.json({
      userId: user.id,
      role: user.role,
      visibleWidgets,
      summary,
      overrides: user.widgetOverrides
    })
  } catch (error) {
    console.error('Error fetching user widgets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params
    const { widgetId, action } = await request.json()
    
    const user = mockUsers.find(u => u.id === userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Toggle widget access
    const existingOverride = user.widgetOverrides.find(w => w.widgetId === widgetId)
    
    if (action === 'enable') {
      if (!existingOverride) {
        user.widgetOverrides.push({
          widgetId,
          access: 'allow',
          source: 'override',
          grantedBy: 'Admin',
          grantedAt: new Date().toISOString()
        })
      } else if (existingOverride.access === 'deny') {
        existingOverride.access = 'allow'
        existingOverride.grantedAt = new Date().toISOString()
      }
    } else if (action === 'disable') {
      if (!existingOverride) {
        user.widgetOverrides.push({
          widgetId,
          access: 'deny',
          source: 'override',
          grantedBy: 'Admin',
          grantedAt: new Date().toISOString()
        })
      } else if (existingOverride.access === 'allow') {
        // Remove the override to fall back to role defaults
        user.widgetOverrides = user.widgetOverrides.filter(w => w.widgetId !== widgetId)
      }
    }

    const visibleWidgets = getVisibleWidgets(user)
    const summary = getWidgetSummary(user)

    return NextResponse.json({
      success: true,
      userId: user.id,
      visibleWidgets,
      summary,
      overrides: user.widgetOverrides
    })
  } catch (error) {
    console.error('Error updating user widgets:', error)
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
    const { widgetOverrides } = await request.json()
    
    const user = mockUsers.find(u => u.id === userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update all widget overrides
    user.widgetOverrides = widgetOverrides.map((override: any) => ({
      ...override,
      grantedBy: 'Admin',
      grantedAt: new Date().toISOString()
    }))

    const visibleWidgets = getVisibleWidgets(user)
    const summary = getWidgetSummary(user)

    return NextResponse.json({
      success: true,
      userId: user.id,
      visibleWidgets,
      summary,
      overrides: user.widgetOverrides
    })
  } catch (error) {
    console.error('Error updating user widget permissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
