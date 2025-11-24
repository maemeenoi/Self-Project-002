'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { getUserTimezone } from '@/lib/timezoneUtils'

interface TimezoneContextType {
  selectedTimezone: string
  setSelectedTimezone: (timezone: string) => void
  userTimezone: string
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined)

export function TimezoneProvider({ children }: { children: React.ReactNode }) {
  const [selectedTimezone, setSelectedTimezone] = useState<string>('')
  const [userTimezone, setUserTimezone] = useState<string>('')

  useEffect(() => {
    // Get user's current timezone
    const userTz = getUserTimezone()
    setUserTimezone(userTz)
    
    // Set initial selected timezone to user's timezone
    setSelectedTimezone(userTz)
  }, [])

  const value = {
    selectedTimezone,
    setSelectedTimezone,
    userTimezone
  }

  return (
    <TimezoneContext.Provider value={value}>
      {children}
    </TimezoneContext.Provider>
  )
}

export function useTimezone() {
  const context = useContext(TimezoneContext)
  if (context === undefined) {
    throw new Error('useTimezone must be used within a TimezoneProvider')
  }
  return context
}
