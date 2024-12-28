'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { db, auth } from '@/firebaseConfig'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

const BODY_PARTS = [
  { id: 'leftArm', label: 'Left Arm' },
  { id: 'rightArm', label: 'Right Arm' },
  { id: 'chest', label: 'Chest' },
  { id: 'waistLine', label: 'WaistLine' },
  { id: 'hips', label: 'Hips' },
  { id: 'glutes', label: 'Glutes' },
  { id: 'leftThigh', label: 'Left Thigh' },
  { id: 'rightThigh', label: 'Right Thigh' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'leftForearm', label: 'Left Forearm' },
  { id: 'rightForearm', label: 'Right Forearm' }
]

const GOAL_OPTIONS = [
  { value: '10', label: '+10% (Increase)' },
  { value: '5', label: '+5% (Increase)' },
  { value: '0', label: '0% (No Change)' },
  { value: '-5', label: '-5% (Decrease)' },
  { value: '-10', label: '-10% (Decrease)' }
]

const MONTHS = [
    'October 2024',
    'November 2024',
    'December 2024',
    'January 2025',
    'February 2025',
    'March 2025',
    'April 2025'
]

export default function Register() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    displayName: '',
    selectedParts: [],
    measurements: {}
  })
  const [loading, setLoading] = useState(false)
  const [firebaseUser, setFirebaseUser] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Firebase Auth State Changed:", user)
      setFirebaseUser(user)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user?.profile) {
      router.push('/dashboard')
    }
  }, [session, status, router])

  const handleBodyPartSelection = (partId) => {
    setFormData(prev => {
      const currentSelected = prev.selectedParts || []
      let newSelected

      if (currentSelected.includes(partId)) {
        // Remove if already selected
        newSelected = currentSelected.filter(id => id !== partId)
      } else if (currentSelected.length < 4) {
        // Add if less than 4 parts are selected
        newSelected = [...currentSelected, partId]
      } else {
        // Already have 4 parts selected
        return prev
      }

      // Update measurements based on selected parts
      const newMeasurements = {}
      newSelected.forEach(id => {
        newMeasurements[id] = {
          baseline: prev.measurements[id]?.baseline || '',
          goalPercentage: prev.measurements[id]?.goalPercentage || '0',
          monthlyProgress: MONTHS.reduce((acc, month) => {
            acc[month] = ''
            return acc
          }, {})
        }
      })

      return {
        ...prev,
        selectedParts: newSelected,
        measurements: newMeasurements
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Create user document
      await setDoc(doc(db, 'users', session.user.email), {
        displayName: formData.displayName,
        selectedParts: selectedParts,
        createdAt: serverTimestamp(),
      })

      // Create measurements document
      const measurementsData = {}
      selectedParts.forEach(partId => {
        measurementsData[partId] = {
          baseline: formData[`${partId}Baseline`],
          goalPercentage: formData[`${partId}Goal`],
          monthlyProgress: {}
        }
      })

      await setDoc(doc(db, 'measurements', session.user.email), measurementsData)
      
      router.push('/dashboard')
    } catch (error) {
      console.error('Registration error:', error)
      let errorMessage = 'Failed to complete registration. '
      
      if (error.code === 'permission-denied') {
        errorMessage += 'Please ensure you are properly signed in and try again.'
      } else if (error.code === 'not-found') {
        errorMessage += 'Unable to create user profile. Please try signing out and back in.'
      } else {
        errorMessage += error.message
      }
      
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMeasurementChange = (bodyPart, field, value) => {
    setFormData(prev => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [bodyPart]: {
          ...prev.measurements[bodyPart],
          [field]: value
        }
      }
    }))
  }

  const calculateGoal = (baseline, percentage) => {
    const baselineNum = parseFloat(baseline) || 0
    const percentageNum = parseFloat(percentage) || 0
    const change = baselineNum * (percentageNum / 100)
    return (baselineNum + change).toFixed(1)
  }

  if (status === 'loading') {
    return <div className="text-center mt-8">Loading...</div>
  }

  if (!session) {
    return <div className="text-center mt-8">Please sign in to continue</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Complete Your Profile</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your display name"
          />
        </div>

        {/* Body Part Selection */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Select 4 Body Parts to Track</h2>
          <p className="text-sm text-gray-500 mb-4">Choose exactly 4 body parts you want to track during the challenge.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {BODY_PARTS.map((part) => (
              <button
                key={part.id}
                type="button"
                onClick={() => handleBodyPartSelection(part.id)}
                className={`p-3 rounded-lg text-center transition-colors ${
                  formData.selectedParts?.includes(part.id)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${
                  formData.selectedParts?.length >= 4 && !formData.selectedParts?.includes(part.id)
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {part.label}
              </button>
            ))}
          </div>
        </div>

        {/* Updated Measurements and Goals section */}
        {formData.selectedParts?.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Body Measurements and Goals</h2>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Body Part
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Baseline (inches)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Goal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target (inches)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.selectedParts.map((partId) => {
                    const part = BODY_PARTS.find(p => p.id === partId)
                    const baseline = formData.measurements[partId]?.baseline || ''
                    const goalPercentage = formData.measurements[partId]?.goalPercentage || '0'
                    const calculatedGoal = calculateGoal(baseline, goalPercentage)

                    return (
                      <tr key={partId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {part.label}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            step="0.1"
                            value={baseline}
                            onChange={(e) => handleMeasurementChange(partId, 'baseline', e.target.value)}
                            required
                            className="w-24 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.0"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={goalPercentage}
                            onChange={(e) => handleMeasurementChange(partId, 'goalPercentage', e.target.value)}
                            required
                            className="w-40 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            {GOAL_OPTIONS.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {calculatedGoal} inches
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || formData.selectedParts?.length !== 4}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Completing Registration...' : 'Complete Registration'}
        </button>
        {formData.selectedParts?.length !== 4 && (
          <p className="text-sm text-red-500 text-center">
            Please select exactly 4 body parts to continue
          </p>
        )}
      </form>
    </div>
  )
} 