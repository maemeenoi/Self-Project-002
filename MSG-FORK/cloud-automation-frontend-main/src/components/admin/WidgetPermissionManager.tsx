'use client'

import React, { useState, useEffect } from 'react'
import { 
  getWidgetSections,
  getAllWidgets,
  getDefaultWidgetsForRole 
} from '@/lib/widgetUtils'
import { UserWithWidgets } from '@/lib/widgetUtils'
import ProfessionalToggle from '@/components/ui/ProfessionalToggle'
import { useToast } from '@/components/ui/Toast'

interface WidgetPermissionManagerProps {
  user: UserWithWidgets
  onUpdatePermissions: (userId: string, widgetOverrides: any[]) => void
}

function DefaultWidgetCard({ widget, isEnabled, onToggle, isLoading }: { 
  widget: any
  isEnabled: boolean
  onToggle: () => void
  isLoading?: boolean
}) {
  return (
    <div className={`
      bg-white rounded-xl border-2 shadow-sm hover:shadow-lg transition-all duration-200
      ${isEnabled ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-white ring-1 ring-blue-100' : 'border-gray-200 hover:border-blue-200'}
      p-6 group transform hover:scale-[1.02]
    `}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`
            w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold
            ${isEnabled ? 'bg-blue-500 text-white' : 'bg-gray-400 text-white'}
            transition-colors duration-200
          `}>
            {widget.name.charAt(0)}
          </div>
          <div>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Default
            </span>
          </div>
        </div>
        
        <ProfessionalToggle
          enabled={isEnabled}
          onToggle={onToggle}
          loading={isLoading}
          size="md"
          variant="primary"
        />
      </div>
      
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">
          {widget.name}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          {widget.description}
        </p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-md">
            {widget.category}
          </span>
          <div className="text-xs text-gray-400">
            From {widget.role || 'system'} role
          </div>
        </div>
      </div>
    </div>
  )
}

function CustomWidgetCard({ widget, isEnabled, onToggle, isLoading }: { 
  widget: any
  isEnabled: boolean
  onToggle: () => void
  isLoading?: boolean
}) {
  return (
    <div className={`
      bg-white rounded-xl border-2 shadow-sm hover:shadow-lg transition-all duration-200
      ${isEnabled ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white ring-1 ring-emerald-100' : 'border-gray-200 hover:border-emerald-200'}
      p-6 group transform hover:scale-[1.02]
    `}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`
            w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold
            ${isEnabled ? 'bg-emerald-500 text-white' : 'bg-gray-400 text-white'}
            transition-colors duration-200
          `}>
            {widget.name.charAt(0)}
          </div>
          <div>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              Custom
            </span>
          </div>
        </div>
        
        <ProfessionalToggle
          enabled={isEnabled}
          onToggle={onToggle}
          loading={isLoading}
          size="md"
          variant="success"
        />
      </div>
      
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-900 transition-colors">
          {widget.name}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          {widget.description}
        </p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-md">
            {widget.category}
          </span>
          <div className="text-xs text-gray-400">
            From {widget.role || 'custom'} role
          </div>
        </div>
      </div>
    </div>
  )
}

