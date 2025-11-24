'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

interface HeaderProps {
  onMenuClick: () => void
  showMenuButton?: boolean
}

export default function Header({ onMenuClick, showMenuButton = true }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, logout, getUserDisplayName, getRoleDisplayNames } = useAuth()
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-3 sm:px-6">
      {/* Left side */}
      <div className="flex items-center space-x-2 sm:space-x-6 flex-1 min-w-0">
        {showMenuButton && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        
        <nav className="text-sm text-gray-600 min-w-0 flex-shrink">
          <span className="font-medium text-gray-900">{user?.organizationName || 'makeStuffGo'}</span>
          <span className="mx-1 sm:mx-2">/</span>
          <span className="hidden sm:inline">{user?.primaryRole?.displayName || 'Portal'}</span>
          <span className="sm:hidden truncate">{user?.primaryRole?.displayName || 'Portal'}</span>
        </nav>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-1 sm:space-x-4 flex-shrink-0">
        {/* Role Badges - Hidden on mobile */}
        {user && user.roles.length > 0 && (
          <div className="hidden lg:flex items-center space-x-2">
            {user.roles.slice(0, 2).map((role, index) => (
              <span 
                key={role.id}
                className={`badge badge-sm ${
                  role.name === 'SuperAdmin' 
                    ? 'badge-accent' 
                    : index === 0 
                      ? 'badge-primary' 
                      : 'badge-secondary'
                }`}
                style={role.name === 'SuperAdmin' ? { backgroundColor: '#7C3AED', color: 'white' } : {}}
              >
                {role.displayName}
              </span>
            ))}
          </div>
        )}

        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-medium">
              {(() => {
                try {
                  const displayName = user ? getUserDisplayName() : null;
                  return (displayName || 'U').charAt(0).toUpperCase();
                } catch (error) {
                  console.error('Error getting user display name:', error);
                  return 'U';
                }
              })()}
            </div>
            <span className="hidden sm:inline text-sm font-medium text-gray-700 max-w-24 lg:max-w-none truncate">
              {(() => {
                try {
                  return user ? (getUserDisplayName() || 'User') : 'Admin';
                } catch (error) {
                  console.error('Error getting user display name:', error);
                  return 'User';
                }
              })()}
            </span>
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-2">
                {/* User Role Badges */}
                {user && user.roles && user.roles.length > 0 && (
                  <div className="px-3 py-2 border-b border-gray-200">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role, index) => (
                        <span
                          key={role.id}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            role.name === 'SuperAdmin'
                              ? 'bg-purple-100 text-purple-800'
                              : index === 0
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {role.displayName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={() => {
                    // Placeholder for profile functionality
                    alert('Profile page is coming soon!')
                    setShowUserMenu(false)
                  }}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md w-full text-left"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profile</span>
                </button>
                {/* Super Admin Dashboard Link */}
                {user && user.roles.some(role => role.name === 'SuperAdmin') && (
                  <a href="/superadmin" className="flex items-center space-x-2 px-3 py-2 text-sm text-purple-700 hover:bg-purple-50 rounded-md">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Super Admin Dashboard</span>
                  </a>
                )}
                
                <button 
                  onClick={() => {
                    // Placeholder for settings functionality
                    alert('Settings page is coming soon!')
                    setShowUserMenu(false)
                  }}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md w-full text-left"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings</span>
                </button>
                <hr className="my-2 border-gray-200" />
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md w-full text-left"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </header>
  )
}