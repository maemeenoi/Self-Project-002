'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useTimezone } from '@/context/TimezoneContext'
import { getTimezones, groupTimezonesByRegion, formatTime, TimezoneOption } from '@/lib/timezoneUtils'

interface TimezoneSelectorProps {
  className?: string
  showPreview?: boolean
}

export default function TimezoneSelector({ className = '', showPreview = true }: TimezoneSelectorProps) {
  const { selectedTimezone, setSelectedTimezone, userTimezone } = useTimezone()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [timezones, setTimezones] = useState<TimezoneOption[]>([])
  const [currentTime, setCurrentTime] = useState('')

  // Load timezones on mount
  useEffect(() => {
    const tzData = getTimezones()
    setTimezones(tzData)
  }, [])

  // Update current time every second
  useEffect(() => {
    if (selectedTimezone) {
      const updateTime = () => {
        setCurrentTime(formatTime(selectedTimezone))
      }
      
      updateTime()
      const interval = setInterval(updateTime, 1000)
      return () => clearInterval(interval)
    }
  }, [selectedTimezone])

  // Filter timezones based on search term
  const filteredTimezones = useMemo(() => {
    if (!searchTerm) return groupTimezonesByRegion(timezones)
    
    const filtered = timezones.filter(tz => 
      tz.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tz.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tz.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tz.value.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    return groupTimezonesByRegion(filtered)
  }, [timezones, searchTerm])

  // Get current timezone display info
  const currentTimezoneInfo = useMemo(() => {
    return timezones.find(tz => tz.value === selectedTimezone)
  }, [timezones, selectedTimezone])

  const handleTimezoneSelect = (timezone: string) => {
    setSelectedTimezone(timezone)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleToggle = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setSearchTerm('')
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Timezone Display Button */}
      <button
        onClick={handleToggle}
        className="flex items-center space-x-2 px-3 py-2 bg-base-100 border border-base-300 rounded-lg hover:bg-base-200 transition-colors min-w-[200px]"
      >
        <svg 
          className="w-4 h-4 text-base-content" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        <div className="flex-1 text-left">
          <div className="text-sm font-medium">
            {currentTimezoneInfo?.city || 'Select Timezone'}
          </div>
          {showPreview && currentTime && (
            <div className="text-xs text-base-content/70">
              {currentTime}
            </div>
          )}
        </div>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 9l-7 7-7-7" 
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-base-300">
            <input
              type="text"
              placeholder="Search timezones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-base-200 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>

          {/* Timezone Groups */}
          <div className="max-h-80 overflow-y-auto">
            {filteredTimezones.map((group) => (
              <div key={group.region} className="border-b border-base-300 last:border-b-0">
                {/* Region Header */}
                <div className="px-3 py-2 bg-base-200 text-sm font-semibold text-base-content/80 sticky top-0">
                  {group.region}
                </div>
                
                {/* Timezone Options */}
                <div className="py-1">
                  {group.timezones.map((tz) => (
                    <button
                      key={tz.value}
                      onClick={() => handleTimezoneSelect(tz.value)}
                      className={`w-full px-3 py-2 text-left hover:bg-base-200 transition-colors ${
                        selectedTimezone === tz.value ? 'bg-primary/10 text-primary' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium">{tz.city}</div>
                          <div className="text-xs text-base-content/70">
                            {tz.label}
                          </div>
                        </div>
                        <div className="text-xs text-base-content/60 ml-2">
                          {tz.currentTime}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            
            {filteredTimezones.length === 0 && (
              <div className="px-3 py-4 text-center text-base-content/60">
                No timezones found matching "{searchTerm}"
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="p-3 border-t border-base-300 bg-base-200">
            <div className="flex space-x-2">
              <button
                onClick={() => handleTimezoneSelect(userTimezone)}
                className="flex-1 px-3 py-1 text-xs bg-primary text-primary-content rounded hover:bg-primary/80 transition-colors"
              >
                Use My Timezone
              </button>
              <button
                onClick={() => handleTimezoneSelect('UTC')}
                className="flex-1 px-3 py-1 text-xs bg-base-300 text-base-content rounded hover:bg-base-400 transition-colors"
              >
                UTC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
