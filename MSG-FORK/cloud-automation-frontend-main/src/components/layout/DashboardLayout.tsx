'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import Sidebar from './Sidebar'
import Header from './Header'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, hasRole } = useAuth()

  // Show sidebar for admin and client admin users
  const showSidebar = hasRole('Client Admin')

  // Set sidebar open by default on desktop
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true)
      }
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Only for admin users */}
      {showSidebar && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          showMenuButton={showSidebar}
        />
        
        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
