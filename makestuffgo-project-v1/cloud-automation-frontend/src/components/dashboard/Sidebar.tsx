'use client'

import { useState } from 'react'
import { 
  BarChart3, 
  Upload, 
  Settings, 
  FileText, 
  TrendingUp,
  Database,
  LogOut
} from 'lucide-react'

const menuItems = [
  { icon: BarChart3, label: 'Dashboard', href: '/dashboard', active: true },
  { icon: Upload, label: 'Data Upload', href: '/dashboard/upload' },
  { icon: TrendingUp, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: Database, label: 'Data Sources', href: '/dashboard/sources' },
  { icon: FileText, label: 'Reports', href: '/dashboard/reports' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
]

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState('Dashboard')

  return (
    <div className="w-64 bg-white shadow-md h-full">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">FinOps Portal</h1>
        <p className="text-sm text-gray-500 mt-1">Cost Management</p>
      </div>
      
      <nav className="mt-6">
        <div className="px-3">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = item.label === activeItem
            
            return (
              <button
                key={item.label}
                onClick={() => setActiveItem(item.label)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
