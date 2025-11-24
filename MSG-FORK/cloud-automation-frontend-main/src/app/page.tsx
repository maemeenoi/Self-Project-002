'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { ArrowRightIcon, CloudIcon, ShieldCheckIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

export default function CompanyPortalPage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Helper function to get the correct dashboard path based on user role
  const getDashboardPath = (userRole?: string): string => {
    if (!userRole) return '/dashboard'
    
    switch (userRole) {
      case 'superadmin':
        return '/superadmin'
      case 'admin':
      case 'clientadmin':
        return '/dashboard'
      case 'ceo':
        return '/ceo'
      case 'cto':
        return '/cto'
      case 'cfo':
        return '/cfo'
      case 'engineer':
        return '/engineer'
      case 'product-owner':
        return '/product-owner'
      default:
        return '/dashboard'
    }
  }

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const dashboardPath = getDashboardPath(user.primaryRole?.name)
      router.push(dashboardPath)
    }
  }, [isAuthenticated, isLoading, user, router])

  const handleAccessPortal = () => {
    if (isAuthenticated && user) {
      const dashboardPath = getDashboardPath(user.primaryRole?.name)
      router.push(dashboardPath)
    } else {
      router.push('/login')
    }
  }

  const handleLogin = () => {
    router.push('/login')
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image 
                src="/logo.png" 
                alt="makeStuffGo Logo" 
                width={40} 
                height={40} 
                className="rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">makeStuffGo</h1>
                <p className="text-sm text-gray-600">Company Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleAccessPortal}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-sm"
              >
                Access Portal 
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Welcome to the
              <span className="block text-blue-600">makeStuffGo Portal</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Your centralised hub for cloud infrastructure management, performance monitoring, 
              and operational oversight. Access your role-specific dashboard to manage resources, 
              monitor systems, and collaborate with your team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleAccessPortal}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
              >
                Access Portal
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Portal Features Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Portal Features & Services
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools and dashboards designed to streamline your daily operations 
              and provide insights into our cloud infrastructure and business processes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow duration-300 border border-gray-200">
              <div className="bg-blue-50 rounded-lg p-3 w-14 h-14 flex items-center justify-center mb-6">
                <CloudIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Infrastructure Management</h4>
              <p className="text-gray-600 leading-relaxed">
                Monitor and manage Azure cloud resources, deployment pipelines, 
                and infrastructure health through comprehensive dashboards.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow duration-300 border border-gray-200">
              <div className="bg-green-50 rounded-lg p-3 w-14 h-14 flex items-center justify-center mb-6">
                <ShieldCheckIcon className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Security & Compliance</h4>
              <p className="text-gray-600 leading-relaxed">
                Access security reports, compliance monitoring, and user management 
                tools to maintain organisational security standards.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow duration-300 border border-gray-200">
              <div className="bg-purple-50 rounded-lg p-3 w-14 h-14 flex items-center justify-center mb-6">
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Analytics & Reporting</h4>
              <p className="text-gray-600 leading-relaxed">
                View performance metrics, cost analysis, and operational reports 
                tailored to your role and responsibilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 lg:p-12">
            <div className="text-center text-white">
              <h3 className="text-3xl font-bold mb-4">
                Ready to Access Your Dashboard?
              </h3>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Sign in with your company credentials to access your personalised dashboard 
                and begin managing your assigned resources and responsibilities.
              </p>
              <button
                onClick={handleAccessPortal}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all duration-200 shadow-sm flex items-center justify-center gap-2 mx-auto"
              >
                Access Your Dashboard
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>


    </div>
  )
}
