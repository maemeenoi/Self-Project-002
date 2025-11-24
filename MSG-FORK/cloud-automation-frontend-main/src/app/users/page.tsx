'use client'

import { useState, useMemo, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import WidgetPermissionManager from '@/components/admin/WidgetPermissionManager'
import { UserWithWidgets } from '@/lib/widgetUtils'

// Import API URL from environment config
const API_URL = process.env.NEXT_PUBLIC_API_URL

// Simple API helper
const api = {
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  },
  put: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  },
  delete: async (endpoint: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE'
    })
    return response.json()
  }
}

interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
  status: 'active' | 'inactive'
  lastSignIn: string
  avatar?: string
  phone?: string
  location?: string
  joinDate?: string
  userGroups?: string[]
  widgetOverrides?: Array<{
    widgetId: string
    access: 'allow' | 'deny'
    source: 'role' | 'override'
    grantedBy: string
    grantedAt: string
  }>
}

interface UserModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSave: (user: User) => void
}

interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (user: Omit<User, 'id'>) => void
}

// Function to calculate widget overrides from selected user groups
function calculateWidgetOverridesFromGroups(selectedGroups: string[]): Array<{
  widgetId: string
  access: 'allow' | 'deny'
  source: 'role' | 'override'
  grantedBy: string
  grantedAt: string
}> {
  const widgetOverrides: Array<{
    widgetId: string
    access: 'allow' | 'deny'
    source: 'role' | 'override'
    grantedBy: string
    grantedAt: string
  }> = []
  
  const now = new Date().toISOString()
  
  // Collect all widgets from selected groups
  const allGroupWidgets = new Set<string>()

  
  // Create widget overrides for all group widgets
  allGroupWidgets.forEach(widgetId => {
    widgetOverrides.push({
      widgetId,
      access: 'allow',
      source: 'override',
      grantedBy: 'User Group Assignment',
      grantedAt: now
    })
  })
  
  return widgetOverrides
}

interface UserActionsDropdownProps {
  user: User
  onEdit: () => void
  onManageWidgets: () => void
  onResetPassword: () => void
  onToggleStatus: () => void
  onDelete: () => void
}

