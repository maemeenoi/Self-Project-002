'use client'

import { useAuth } from '@/context/AuthContext'
import Header from './Header'

interface SimpleLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export default function SimpleLayout({ children, title, subtitle }: SimpleLayoutProps) {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        onMenuClick={() => {}} 
        showMenuButton={false}
      />
      
      {/* Main content */}
      <main className="px-6 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-gray-600">{subtitle}</p>
          )}
        </div>

        {/* Page content */}
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
