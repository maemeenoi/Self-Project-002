'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Network
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/admin', 
    Icon: LayoutDashboard
  },
  { 
    name: 'Users', 
    href: '/users', 
    Icon: Users
  },
  { 
    name: 'Integrations', 
    href: '/admin/integrations', 
    Icon: Network
  },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-base-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-base-300 bg-base-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-base-content">makeStuffGo</span>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden btn btn-ghost btn-sm"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          {/* Section Title */}
          <div className="px-3 mb-4">
            <h3 className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
              MAIN
            </h3>
          </div>

          {/* Navigation Items */}
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const { Icon } = item
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group
                    ${isActive 
                      ? 'bg-base-200 border-l-4 border-primary font-semibold text-base-content' 
                      : 'text-base-content/90 hover:bg-base-200 hover:text-base-content'
                    }
                  `}
                  onClick={() => {
                    // Only close sidebar on mobile
                    if (window.innerWidth < 1024) {
                      onClose()
                    }
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-6 left-4 right-4">
          <div className="bg-base-100 rounded-lg p-4 border border-base-300 shadow-sm">
            <div className="text-xs font-medium text-base-content/60 uppercase tracking-wide">
              System Status
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-sm font-medium text-base-content">All Systems Operational</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
