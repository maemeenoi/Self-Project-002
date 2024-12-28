'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { db } from '@/firebaseConfig'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import CombinedProgressChart from '@/components/CombinedProgressChart'
import { getBodyPartLabel, MONTHS, getCurrentMonth } from '@/utils/helpers'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userData, setUserData] = useState(null)
  const [measurements, setMeasurements] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingMonth, setEditingMonth] = useState(getCurrentMonth())
  const [editedValues, setEditedValues] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [summaryData, setSummaryData] = useState({
    overallProgress: 0,
    achievedGoals: 0,
    totalGoals: 0,
    lastUpdate: null
  })

  useEffect(() => {
    console.log('Session status:', status)
    console.log('Session data:', session)
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    const loadUserData = async () => {
      if (!session?.user?.email) return
      
      setLoading(true)
      try {
        // Load user profile
        const userDoc = await getDoc(doc(db, 'users', session.user.email))
        const measurementsDoc = await getDoc(doc(db, 'measurements', session.user.email))

        if (userDoc.exists() && measurementsDoc.exists()) {
          setUserData(userDoc.data())
          setMeasurements(measurementsDoc.data())
        } else {
          // If no data found, redirect to registration
          router.push('/register')
        }
      } catch (error) {
        console.error('Error loading user data:', error)
        if (error.code === 'permission-denied') {
          // Handle authentication issues
          alert('Session expired. Please sign in again.')
          router.push('/auth/signin')
        } else {
          alert('Error loading data. Please try refreshing the page.')
        }
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.email) {
      loadUserData()
    }
  }, [session, router])

  useEffect(() => {
    if (measurements && userData) {
      const summary = calculateSummaryData()
      setSummaryData(summary)
    }
  }, [measurements, userData])

  const calculateSummaryData = () => {
    let totalProgress = 0
    let achievedGoals = 0
    let lastUpdate = null

    userData.selectedParts.forEach(partId => {
      const measurement = measurements[partId]
      const baseline = parseFloat(measurement.baseline) || 0
      const goalPercentage = parseFloat(measurement.goalPercentage) || 0
      const targetValue = baseline * (1 + goalPercentage / 100)
      
      // Get the latest measurement
      const monthlyProgress = measurement.monthlyProgress || {}
      const currentValue = parseFloat(monthlyProgress[getCurrentMonth()] || baseline)
      
      // Calculate progress
      const progress = goalPercentage === 0 ? 100 :
        Math.min(100, Math.max(0, ((currentValue - baseline) / (targetValue - baseline)) * 100))
      
      totalProgress += progress
      if (progress >= 100) achievedGoals++
    })

    return {
      overallProgress: totalProgress / userData.selectedParts.length,
      achievedGoals,
      totalGoals: userData.selectedParts.length,
      lastUpdate: new Date().toLocaleDateString()
    }
  }

  const exportData = () => {
    const exportData = {
      userInfo: {
        name: userData.displayName,
        email: session.user.email,
        exportDate: new Date().toISOString()
      },
      summary: summaryData,
      measurements: userData.selectedParts.map(partId => {
        const measurement = measurements[partId]
        return {
          bodyPart: partId,
          baseline: measurement.baseline,
          goal: `${measurement.goalPercentage}%`,
          targetValue: (parseFloat(measurement.baseline) * (1 + parseFloat(measurement.goalPercentage) / 100)).toFixed(1),
          monthlyProgress: measurement.monthlyProgress || {}
        }
      })
    }

    // Create and download file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fitness-progress-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleMeasurementUpdate = async () => {
    if (!editingMonth || !session?.user?.email) return

    setIsSaving(true)
    try {
      const updatedMeasurements = { ...measurements }
      Object.entries(editedValues).forEach(([partId, value]) => {
        if (!updatedMeasurements[partId].monthlyProgress) {
          updatedMeasurements[partId].monthlyProgress = {}
        }
        updatedMeasurements[partId].monthlyProgress[editingMonth] = value
      })

      await updateDoc(doc(db, 'measurements', session.user.email), updatedMeasurements)
      setMeasurements(updatedMeasurements)
      setEditedValues({})
      alert('Measurements updated successfully!')
    } catch (error) {
      console.error('Error updating measurements:', error)
      if (error.code === 'permission-denied') {
        alert('Unable to save measurements. Please check your login status and try again.')
      } else {
        alert('Failed to update measurements. Please try again.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">Loading your dashboard...</div>
        </div>
      </div>
    )
  }

  if (!userData || !measurements) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-700 mb-4">No data found</div>
          <button
            onClick={() => router.push('/register')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Complete Registration
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {userData.displayName}!</h1>
          <p className="text-gray-600">Track your fitness progress below</p>
        </div>
        <button
          onClick={exportData}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Export Progress
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${summaryData.overallProgress}%` }}
              />
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {summaryData.overallProgress.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900">Goals Achieved</h3>
          <p className="mt-2">
            <span className="text-2xl font-bold text-green-600">
              {summaryData.achievedGoals}
            </span>
            <span className="text-gray-600">
              /{summaryData.totalGoals}
            </span>
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900">Current Month</h3>
          <p className="mt-2 text-2xl font-bold text-gray-700">{getCurrentMonth()}</p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900">Last Update</h3>
          <p className="mt-2 text-2xl font-bold text-gray-700">{summaryData.lastUpdate}</p>
        </div>
      </div>

      <div className="mb-8">
        <CombinedProgressChart 
          measurements={measurements}
          selectedParts={userData.selectedParts}
        />
      </div>

      <div className="mb-8 bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h2 className="text-lg font-semibold text-white mb-1">Update Monthly Measurements</h2>
          <p className="text-xl font-bold text-white opacity-90">Record your progress for the selected month</p>
        </div>
        
        <div className="p-6">
          <div className="flex flex-wrap items-end gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-black mb-2">
                Select Month
              </label>
              <select
                value={editingMonth}
                onChange={(e) => setEditingMonth(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-black"
              >
                {MONTHS.map((month) => (
                  <option key={month} value={month} className="text-black">{month}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleMeasurementUpdate}
              disabled={isSaving || Object.keys(editedValues).length === 0}
              className="flex-shrink-0 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg 
                hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed 
                shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 h-[46px]
                font-medium transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-white">Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">Save Updates</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {userData.selectedParts.map((partId) => {
              const measurement = measurements[partId]
              const baseline = parseFloat(measurement.baseline)
              const goalPercentage = parseFloat(measurement.goalPercentage)
              const targetValue = (baseline * (1 + goalPercentage / 100)).toFixed(1)
              const currentValue = editedValues[partId] ?? measurement?.monthlyProgress?.[editingMonth] ?? ''
              
              return (
                <div key={partId} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors duration-150">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getBodyPartLabel(partId)}
                  </label>
                  <div className="text-xs text-gray-500 mb-2">
                    Baseline: {baseline} inches | Goal: {targetValue} inches
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={currentValue}
                    onChange={(e) => setEditedValues(prev => ({
                      ...prev,
                      [partId]: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter measurement"
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="sticky left-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Body Part
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Baseline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Goal
                </th>
                {MONTHS.map((month) => (
                  <th key={month} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {month}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userData.selectedParts.map((partId) => {
                const measurement = measurements[partId]
                return (
                  <tr key={partId}>
                    <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getBodyPartLabel(partId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {measurement.baseline} inches
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {measurement.goalPercentage}%
                    </td>
                    {MONTHS.map((month) => (
                      <td key={month} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {measurement.monthlyProgress?.[month] || '-'}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 