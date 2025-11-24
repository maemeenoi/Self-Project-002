// Widget-centric permission utilities
import { WIDGET_PERMISSIONS, ROLE_WIDGETS, UserWidgetAccess, getWidgetCategory } from '@/types/widgets'

export interface UserWithWidgets {
  id: string
  name: string
  email: string
  role: string
  widgetOverrides: UserWidgetAccess[]
}

/**
 * Get visible widgets for a user based on role and overrides
 */
export function getVisibleWidgets(user: UserWithWidgets): string[] {
  const roleWidgets = ROLE_WIDGETS[user.role] || { default: [], optional: [] }
  const defaultWidgets = roleWidgets.default

  // Get explicitly granted optional widgets
  const grantedOptional = user.widgetOverrides
    .filter(w => w.access === 'allow')
    .map(w => w.widgetId)

  // Get explicitly denied widgets (removes from defaults)
  const deniedWidgets = user.widgetOverrides
    .filter(w => w.access === 'deny')
    .map(w => w.widgetId)

  // Combine default + granted, then remove denied
  const allGranted = [...defaultWidgets, ...grantedOptional]
  return allGranted.filter(widgetId => !deniedWidgets.includes(widgetId))
}

/**
 * Check if user can see a specific widget
 */
export function canSeeWidget(user: UserWithWidgets, widgetId: string): boolean {
  const widget = WIDGET_PERMISSIONS[widgetId]
  if (!widget) return false

  // Check explicit deny first
  const denied = user.widgetOverrides.find(
    w => w.widgetId === widgetId && w.access === 'deny'
  )
  if (denied) return false

  // Check explicit allow
  const allowed = user.widgetOverrides.find(
    w => w.widgetId === widgetId && w.access === 'allow'
  )
  if (allowed) return true

  // Check if it's a default widget for the user's role
  const roleWidgets = ROLE_WIDGETS[user.role]
  return roleWidgets?.default.includes(widgetId) || false
}

/**
 * Get widget access information for user
 */
export function getWidgetAccess(user: UserWithWidgets, widgetId: string): {
  hasAccess: boolean
  source: 'role' | 'override' | 'denied'
  isDefault: boolean
  isOptional: boolean
} {
  const roleWidgets = ROLE_WIDGETS[user.role] || { default: [], optional: [] }
  const isDefault = roleWidgets.default.includes(widgetId)
  const isOptional = roleWidgets.optional.includes(widgetId)
  
  const override = user.widgetOverrides.find(w => w.widgetId === widgetId)
  
  if (override) {
    return {
      hasAccess: override.access === 'allow',
      source: 'override',
      isDefault,
      isOptional
    }
  }

  return {
    hasAccess: isDefault,
    source: 'role',
    isDefault,
    isOptional
  }
}

/**
 * Get available widgets for a role (default + optional)
 */
export function getAvailableWidgetsForRole(role: string): {
  default: Array<{ id: string; widget: any }>
  optional: Array<{ id: string; widget: any }>
} {
  const roleWidgets = ROLE_WIDGETS[role] || { default: [], optional: [] }
  
  return {
    default: roleWidgets.default.map(id => ({
      id,
      widget: WIDGET_PERMISSIONS[id]
    })),
    optional: roleWidgets.optional.map(id => ({
      id,
      widget: WIDGET_PERMISSIONS[id]
    }))
  }
}

/**
 * Group widgets by category
 */
export function groupWidgetsByCategory(widgetIds: string[]): Record<string, Array<{ id: string; widget: any }>> {
  const grouped: Record<string, Array<{ id: string; widget: any }>> = {}
  
  widgetIds.forEach(id => {
    const category = getWidgetCategory(id)
    if (!grouped[category]) {
      grouped[category] = []
    }
    grouped[category].push({
      id,
      widget: WIDGET_PERMISSIONS[id]
    })
  })
  
  return grouped
}

/**
 * Get widget permission summary for user
 */
export function getWidgetSummary(user: UserWithWidgets) {
  const visibleWidgets = getVisibleWidgets(user)
  const roleWidgets = ROLE_WIDGETS[user.role] || { default: [], optional: [] }
  
  const defaultCount = roleWidgets.default.length
  const grantedOptional = user.widgetOverrides.filter(w => w.access === 'allow').length
  const deniedDefault = user.widgetOverrides.filter(w => 
    w.access === 'deny' && roleWidgets.default.includes(w.widgetId)
  ).length
  
  return {
    total: visibleWidgets.length,
    default: defaultCount - deniedDefault,
    optional: grantedOptional,
    denied: deniedDefault,
    categories: Object.keys(groupWidgetsByCategory(visibleWidgets))
  }
}

/**
 * Create widget override for user
 */