function UserActionsDropdown({ user, onEdit, onManageWidgets, onResetPassword, onToggleStatus, onDelete }: UserActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null)

  const handleAction = (action: () => void) => {
    console.log('Dropdown action triggered for user:', user.name)
    action()
    setIsOpen(false)
  }

  console.log('UserActionsDropdown render - isOpen:', isOpen, 'user:', user.name)

  const getDropdownPosition = () => {
    if (!buttonRef) return { top: 0, right: 0, showAbove: false }
    
    const rect = buttonRef.getBoundingClientRect()
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
    
    // Dropdown dimensions (6 items * 40px + padding + divider)
    const dropdownHeight = 260
    const dropdownWidth = 200
    const margin = 8
    
    // Calculate space available below and above
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    
    let top, right
    let showAbove = false
    
    // Determine if we should show above or below
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      // Show above
      showAbove = true
      top = rect.top + scrollTop - dropdownHeight - 4
    } else {
      // Show below
      top = rect.bottom + scrollTop + 4
    }
    
    // Position horizontally (always align to right of button)
    right = window.innerWidth - rect.right - scrollLeft
    
    // Ensure dropdown doesn't go off screen
    if (right < margin) {
      right = margin
    }
    
    console.log('Dropdown position:', { 
      top, 
      right, 
      showAbove, 
      spaceBelow, 
      spaceAbove, 
      rectBottom: rect.bottom,
      windowHeight: window.innerHeight 
    })
    
    return { top, right, showAbove }
  }

  const dropdownPosition = getDropdownPosition()

  return (
    <div className="relative">
      <button 
        ref={setButtonRef}
        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        onClick={(e) => {
          e.stopPropagation()
          console.log('Dropdown button clicked, current state:', isOpen)
          setIsOpen(!isOpen)
        }}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[999]" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Professional Action Menu - Fixed Position */}
          <div 
            className="fixed bg-white border-2 border-blue-500 rounded-md shadow-xl z-[1000] min-w-[200px] py-2"
            style={{
              top: `${dropdownPosition.top}px`,
              right: `${dropdownPosition.right}px`,
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              maxHeight: `${Math.min(280, window.innerHeight - 16)}px`,
              overflowY: 'auto',
              overflowX: 'visible'
            }}
          >
            <button
              className="menu-item"
              onClick={() => handleAction(onEdit)}
            >
              Edit User
            </button>
            <button
              className="menu-item"
              onClick={() => handleAction(onManageWidgets)}
            >
              Manage Widgets
            </button>
            <button
              className="menu-item"
              onClick={() => handleAction(onResetPassword)}
            >
              Reset Password
            </button>
            <div className="menu-divider"></div>
            <button
              className="menu-item"
              onClick={() => handleAction(onToggleStatus)}
            >
              {user.status === 'active' ? 'Deactivate' : 'Activate'} User
            </button>
            <button
              className="menu-item danger"
              onClick={() => handleAction(onDelete)}
            >
              Delete User
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function UserModal({ user, isOpen, onClose, onSave }: UserModalProps) {
  const [formData, setFormData] = useState<User | null>(user)
  const [isSaving, setIsSaving] = useState(false)

  // Update form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData(user)
    }
  }, [user])

  if (!isOpen || !user) return null

  const handleSave = async () => {
    if (!formData) return
    
    setIsSaving(true)
    try {
      // Get auth token
      const token = localStorage.getItem("auth_token")
      if (!token) {
        alert("Authentication token not found. Please log in again.")
        return
      }

      // Parse the name field to first and last name if needed
      const nameParts = formData.name.split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      // Prepare the update payload
      const updatePayload = {
        first_name: firstName,
        last_name: lastName,
        email: formData.email,
        role: formData.role, // Include the role in the update
        department: formData.department,
        is_active: formData.status === 'active',
        phone: formData.phone,
        location: formData.location
      }

      console.log('Updating user:', formData.id, 'with payload:', updatePayload)

      const response = await fetch(`${API_URL}/api/admin/users/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatePayload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to update user: ${response.status} - ${errorText}`)
      }

      const updatedUser = await response.json()
      console.log('User updated successfully:', updatedUser)
      
      // Update the local state with the updated user data
      const updatedFormData = {
        ...formData,
        name: `${updatedUser.first_name || ''} ${updatedUser.last_name || ''}`.trim(),
        email: updatedUser.email,
        role: formData.role, // Keep the role that was actually selected in the form
        department: updatedUser.department,
        status: updatedUser.is_active ? 'active' : 'inactive' as 'active' | 'inactive',
        phone: updatedUser.phone,
        location: updatedUser.location
      }
      
      onSave(updatedFormData)
      onClose()
      
    } catch (error) {
      console.error('Error updating user:', error)
      alert(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Edit User</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData?.name || ''}
              onChange={(e) => setFormData(prev => prev ? {...prev, name: e.target.value} : null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData?.email || ''}
              onChange={(e) => setFormData(prev => prev ? {...prev, email: e.target.value} : null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={formData?.role || ''}
              onChange={(e) => setFormData(prev => prev ? {...prev, role: e.target.value} : null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Client Admin">Client Admin</option>
              <option value="CEO">CEO</option>
              <option value="CTO">CTO</option>
              <option value="CFO">CFO</option>
              <option value="Product Owner">Product Owner</option>
              <option value="Engineer">Engineer</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={formData?.department || ''}
              onChange={(e) => setFormData(prev => prev ? {...prev, department: e.target.value} : null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Engineering">Engineering</option>
              <option value="Finance">Finance</option>
              <option value="Executive">Executive</option>
              <option value="Product">Product</option>
              <option value="HR">HR</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData?.status || ''}
              onChange={(e) => setFormData(prev => prev ? {...prev, status: e.target.value as 'active' | 'inactive'} : null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AddUserModal({ isOpen, onClose, onAdd }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    role: '',
    department: '',
    phone: '',
    location: '',
    isActive: true,
    selectedGroups: [] as string[]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.role) {
      alert('Please fill in all required fields (First Name, Last Name, Email, Password, Role)')
      return
    }

    try {
      // Get current user's company ID
      const token = localStorage.getItem('auth_token')
      console.log('Token check:', token ? 'Token found' : 'No token found')
      
      if (!token) {
        alert('Authentication required. Please login again.')
        // Don't redirect immediately, let user dismiss the modal first
        return
      }

      let userPayload
      try {
        userPayload = JSON.parse(atob(token.split('.')[1]))
        console.log('User payload from token:', userPayload)
        
        // Check if token is expired
        if (userPayload.exp && userPayload.exp < Math.floor(Date.now() / 1000)) {
          alert('Your session has expired. Please login again.')
          localStorage.removeItem('auth_token')
          return
        }
        
      } catch (error) {
        console.error('Failed to parse token:', error)
        alert('Invalid authentication token. Please login again.')
        localStorage.removeItem('auth_token')
        return
      }
      
      const companyId = userPayload.company_id
      console.log('Company ID for new user:', companyId)
      console.log('User company_id:', userPayload.company_id)
      console.log('Full userPayload:', userPayload)

      if (!companyId) {
        alert('Could not determine company ID. Please login again.')
        return
      }

      // Create user via backend API
      const currentUserId = userPayload.sub
      const response = await fetch(`${API_URL}/api/admin/company/${companyId}/users?current_user_id=${currentUserId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          middle_name: formData.middleName || null,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone || null,
          department: formData.department || null,
          location: formData.location || null,
          password: formData.password,
          role: formData.role,
          is_company_admin: false
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to create user')
      }

      const userData = await response.json()
      
      // Success - close modal and refresh users list
      const fullName = `${formData.firstName} ${formData.middleName} ${formData.lastName}`.replace(/\s+/g, ' ').trim()
      alert(`User ${fullName} created successfully! They can now login with their email and password.`)
      
      // Reset form
      setFormData({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        password: '',
        role: '',
        department: '',
        phone: '',
        location: '',
        isActive: true,
        selectedGroups: []
      })
      
      onClose()
      
      // Refresh the users list
      window.location.reload()

    } catch (error) {
      console.error('Failed to create user:', error)
      alert(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleGroupChange = (groupId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      selectedGroups: checked 
        ? [...prev.selectedGroups, groupId]
        : prev.selectedGroups.filter(id => id !== groupId)
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add New User</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({...prev, firstName: e.target.value}))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="First name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
              <input
                type="text"
                value={formData.middleName}
                onChange={(e) => setFormData(prev => ({...prev, middleName: e.target.value}))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Middle name (optional)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({...prev, lastName: e.target.value}))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Last name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter password for user login"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData(prev => ({...prev, role: e.target.value}))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Role</option>
                <option value="Client Admin">Client Admin</option>
                <option value="CEO">CEO</option>
                <option value="CTO">CTO</option>
                <option value="CFO">CFO</option>
                <option value="Product Owner">Product Owner</option>
                <option value="Engineer">Engineer</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData(prev => ({...prev, department: e.target.value}))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Department (Optional)</option>
                <option value="Engineering">Engineering</option>
                <option value="Finance">Finance</option>
                <option value="Executive">Executive</option>
                <option value="Product">Product</option>
                <option value="HR">HR</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1 234-567-8900"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="City, State"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.isActive ? 'active' : 'inactive'}
              onChange={(e) => setFormData(prev => ({...prev, isActive: e.target.value === 'active'}))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium text-gray-900 mb-3">User Groups</h4>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function UsersPage() {
  // TODO: Replace with real API when backend is ready
  // BACKEND INTEGRATION POINT: This will call /api/admin/users endpoint
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [sortConfig, setSortConfig] = useState<{key: keyof User, direction: 'asc' | 'desc'} | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    department: '',
    lastSignIn: ''
  })
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [showWidgetManager, setShowWidgetManager] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Load users from API on component mount
  useEffect(() => {
    loadUsers()
  }, [])

  // Update selectedUser when users array changes (for widget permissions updates)
  useEffect(() => {
    if (selectedUser && users.length > 0) {
      const updatedUser = users.find(user => user.id === selectedUser.id)
      if (updatedUser && JSON.stringify(updatedUser.widgetOverrides) !== JSON.stringify(selectedUser.widgetOverrides)) {
        setSelectedUser(updatedUser)
      }
    }
  }, [users, selectedUser])

  // Load users from backend database
  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get authentication token
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setError('Authentication required. Please login again.')
        return
      }

      // Get current user's company ID from token
      const userPayload = JSON.parse(atob(token.split('.')[1]))
      const companyId = userPayload.company_id
      const currentUserId = userPayload.sub
      
      console.log('Fetching users for company:', companyId, 'current user:', currentUserId)
      
      if (!companyId || !currentUserId) {
        throw new Error('Could not determine company ID or current user ID from token')
      }
      
      // Fetch users from backend using the correct endpoint
      const url = `${API_URL}/api/admin/company/${companyId}/users?current_user_id=${currentUserId}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`)
      }

      const backendUsers = await response.json()
      console.log('Backend users response:', backendUsers)
      
      // Transform backend users to frontend format
      const transformedUsers: User[] = backendUsers.map((user: any) => ({
        id: user.user_id.toString(),
        name: `${user.first_name} ${user.middle_name || ''} ${user.last_name}`.replace(/\s+/g, ' ').trim(),
        email: user.email,
        role: user.role || 'Unknown',
        department: user.department || 'Not specified',
        status: user.is_active ? 'active' : 'inactive',
        phone: user.phone || '',
        location: user.location || '',
        lastSignIn: user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never',
        joinDate: user.created_at ? new Date(user.created_at).toLocaleDateString() : '',
        userGroups: [],
        widgetOverrides: []
      }))
      
      setUsers(transformedUsers)
      console.log('Transformed users:', transformedUsers)
      
    } catch (err) {
      console.error('Failed to load users:', err)
      setError('Failed to load users. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Reload users when filters change
  useEffect(() => {
    if (!loading) { // Don't reload on initial mount
      const debounceTimer = setTimeout(() => {
        loadUsers()
      }, 300) // Debounce API calls

      return () => clearTimeout(debounceTimer)
    }
  }, [filters.search, filters.role, filters.status, filters.department])

  // Filtering and sorting logic
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const searchTerm = filters.search.toLowerCase()
      const matchesSearch = user.name.toLowerCase().includes(searchTerm) || 
                           user.email.toLowerCase().includes(searchTerm)
      const matchesRole = !filters.role || user.role === filters.role
      const matchesStatus = !filters.status || user.status === filters.status
      const matchesDepartment = !filters.department || user.department === filters.department
      
      return matchesSearch && matchesRole && matchesStatus && matchesDepartment
    })

    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key] || ''
        const bValue = b[sortConfig.key] || ''
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [users, filters, sortConfig])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage)
  const paginatedUsers = filteredAndSortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (key: keyof User) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(userId)) {
        newSet.delete(userId)
      } else {
        newSet.add(userId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedUsers.size === paginatedUsers.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(paginatedUsers.map(u => u.id)))
    }
  }

  const handleUserAction = (action: string, user: User) => {
    console.log('User action:', action, 'for user:', user.name)
    
    switch (action) {
      case 'edit':
        setSelectedUser(user)
        setIsModalOpen(true)
        break
      case 'deactivate':
        setUsers(prev => prev.map(u => 
          u.id === user.id ? {...u, status: u.status === 'active' ? 'inactive' : 'active'} : u
        ))
        alert(`User ${user.name} has been ${user.status === 'active' ? 'deactivated' : 'activated'}`)
        break
      case 'delete':
        if (confirm(`Are you sure you want to delete ${user.name}?`)) {
          handleDeleteUser(user)
        }
        break
      case 'reset-password':
        alert(`Password reset email sent to ${user.email}`)
        break
    }
  }

  const handleBulkAction = (action: string) => {
    const selectedUsersList = users.filter(u => selectedUsers.has(u.id))
    
    switch (action) {
      case 'activate':
        setUsers(prev => prev.map(u => 
          selectedUsers.has(u.id) ? {...u, status: 'active'} : u
        ))
        break
      case 'deactivate':
        setUsers(prev => prev.map(u => 
          selectedUsers.has(u.id) ? {...u, status: 'inactive'} : u
        ))
        break
      case 'delete':
        if (confirm(`Are you sure you want to delete ${selectedUsers.size} user(s)?`)) {
          setUsers(prev => prev.filter(u => !selectedUsers.has(u.id)))
        }
        break
    }
    setSelectedUsers(new Set())
  }

  // TODO: Replace with real API when backend is ready
  // BACKEND INTEGRATION POINT: This will call /api/admin/users POST endpoint
  const handleAddUser = async (newUserData: Omit<User, 'id'>) => {
    try {
      setLoading(true)
      // Add user via backend API
      const response = await api.post('/admin/users', newUserData)
      
      if (response.success) {
        // Reload users to get updated list
        await loadUsers()
        
        const widgetCount = newUserData.widgetOverrides?.length || 0
        const groupCount = newUserData.userGroups?.length || 0
        
        alert(`User ${newUserData.name} added successfully!\n` +
              `Groups: ${groupCount}\n` +
              `Widgets granted: ${widgetCount}`)
      } else {
        setError('Failed to create user. Please try again.')
      }
    } catch (err) {
      console.error('Failed to create user:', err)
      setError('Failed to create user. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (user: User) => {
    try {
      setLoading(true)
      
      // Get authentication token
      const token = localStorage.getItem('auth_token')
      if (!token) {
        alert('Authentication required. Please login again.')
        return
      }

      console.log('Deleting user:', user.id, user.name)

      const response = await fetch(`${API_URL}/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to delete user: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('User deleted successfully:', result)
      
      // Remove user from local state
      setUsers(prev => prev.filter(u => u.id !== user.id))
      alert(`User ${user.name} has been deleted successfully`)
      
    } catch (error) {
      console.error('Error deleting user:', error)
      alert(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleManageWidgets = (user: User) => {
    console.log('Managing widgets for user:', user.name)
    setSelectedUser(user)
    setShowWidgetManager(true)
  }

  // TODO: Replace with real API when backend is ready
  // BACKEND INTEGRATION POINT: This will call /api/admin/users/:id/widgets PUT endpoint
  const handleUpdateWidgetPermissions = async (userId: string, widgetOverrides: any[]) => {
    try {
      console.log('Parent: handleUpdateWidgetPermissions called for user:', userId)
      console.log('Parent: Received widgetOverrides:', widgetOverrides)
      
      // Update user widget overrides via backend API
      const response = await api.put(`/admin/users/${userId}/widgets`, { widgetOverrides })
      
      if (response.success) {
        console.log('Parent: API response successful, updating local state')
        
        // Update local state instead of reloading from API
        setUsers(prevUsers => {
          const updatedUsers = prevUsers.map(user => 
            user.id === userId 
              ? { ...user, widgetOverrides } 
              : user
          )
          console.log('Parent: Updated users state:', updatedUsers.find(u => u.id === userId)?.widgetOverrides)
          return updatedUsers
        })
        alert('Widget permissions updated successfully!')
      } else {
        setError('Failed to update widget permissions. Please try again.')
      }
    } catch (err) {
      console.error('Failed to update widget permissions:', err)
      setError('Failed to update widget permissions. Please try again.')
    }
  }

  // Convert User to UserWithWidgets for widget manager
  const convertToUserWithWidgets = (user: User): UserWithWidgets => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    widgetOverrides: user.widgetOverrides || []
  })

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Department', 'Status', 'Last Sign In']
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedUsers.map(user => 
        [user.name, user.email, user.role, user.department, user.status, user.lastSignIn].join(',')
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Client Admin': return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'CEO': return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'CTO': return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'CFO': return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'Product Owner': return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'Engineer': return 'bg-blue-100 text-blue-800 border border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-blue-100 text-blue-800 border border-blue-200' 
      : 'bg-gray-100 text-gray-800 border border-gray-200'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading users...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
                <div className="mt-3">
                  <button
                    onClick={loadUsers}
                    className="bg-red-100 px-3 py-1 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Only show when not loading */}
        {!loading && (
          <div>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-heading font-semibold text-gray-900 dark:text-white">
                  User Management
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1 font-sans">
                  Manage users and their permissions
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={exportToCSV}
                  className="btn btn-outline btn-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export CSV
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add User
                </button>
              </div>
            </div>

            {/* Filters */}
            <section className="bg-blue-50 border border-blue-100 rounded-xl p-6 md:p-8 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={filters.role}
                onChange={(e) => setFilters(prev => ({...prev, role: e.target.value}))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Roles</option>
                <option value="Client Admin">Client Admin</option>
                <option value="CEO">CEO</option>
                <option value="CTO">CTO</option>
                <option value="CFO">CFO</option>
                <option value="Product Owner">Product Owner</option>
                <option value="Engineer">Engineer</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={filters.department}
                onChange={(e) => setFilters(prev => ({...prev, department: e.target.value}))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Finance">Finance</option>
                <option value="Executive">Executive</option>
                <option value="Product">Product</option>
                <option value="HR">HR</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => setFilters({search: '', role: '', status: '', department: '', lastSignIn: ''})}
                className="w-full p-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.size > 0 && (
          <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedUsers.size} user(s) selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="px-3 py-1 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
              </section>

        {/* Users Table */}
        <section className="bg-blue-50 border border-blue-100 rounded-xl p-6 md:p-8">
          <div className="bg-white rounded-lg shadow-sm border border-blue-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="user-table min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.size === paginatedUsers.length && paginatedUsers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Name</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Email</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Role</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('department')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Department</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('lastSignIn')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Last Sign In</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="table-row hover:bg-gray-50 cursor-pointer relative"
                    onClick={() => {
                      setSelectedUser(user)
                      setIsModalOpen(true)
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.department}</div>
                      <div className="text-sm text-gray-500">Since {user.joinDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastSignIn}
                    </td>
                    <td className="table-cell actions px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative" onClick={(e) => e.stopPropagation()}>
                      <UserActionsDropdown 
                        user={user}
                        onEdit={() => handleUserAction('edit', user)}
                        onManageWidgets={() => handleManageWidgets(user)}
                        onResetPassword={() => handleUserAction('reset-password', user)}
                        onToggleStatus={() => handleUserAction('deactivate', user)}
                        onDelete={() => handleUserAction('delete', user)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredAndSortedUsers.length)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{filteredAndSortedUsers.length}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
          </div>
        </section>

            {/* User Modal */}
            <UserModal
              user={selectedUser}
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false)
                setSelectedUser(null)
              }}
              onSave={(updatedUser) => {
                setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u))
              }}
            />

            {/* Add User Modal */}
            <AddUserModal
              isOpen={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              onAdd={handleAddUser}
            />

            {/* Widget Permission Manager */}
            {showWidgetManager && selectedUser && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Widget Permissions</h2>
                    <button 
                      onClick={() => setShowWidgetManager(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-6">
                    <WidgetPermissionManager
                      user={convertToUserWithWidgets(selectedUser)}
                      onUpdatePermissions={handleUpdateWidgetPermissions}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
