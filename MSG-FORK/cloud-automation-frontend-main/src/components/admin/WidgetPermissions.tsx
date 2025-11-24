'use client'

import React, { useState, useEffect } from 'react'
import { 
  getWidgetSections,
  getAllWidgets,
  getDefaultWidgetsForRole 
} from '@/lib/widgetUtils'
import { UserWithWidgets } from '@/lib/widgetUtils'

interface WidgetPermissionManagerProps {
  user: UserWithWidgets
  onUpdatePermissions: (userId: string, widgetOverrides: any[]) => void
}

function DefaultWidgetCard({ widget, onDeny }: { 
  widget: any
  onDeny?: () => void
}) {
  return (
    <div className="default-widget-card bg-white border border-gray-300 rounded-lg p-5 transition-all hover:shadow-sm hover:border-blue-500 widget-card">
      <div className="card-header flex justify-between items-center mb-3">
        <h4 className="text-base font-semibold m-0 text-gray-800">
          {widget.name}
        </h4>
        <span className="badge px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Default
        </span>
      </div>
      <p className="description text-sm text-gray-600 mb-4 leading-relaxed">
        {widget.description}
      </p>
      <div className="card-footer flex justify-between items-center">
        <span className="category text-xs text-gray-500 font-medium">
          {widget.category}
        </span>
        {onDeny && (
          <button 
            onClick={onDeny}
            className="btn btn-sm text-xs px-3 py-1 border border-red-300 text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            Deny Access
          </button>
        )}
      </div>
    </div>
  )
}

function CustomWidgetCard({ widget, onDisable }: { 
  widget: any
  onDisable?: () => void
}) {
  return (
    <div className="custom-widget-card bg-white border-2 border-green-500 rounded-lg p-5 transition-all hover:shadow-md hover:shadow-green-100 widget-card">
      <div className="card-header flex justify-between items-center mb-3">
        <h4 className="text-base font-semibold m-0 text-gray-800">
          {widget.name}
        </h4>
        <span className="badge success px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Enabled
        </span>
      </div>
      <p className="description text-sm text-gray-600 mb-4 leading-relaxed">
        {widget.description}
      </p>
      <div className="card-footer flex justify-between items-center">
        <span className="category text-xs text-gray-500 font-medium">
          {widget.category}
        </span>
        {onDisable && (
          <button 
            onClick={onDisable}
            className="btn btn-sm text-xs px-3 py-1 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded transition-colors"
          >
            Disable
          </button>
        )}
      </div>
    </div>
  )
}

function AvailableWidgetCard({ widget, onEnable }: { 
  widget: any
  onEnable?: () => void
}) {
  return (
    <div className="available-widget-card bg-white border border-gray-200 rounded-lg p-5 transition-all hover:shadow-sm hover:border-gray-300 widget-card">
      <div className="card-content">
        <div className="card-header flex justify-between items-center mb-3">
          <h4 className="text-base font-semibold m-0 text-gray-800">
            {widget.name}
          </h4>
          <span className="badge px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            Available
          </span>
        </div>
        <p className="description text-sm text-gray-600 mb-3 leading-relaxed">
          {widget.description}
        </p>
        <span className="category text-xs text-gray-500 font-medium block mb-4">
          {widget.category}
        </span>
      </div>
      <div className="card-action flex items-center justify-between">
        <span className="status-text text-sm text-gray-600">Enable for user</span>
        {onEnable && (
          <button 
            onClick={onEnable}
            className="btn btn-sm text-xs px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors"
          >
            Enable
          </button>
        )}
      </div>
    </div>
  )
}

