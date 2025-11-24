'use client'

import React from 'react'

interface ProfessionalToggleProps {
  enabled: boolean
  onToggle: () => void
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'success' | 'danger'
  disabled?: boolean
}

export default function ProfessionalToggle({
  enabled,
  onToggle,
  loading = false,
  size = 'md',
  variant = 'primary',
  disabled = false
}: ProfessionalToggleProps) {
  const sizeClasses = {
    sm: 'w-10 h-5',
    md: 'w-12 h-6',
    lg: 'w-14 h-7'
  }

  const thumbSizeClasses = {
    sm: 'w-4 h-4 transform translate-x-0.5',
    md: 'w-5 h-5 transform translate-x-0.5', 
    lg: 'w-6 h-6 transform translate-x-0.5'
  }

  const thumbTranslateClasses = {
    sm: enabled ? 'translate-x-5' : 'translate-x-0.5',
    md: enabled ? 'translate-x-6' : 'translate-x-0.5',
    lg: enabled ? 'translate-x-7' : 'translate-x-0.5'
  }

  const getVariantColors = () => {
    if (enabled) {
      switch (variant) {
        case 'success':
          return 'bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-500'
        case 'danger':
          return 'bg-gradient-to-r from-red-500 to-red-600 border-red-500'
        default:
          return 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-500 shadow-blue-200'
      }
    }
    return 'bg-gray-200 border-gray-300'
  }

  const getHoverColors = () => {
    if (disabled || loading) return ''
    
    if (enabled) {
      switch (variant) {
        case 'success':
          return 'hover:from-emerald-600 hover:to-emerald-700 hover:border-emerald-600 hover:shadow-lg hover:shadow-emerald-200'
        case 'danger':
          return 'hover:from-red-600 hover:to-red-700 hover:border-red-600 hover:shadow-lg hover:shadow-red-200'
        default:
          return 'hover:from-blue-600 hover:to-blue-700 hover:border-blue-600 hover:shadow-lg hover:shadow-blue-300'
      }
    }
    return 'hover:bg-gray-300 hover:border-gray-400 hover:shadow-md'
  }

  const getFocusColors = () => {
    switch (variant) {
      case 'success':
        return 'focus:ring-emerald-500 focus:border-emerald-500'
      case 'danger':
        return 'focus:ring-red-500 focus:border-red-500'
      default:
        return 'focus:ring-blue-500 focus:border-blue-500'
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={`Toggle widget ${enabled ? 'off' : 'on'}`}
      onClick={onToggle}
      disabled={disabled || loading}
      className={`
        relative inline-flex items-center border-2 rounded-full cursor-pointer
        transition-all duration-200 ease-in-out
        ${sizeClasses[size]}
        ${getVariantColors()}
        ${getHoverColors()}
        ${getFocusColors()}
        focus:outline-none focus:ring-2 focus:ring-offset-2
        transform hover:scale-105 active:scale-110
        ${disabled || loading ? 'opacity-50 cursor-not-allowed hover:scale-100 active:scale-100' : ''}
        ${enabled ? 'shadow-md' : 'shadow-sm'}
      `}
    >
      {/* Toggle Thumb */}
      <span
        className={`
          ${thumbSizeClasses[size]}
          ${thumbTranslateClasses[size]}
          pointer-events-none inline-block rounded-full bg-white shadow-lg
          transition-all duration-200 ease-in-out
          flex items-center justify-center
          ${loading ? 'animate-pulse' : ''}
        `}
      >
        {loading ? (
          <div className={`
            ${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-2.5 h-2.5' : 'w-3 h-3'}
            border border-gray-400 border-t-gray-600 rounded-full animate-spin
          `} />
        ) : (
          <div className={`
            ${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-2.5 h-2.5' : 'w-3 h-3'}
            flex items-center justify-center
          `}>
            {enabled ? (
              <svg 
                className={`${size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-2.5 h-2.5'} text-blue-600`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg 
                className={`${size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-2.5 h-2.5'} text-gray-400`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        )}
      </span>

      {/* Active State Accent Ring */}
      {enabled && !loading && (
        <div className={`
          absolute inset-0 rounded-full ring-2 ring-blue-400 ring-opacity-30
          animate-pulse
        `} />
      )}
    </button>
  )
}