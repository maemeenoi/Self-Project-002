'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import LoginForm from '@/components/auth/LoginForm'

export default function HomePage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken')
    if (token) {
      setIsAuthenticated(true)
      router.push('/dashboard')
    } else {
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Company Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-cyan-400 rounded-full blur-lg"></div>
          <div className="absolute bottom-40 left-32 w-28 h-28 bg-blue-300 rounded-full blur-lg"></div>
          <div className="absolute bottom-20 right-20 w-36 h-36 bg-indigo-400 rounded-full blur-xl"></div>
        </div>
        
        {/* Floating Icons */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-32 right-40 text-blue-300">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 18H5V8.5C5 6.567 6.567 5 8.5 5S12 6.567 12 8.5V9h2V8.5C14 5.462 11.538 3 8.5 3S3 5.462 3 8.5V18c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V10h-2v8zM12 12h8v2h-8z"/>
            </svg>
          </div>
          <div className="absolute bottom-32 left-40 text-cyan-300">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
            </svg>
          </div>
          <div className="absolute top-60 left-24 text-blue-200">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span className="text-2xl font-bold">FinOps Portal</span>
            </div>
          </div>

          {/* Main Heading */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              The Modern Cloud Cost
              <br />
              Management Platform
            </h1>
            <p className="text-lg text-blue-200 mb-8 handwriting-style">
              Loved by Developers, Trusted by
              <br />
              Businesses
            </p>
          </div>

          {/* Description */}
          <div className="mb-12">
            <p className="text-gray-300 text-lg leading-relaxed">
              FinOps Portal is the industry's first AI-powered platform to simplify your
              cloud cost management - Cost Analytics, Optimization, Budgeting, and much more.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="mb-8">
            <p className="text-gray-400 text-sm mb-6 uppercase tracking-wider">
              TRUSTED BY DEVELOPERS, DEVOPS, FINANCE AND OTHERS, ACROSS WORLD'S
              LEADING DIGITAL BUSINESSES
            </p>
            
            {/* Company Logos */}
            <div className="grid grid-cols-4 gap-8 opacity-60">
              <div className="text-gray-400 text-lg font-semibold">Microsoft</div>
              <div className="text-gray-400 text-lg font-semibold">Amazon</div>
              <div className="text-gray-400 text-lg font-semibold">Google</div>
              <div className="text-gray-400 text-lg font-semibold">Netflix</div>
              <div className="text-gray-400 text-lg font-semibold">Spotify</div>
              <div className="text-gray-400 text-lg font-semibold">Airbnb</div>
              <div className="text-gray-400 text-lg font-semibold">Uber</div>
              <div className="text-gray-400 text-lg font-semibold">Tesla</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Sign Up Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-8 py-12 lg:px-16">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">FinOps Portal</span>
            </div>
          </div>
          
          <LoginForm onLogin={() => setIsAuthenticated(true)} />
        </div>
      </div>
    </div>
  )
}