export function createWidgetOverride(
  userId: string,
  widgetId: string,
  access: 'allow' | 'deny',
  grantedBy?: string
): UserWidgetAccess {
  return {
    widgetId,
    access,
    source: 'override',
    grantedBy,
    grantedAt: new Date().toISOString()
  }
}

/**
 * Toggle widget access for user
 */
export function toggleWidgetAccess(
  user: UserWithWidgets,
  widgetId: string,
  grantedBy?: string
): UserWidgetAccess[] {
  const currentOverrides = user.widgetOverrides.filter(w => w.widgetId !== widgetId)
  const roleWidgets = ROLE_WIDGETS[user.role] || { default: [], optional: [] }
  
  const isDefault = roleWidgets.default.includes(widgetId)
  const isOptional = roleWidgets.optional.includes(widgetId)
  const currentAccess = getWidgetAccess(user, widgetId)
  
  // If it's a default widget and user has access, add deny override
  if (isDefault && currentAccess.hasAccess) {
    return [...currentOverrides, createWidgetOverride(user.id, widgetId, 'deny', grantedBy)]
  }
  
  // If it's an optional widget and user doesn't have access, add allow override
  if (isOptional && !currentAccess.hasAccess) {
    return [...currentOverrides, createWidgetOverride(user.id, widgetId, 'allow', grantedBy)]
  }
  
  // If it's an optional widget and user has access via override, remove override
  if (isOptional && currentAccess.source === 'override') {
    return currentOverrides
  }
  
  // For denied default widgets, remove the deny override to restore access
  if (isDefault && !currentAccess.hasAccess && currentAccess.source === 'override') {
    return currentOverrides
  }
  
  // For widgets that are neither default nor optional for this role:
  // - If user doesn't have access, add allow override
  // - If user has access via override, remove override (deny access)
  if (!isDefault && !isOptional) {
    if (!currentAccess.hasAccess) {
      return [...currentOverrides, createWidgetOverride(user.id, widgetId, 'allow', grantedBy)]
    } else if (currentAccess.source === 'override') {
      return currentOverrides
    }
  }
  
  return user.widgetOverrides
}

/**
 * Get widgets organized by sections for admin interface
 */
export function getWidgetSections(user: UserWithWidgets): {
  defaultWidgets: Array<{ id: string; widget: any }>
  customWidgets: Array<{ id: string; widget: any }>
  availableWidgets: Array<{ id: string; widget: any }>
  deniedWidgets: string[]
} {
  const roleWidgets = ROLE_WIDGETS[user.role] || { default: [], optional: [] }
  
  // Get widgets that have been granted via override
  const grantedOverrides = user.widgetOverrides
    .filter(w => w.access === 'allow')
    .map(w => w.widgetId)
    
  // Get widgets that have been denied via override
  const deniedOverrides = user.widgetOverrides
    .filter(w => w.access === 'deny')
    .map(w => w.widgetId)
  
  // Default widgets (from role, not denied)
  const defaultWidgets = roleWidgets.default
    .filter(id => !deniedOverrides.includes(id))
    .map(id => ({
      id,
      widget: WIDGET_PERMISSIONS[id]
    }))
    .filter(item => item.widget) // Filter out undefined widgets
  
  // Custom widgets (granted optional widgets)
  const customWidgets = grantedOverrides
    .map(id => ({
      id,
      widget: WIDGET_PERMISSIONS[id]
    }))
    .filter(item => item.widget) // Filter out undefined widgets
  
  // Available widgets (all widgets minus defaults, customs, and denied)
  const allWidgetIds = Object.keys(WIDGET_PERMISSIONS)
  const usedWidgetIds = [
    ...roleWidgets.default,
    ...grantedOverrides
  ]
  
  const availableWidgets = allWidgetIds
    .filter(id => !usedWidgetIds.includes(id) && !deniedOverrides.includes(id))
    .map(id => ({
      id,
      widget: WIDGET_PERMISSIONS[id]
    }))
    .filter(item => item.widget) // Filter out undefined widgets
  
  return {
    defaultWidgets,
    customWidgets,
    availableWidgets,
    deniedWidgets: deniedOverrides
  }
}

/**
 * Get all widgets from WIDGET_PERMISSIONS
 */
export function getAllWidgets(): Array<{ id: string; widget: any }> {
  return Object.keys(WIDGET_PERMISSIONS).map(id => ({
    id,
    widget: WIDGET_PERMISSIONS[id]
  }))
}

/**
 * Get default widgets for a role
 */
export function getDefaultWidgetsForRole(role: string): Array<{ id: string; widget: any }> {
  const roleWidgets = ROLE_WIDGETS[role] || { default: [], optional: [] }
  return roleWidgets.default.map(id => ({
    id,
    widget: WIDGET_PERMISSIONS[id]
  })).filter(item => item.widget)
}
