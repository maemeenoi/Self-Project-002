import { NextRequest, NextResponse } from 'next/server'
import { getAvailableWidgetsForRole } from '@/lib/widgetUtils'
import { WIDGET_PERMISSIONS, ROLE_WIDGETS, WIDGET_CATEGORIES } from '@/types/widgets'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    
    if (!role) {
      return NextResponse.json(
        { error: 'Role parameter is required' },
        { status: 400 }
      )
    }

    const availableWidgets = getAvailableWidgetsForRole(role)
    
    return NextResponse.json({
      role,
      widgets: {
        default: availableWidgets.default,
        optional: availableWidgets.optional
      },
      categories: WIDGET_CATEGORIES,
      totalWidgets: Object.keys(WIDGET_PERMISSIONS).length
    })
  } catch (error) {
    console.error('Error fetching available widgets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get all widgets (for admin reference)
export async function POST(request: NextRequest) {
  try {
    const allWidgets = Object.entries(WIDGET_PERMISSIONS).map(([id, widget]) => ({
      id,
      ...widget
    }))

    const widgetsByRole = Object.entries(ROLE_WIDGETS).map(([role, widgets]) => ({
      role,
      default: widgets.default.map(id => ({
        id,
        widget: WIDGET_PERMISSIONS[id]
      })),
      optional: widgets.optional.map(id => ({
        id,
        widget: WIDGET_PERMISSIONS[id]
      }))
    }))

    return NextResponse.json({
      allWidgets,
      widgetsByRole,
      categories: WIDGET_CATEGORIES
    })
  } catch (error) {
    console.error('Error fetching widget catalog:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