function AvailableWidgetCard({ widget, isEnabled, onToggle, isLoading }: { 
  widget: any
  isEnabled: boolean
  onToggle: () => void
  isLoading?: boolean
}) {
  return (
    <div className={`
      bg-white rounded-xl border-2 shadow-sm hover:shadow-lg transition-all duration-200
      ${isEnabled ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-white ring-1 ring-purple-100' : 'border-gray-200 hover:border-purple-200'}
      p-6 group transform hover:scale-[1.02]
    `}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`
            w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold
            ${isEnabled ? 'bg-purple-500 text-white' : 'bg-gray-400 text-white'}
            transition-colors duration-200
          `}>
            {widget.name.charAt(0)}
          </div>
          <div>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Available
            </span>
          </div>
        </div>
        
        <ProfessionalToggle
          enabled={isEnabled}
          onToggle={onToggle}
          loading={isLoading}
          size="md"
          variant="primary"
        />
      </div>
      
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-900 transition-colors">
          {widget.name}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          {widget.description}
        </p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-md">
            {widget.category}
          </span>
          <div className="text-xs text-gray-400">
            From {widget.role || 'available'} role
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WidgetPermissionManager({ user, onUpdatePermissions }: WidgetPermissionManagerProps) {
  const [customWidgets, setCustomWidgets] = useState<Array<{ id: string; widget: any }>>([])
  const [deniedWidgets, setDeniedWidgets] = useState<string[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  const [loadingWidgets, setLoadingWidgets] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const { showToast, ToastContainer } = useToast()

  // Initialize state from user's current overrides
  useEffect(() => {
    console.log('WidgetPermissionManager: User prop changed:', user.id, user.widgetOverrides)
    const sections = getWidgetSections(user)
    console.log('WidgetPermissionManager: Sections calculated:', sections)
    setCustomWidgets(sections.customWidgets)
    setDeniedWidgets(sections.deniedWidgets)
    setHasChanges(false)
  }, [user])

  // Get default widgets from role
  const defaultWidgets = getDefaultWidgetsForRole(user.role)
  
  // Get available widgets (excluding defaults and custom) with search filtering
  const allWidgets = getAllWidgets()
  const availableWidgets = allWidgets.filter(widget => 
    !defaultWidgets.some(dw => dw.id === widget.id) &&
    !customWidgets.some(cw => cw.id === widget.id) &&
    !deniedWidgets.includes(widget.id) &&
    // Search filter
    (searchQuery === '' || 
     widget.widget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     widget.widget.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
     widget.widget.category.toLowerCase().includes(searchQuery.toLowerCase()))
  )
  
  // Group available widgets by category
  const groupedAvailableWidgets = availableWidgets.reduce((acc, widget) => {
    const category = widget.widget.category || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(widget)
    return acc
  }, {} as Record<string, Array<{ id: string; widget: any }>>)
  
  // Handle toggling a default widget (deny/restore)
  const handleToggleDefaultWidget = async (widgetId: string) => {
    setLoadingWidgets(prev => new Set([...prev, widgetId]))
    
    if (deniedWidgets.includes(widgetId)) {
      // Restore access
      setDeniedWidgets(deniedWidgets.filter(id => id !== widgetId))
      showToast('Widget access restored')
    } else {
      // Deny access
      setDeniedWidgets([...deniedWidgets, widgetId])
      showToast('Widget access denied')
    }
    setHasChanges(true)
    
    setTimeout(() => {
      setLoadingWidgets(prev => {
        const newSet = new Set(prev)
        newSet.delete(widgetId)
        return newSet
      })
    }, 500)
  }
  
  // Handle toggling a custom widget (enable/disable)
  const handleToggleCustomWidget = async (widgetId: string) => {
    setLoadingWidgets(prev => new Set([...prev, widgetId]))
    
    setCustomWidgets(customWidgets.filter(w => w.id !== widgetId))
    setHasChanges(true)
    showToast('Custom widget removed')
    
    setTimeout(() => {
      setLoadingWidgets(prev => {
        const newSet = new Set(prev)
        newSet.delete(widgetId)
        return newSet
      })
    }, 500)
  }
  
  // Handle toggling an available widget (enable)
  const handleToggleAvailableWidget = async (widgetId: string) => {
    setLoadingWidgets(prev => new Set([...prev, widgetId]))
    
    const widget = allWidgets.find(w => w.id === widgetId)
    if (widget) {
      setCustomWidgets([...customWidgets, widget])
      setHasChanges(true)
      showToast('Widget added successfully')
    }
    
    setTimeout(() => {
      setLoadingWidgets(prev => {
        const newSet = new Set(prev)
        newSet.delete(widgetId)
        return newSet
      })
    }, 500)
  }
  
  const totalWidgets = defaultWidgets.length + customWidgets.length

  const handleSaveChanges = async () => {
    try {
      setLoadingWidgets(prev => new Set([...prev, 'saving']))
      
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
      
      console.log('WidgetPermissionManager: Saving changes for user:', user.id)
      console.log('WidgetPermissionManager: Current customWidgets:', customWidgets)
      console.log('WidgetPermissionManager: Current deniedWidgets:', deniedWidgets)
      console.log('WidgetPermissionManager: Sending newOverrides:', newOverrides)
      
      await onUpdatePermissions(user.id, newOverrides)
      setHasChanges(false)
      showToast('Widget permissions saved successfully')
      
    } catch (error) {
      console.error('Failed to save permissions:', error)
      showToast('Failed to save permissions. Please try again.', 'error')
    } finally {
      setLoadingWidgets(prev => {
        const newSet = new Set(prev)
        newSet.delete('saving')
        return newSet
      })
    }
  }

  const handleResetChanges = () => {
    const sections = getWidgetSections(user)
    setCustomWidgets(sections.customWidgets)
    setDeniedWidgets(sections.deniedWidgets)
    setHasChanges(false)
  }

  return (
    <div className="widget-permission-manager p-4 lg:p-6">

      {/* Modal Header */}
      <div className="modal-header mb-6">
        <h2 className="text-xl lg:text-2xl font-semibold text-gray-800 mb-1">Dashboard Widgets for {user.name}</h2>
        <p className="text-muted text-sm text-gray-600">Role: {user.role}</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
        <div className="integrations-grid">
          {defaultWidgets.map(({ id, widget }) => (
            <DefaultWidgetCard
              key={id}
              widget={widget}
              isEnabled={!deniedWidgets.includes(id)}
              onToggle={() => handleToggleDefaultWidget(id)}
              isLoading={loadingWidgets.has(id)}
            />
          ))}
        </div>
      </div>

      {/* SECTION 2: CUSTOM WIDGETS (Enabled Optional Widgets) */}
      <div className="mb-12 bg-green-50/30 p-6 rounded-lg border-2 border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-lg font-semibold text-gray-800 m-0">Custom Widgets</h3>
          <span className="badge px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {customWidgets.length} enabled
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-5">
          Optional widgets that have been enabled for this user
        </p>
        
        {customWidgets.length > 0 ? (
          <div className="integrations-grid">
            {customWidgets.map(({ id, widget }) => (
              <CustomWidgetCard
                key={id}
                widget={widget}
                isEnabled={true}
                onToggle={() => handleToggleCustomWidget(id)}
                isLoading={loadingWidgets.has(id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">
              No custom widgets enabled. Enable widgets from Available Widgets below.
            </p>
          </div>
        )}
      </div>

      {/* SECTION 3: AVAILABLE WIDGETS */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-lg font-semibold text-gray-800 m-0">Available Widgets</h3>
          <span className="text-gray-500 text-sm">all widgets across platform</span>
        </div>
        
        {/* Search Input */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search widgets by name, description, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         text-sm placeholder-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-500 mt-2">
              Found {availableWidgets.length} widget{availableWidgets.length !== 1 ? 's' : ''} matching "{searchQuery}"
            </p>
          )}
        </div>
        
        {Object.keys(groupedAvailableWidgets).length > 0 ? (
          Object.entries(groupedAvailableWidgets).map(([category, widgets]) => (
            <div key={category} className="category-section mb-8">
              <h4 className="text-base font-medium text-gray-700 mb-4">{category}</h4>
              <div className="integrations-grid">
                {widgets.map(({ id, widget }) => (
                  <AvailableWidgetCard
                    key={id}
                    widget={widget}
                    isEnabled={false}
                    onToggle={() => handleToggleAvailableWidget(id)}
                    isLoading={loadingWidgets.has(id)}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">
              {searchQuery 
                ? `No widgets found matching "${searchQuery}". Try a different search term.`
                : 'All available widgets have been added or are default widgets.'
              }
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal Footer */}
      <div className="modal-footer flex justify-between items-center pt-6 border-t border-gray-200">
        <div className="flex items-center gap-3">
          {hasChanges && (
            <>
              <span className="flex items-center gap-2 text-sm text-orange-600">
                <span className="h-2 w-2 bg-orange-500 rounded-full animate-pulse" />
                Unsaved changes
              </span>
              <button 
                onClick={handleResetChanges}
                className="btn btn-secondary px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors"
                disabled={loadingWidgets.has('saving')}
              >
                Cancel
              </button>
            </>
          )}
        </div>
        
        <button 
          onClick={handleSaveChanges}
          disabled={!hasChanges || loadingWidgets.has('saving')}
          className={`btn btn-primary px-6 py-2 rounded transition-all duration-200 flex items-center gap-2 ${
            hasChanges && !loadingWidgets.has('saving')
              ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg cursor-pointer' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          } ${loadingWidgets.has('saving') ? 'opacity-75' : ''}`}
        >
          {loadingWidgets.has('saving') ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  )
}
