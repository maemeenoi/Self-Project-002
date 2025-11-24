'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { LoginCredentials } from '@/types/auth'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, isLoading } = useAuth()
  
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Check user roles and redirect accordingly
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const roles = user.roles || []
      
      // Priority order for role-based redirects (using proper frontend role names)
      if (roles.some((role: any) => role.name === 'SuperAdmin')) {
        router.push('/superadmin')
      } else if (roles.some((role: any) => role.name === 'CEO')) {
        router.push('/ceo')
      } else if (roles.some((role: any) => role.name === 'CFO')) {
        router.push('/cfo')
      } else if (roles.some((role: any) => role.name === 'CTO')) {
        router.push('/cto')
      } else if (roles.some((role: any) => role.name === 'Engineer')) {
        router.push('/engineer')
      } else if (roles.some((role: any) => role.name === 'Product Owner')) {
        router.push('/product-owner')
      } else if (roles.some((role: any) => role.name === 'Client Admin')) {
        router.push('/dashboard')
      } else {
        router.push('/dashboard')
      }
    }
  }, [isAuthenticated, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await login(credentials)
      
      if (response.success) {
        // Store user data for role checking
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user))
        }
        
        // Check user roles and redirect accordingly
        const roles = response.user?.roles || []
        
        // Priority order for role-based redirects (using proper frontend role names)
        if (roles.some((role: any) => role.name === 'SuperAdmin')) {
          router.push('/superadmin')
        } else if (roles.some((role: any) => role.name === 'CEO')) {
          router.push('/ceo')
        } else if (roles.some((role: any) => role.name === 'CFO')) {
          router.push('/cfo')
        } else if (roles.some((role: any) => role.name === 'CTO')) {
          router.push('/cto')
        } else if (roles.some((role: any) => role.name === 'Engineer')) {
          router.push('/engineer')
        } else if (roles.some((role: any) => role.name === 'Product Owner')) {
          router.push('/product-owner')
        } else if (roles.some((role: any) => role.name === 'Client Admin')) {
          router.push('/dashboard')
        } else {
          router.push('/dashboard')
        }
      } else {
        // Enhanced error handling based on response
        if (response.message) {
          // Check for specific error patterns
          const message = response.message.toLowerCase()
          
          if (message.includes('invalid credentials') || message.includes('invalid password') || message.includes('incorrect password')) {
            setError('Invalid email or password. Please check your credentials and try again.')
          } else if (message.includes('user not found') || message.includes('email not found')) {
            setError('No account found with this email address. Please check your email or contact support.')
          } else if (message.includes('account locked') || message.includes('locked')) {
            setError('Your account has been locked. Please contact support for assistance.')
          } else if (message.includes('account disabled') || message.includes('disabled')) {
            setError('Your account has been disabled. Please contact support for assistance.')
          } else if (message.includes('too many attempts') || message.includes('rate limit')) {
            setError('Too many login attempts. Please wait a few minutes before trying again.')
          } else if (message.includes('email not verified') || message.includes('verify email')) {
            setError('Please verify your email address before logging in. Check your inbox for a verification link.')
          } else {
            // Use the original message if it doesn't match common patterns
            setError(response.message)
          }
        } else {
          setError('Login failed. Please check your credentials and try again.')
        }
      }
    } catch (error: any) {
      // Enhanced network/system error handling
      if (error.name === 'TypeError' || error.message?.includes('fetch')) {
        setError('Unable to connect to the server. Please check your internet connection and try again.')
      } else if (error.message?.includes('timeout')) {
        setError('Connection timeout. The server is taking too long to respond. Please try again.')
      } else if (error.message?.includes('CORS')) {
        setError('Access blocked by security policy. Please contact support if this continues.')
      } else if (error.status === 429) {
        setError('Too many login attempts. Please wait a few minutes before trying again.')
      } else if (error.status >= 500) {
        setError('Server error. Please try again later or contact support if the problem continues.')
      } else if (error.status >= 400) {
        setError('Invalid request. Please check your credentials and try again.')
      } else {
        setError('An unexpected error occurred. Please try again or contact support if the problem persists.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof LoginCredentials, value: string | boolean) => {
    setCredentials(prev => ({ ...prev, [field]: value }))
    if (error) setError('') // Clear error on input change
  }

  // Demo account buttons for easy testing
  const fillDemoAccount = (email: string, password: string = '123password') => {
    setCredentials({ email, password, rememberMe: false })
    setError('')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">
              makeStuffGo
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Cloud Automation Platform
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Sign in to your account
            </p>
          </div>

          {/* Login Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                {error && (
                  <div className="alert alert-error mb-4">
                    <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Email Field */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Email address</span>
                    </label>
                    <input
                      type="email"
                      placeholder="admin@company.com"
                      className="input input-bordered"
                      value={credentials.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Password</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        className="input input-bordered w-full pr-10"
                        value={credentials.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary mr-3"
                        checked={credentials.rememberMe}
                        onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                      />
                      <span className="label-text">Remember me</span>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="form-control mt-6">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting || !credentials.email || !credentials.password}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </div>

                {/* Forgot Password Link */}
                <div className="text-center mt-4">
                  <a href="#" className="link link-primary text-sm">
                    Forgot Your Password?
                  </a>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