const WidgetPermissionManager = ({ user, onUpdatePermissions }: WidgetPermissionManagerProps) => {
  const [customWidgets, setCustomWidgets] = useState<Array<{ id: string; widget: any }>>([])
  const [deniedWidgets, setDeniedWidgets] = useState<string[]>([])
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize state from user's current overrides
  useEffect(() => {
    const sections = getWidgetSections(user)
    setCustomWidgets(sections.customWidgets)
    setDeniedWidgets(sections.deniedWidgets)
    setHasChanges(false)
  }, [user])

  // Get default widgets from role
  const defaultWidgets = getDefaultWidgetsForRole(user.role)
  
  // Get available widgets (excluding defaults and custom)
  const allWidgets = getAllWidgets()
  const availableWidgets = allWidgets.filter(widget => 
    !defaultWidgets.some(dw => dw.id === widget.id) &&
    !customWidgets.some(cw => cw.id === widget.id) &&
    !deniedWidgets.includes(widget.id)
  )
  
  // Group available widgets by category
  const groupedAvailableWidgets = availableWidgets.reduce((acc, widget) => {
    const category = widget.widget.category || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(widget)
    return acc
  }, {} as Record<string, Array<{ id: string; widget: any }>>)
  
  // Handle enabling a widget - moves from Available to Custom
  const handleEnableWidget = (widgetId: string) => {
    const widget = allWidgets.find(w => w.id === widgetId)
    if (widget) {
      setCustomWidgets([...customWidgets, widget])
      setHasChanges(true)
    }
  }
  
  // Handle disabling a widget - moves back to Available
  const handleDisableWidget = (widgetId: string) => {
    setCustomWidgets(customWidgets.filter(w => w.id !== widgetId))
    setHasChanges(true)
  }
  
  // Handle denying a default widget
  const handleDenyWidget = (widgetId: string) => {
    setDeniedWidgets([...deniedWidgets, widgetId])
    setHasChanges(true)
  }
  
  const totalWidgets = defaultWidgets.length + customWidgets.length

  const handleSaveChanges = () => {
    // Convert current state to widget overrides format
    const newOverrides = [
      ...customWidgets.map(widget => ({
        widgetId: widget.id,
        access: 'allow' as const,
        source: 'override' as const,
        grantedBy: 'Admin User',
        grantedAt: new Date().toISOString()
      })),
      ...deniedWidgets.map(widgetId => ({
        widgetId,
        access: 'deny' as const,
        source: 'override' as const,
        grantedBy: 'Admin User',
        grantedAt: new Date().toISOString()
      }))
    ]
    
    onUpdatePermissions(user.id, newOverrides)
    setHasChanges(false)
  }

  const handleResetChanges = () => {
    const sections = getWidgetSections(user)
    setCustomWidgets(sections.customWidgets)
    setDeniedWidgets(sections.deniedWidgets)
    setHasChanges(false)
  }

  return (
    <div className="widget-permission-manager">
      {/* Modal Header */}
      <div className="modal-header mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Dashboard Widgets for {user.name}</h2>
        <p className="text-muted text-sm text-gray-600">Role: {user.role}</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards grid grid-cols-4 gap-4 mb-8">
        <div className="summary-card bg-gray-50 rounded-lg p-4 text-center">
          <div className="value text-3xl font-semibold text-gray-800">{totalWidgets}</div>
          <div className="label text-xs text-gray-600 mt-1">Total Widgets</div>
        </div>
        <div className="summary-card bg-gray-50 rounded-lg p-4 text-center">
          <div className="value text-3xl font-semibold text-gray-800">{defaultWidgets.length}</div>
          <div className="label text-xs text-gray-600 mt-1">Default Widgets</div>
        </div>
        <div className="summary-card bg-gray-50 rounded-lg p-4 text-center">
          <div className="value value-success text-3xl font-semibold text-green-600">{customWidgets.length}</div>
          <div className="label text-xs text-gray-600 mt-1">Custom Widgets</div>
        </div>
        <div className="summary-card bg-gray-50 rounded-lg p-4 text-center">
          <div className="value text-3xl font-semibold text-gray-800">{deniedWidgets.length}</div>
          <div className="label text-xs text-gray-600 mt-1">Denied Access</div>
        </div>
      </div>

      {/* SECTION 1: DEFAULT WIDGETS */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-lg font-semibold text-gray-800 m-0">Default Widgets</h3>
          <span className="badge px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            from {user.role} role
          </span>
        </div>
        <div className="widget-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {defaultWidgets.map(({ id, widget }) => (
            <DefaultWidgetCard
              key={id}
              widget={widget}
              onDeny={() => handleDenyWidget(id)}
            />
          ))}
        </div>
      </div>

      {/* SECTION 2: CUSTOM WIDGETS (Enabled Optional Widgets) */}
      {customWidgets.length > 0 && (
        <div className="mb-12 bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-lg font-semibold text-gray-800 m-0">Custom Widgets</h3>
            <span className="badge px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {customWidgets.length} enabled
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-5">
            Optional widgets that have been enabled for this user
          </p>
          <div className="widget-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customWidgets.map(({ id, widget }) => (
              <CustomWidgetCard
                key={id}
                widget={widget}
                onDisable={() => handleDisableWidget(id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: AVAILABLE WIDGETS */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-lg font-semibold text-gray-800 m-0">Available Widgets</h3>
          <span className="text-gray-500 text-sm">all widgets across platform</span>
        </div>
        
        {Object.entries(groupedAvailableWidgets).map(([category, widgets]) => (
          <div key={category} className="category-section mb-8">
            <h4 className="text-base font-medium text-gray-700 mb-4">{category}</h4>
            <div className="widget-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {widgets.map(({ id, widget }) => (
                <AvailableWidgetCard
                  key={id}
                  widget={widget}
                  onEnable={() => handleEnableWidget(id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Footer */}
      <div className="modal-footer flex justify-between items-center pt-6 border-t border-gray-200">
        <div className="flex gap-3">
          {hasChanges && (
            <button 
              onClick={handleResetChanges}
              className="btn btn-secondary px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
        <button 
          onClick={handleSaveChanges}
          disabled={!hasChanges}
          className={`btn btn-primary px-6 py-2 rounded transition-colors ${
            hasChanges 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}

export default WidgetPermissionManager
