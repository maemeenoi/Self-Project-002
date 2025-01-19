"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/firebaseConfig"
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  setDoc,
} from "firebase/firestore"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

// Constants
const MONTHS = [
  "October 2024",
  "November 2024",
  "December 2024",
  "January 2025",
  "February 2025",
  "March 2025",
  "April 2025",
]

const BODY_PARTS = {
  leftArm: "Left Arm",
  rightArm: "Right Arm",
  chest: "Chest",
  waistLine: "Waist Line",
  hips: "Hips",
  glutes: "Glutes",
  leftThigh: "Left Thigh",
  rightThigh: "Right Thigh",
  shoulders: "Shoulders",
  leftForearm: "Left Forearm",
  rightForearm: "Right Forearm",
}

// Helper functions
const calculateProgress = (measurements, bodyPart) => {
  if (!measurements?.[bodyPart]) return null

  const baseline = parseFloat(measurements[bodyPart].baseline) || 0
  const goalPercentage = parseFloat(measurements[bodyPart].goalPercentage) || 0
  const target = baseline + (baseline * goalPercentage) / 100

  // Get all monthly values and sort them by date
  const monthlyValues = Object.entries(
    measurements[bodyPart].monthlyProgress || {}
  )
    .map(([month, value]) => ({
      month,
      value: parseFloat(value) || 0,
      date: new Date(month.split(" ")[0] + " 1, " + month.split(" ")[1]),
    }))
    .filter((entry) => entry.value > 0)
    .sort((a, b) => b.date - a.date) // Sort by date in descending order

  if (monthlyValues.length === 0) return null

  const latest = monthlyValues[0].value
  const progressPercentage = ((latest - baseline) / (target - baseline)) * 100
  return {
    baseline,
    target,
    latest,
    progress: Math.min(Math.max(progressPercentage, 0), 100),
  }
}

function calculateTotalProgress(measurements) {
  if (!measurements) return 0

  let totalProgress = 0
  let validParts = 0

  Object.keys(BODY_PARTS).forEach((part) => {
    const progress = calculateProgress(measurements, part)
    if (progress) {
      totalProgress += progress.progress
      validParts++
    }
  })

  return validParts > 0 ? totalProgress / validParts : 0
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [userData, setUserData] = useState(null)
  const [measurements, setMeasurements] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("measurements")
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadUserData = async () => {
      if (status === "authenticated" && session?.user && !isRedirecting) {
        try {
          console.log("Loading user data for:", session.user)
          const userEmail = session.user.email

          // Get user document
          const userDoc = await getDoc(doc(db, "users", userEmail))

          if (userDoc.exists()) {
            const userData = userDoc.data()
            console.log("User data loaded:", userData)

            // Initialize user data with default values if needed
            const updatedUserData = {
              ...userData,
              email: session.user.email,
              name: session.user.name || userData.name || "User",
              selectedParts: userData.selectedParts || Object.keys(BODY_PARTS), // Use keys of BODY_PARTS
              createdAt: userData.createdAt || new Date().toISOString(),
            }

            setUserData(updatedUserData)

            // Initialize measurements structure if it doesn't exist
            const measurementDoc = await getDoc(
              doc(db, "measurements", userEmail)
            )
            let measurementData = {}

            if (measurementDoc.exists()) {
              measurementData = measurementDoc.data()
            } else {
              // Create initial measurements structure
              measurementData = BODY_PARTS.reduce((acc, part) => {
                acc[part] = {}
                return acc
              }, {})

              // Create measurements document
              await setDoc(doc(db, "measurements", userEmail), measurementData)
            }

            console.log("Measurements loaded:", measurementData)
            setMeasurements(measurementData)
            setLoading(false)
          } else {
            console.log("No user profile found, redirecting to registration")
            if (isMounted) {
              setIsRedirecting(true)
              router.push("/register")
            }
          }
        } catch (error) {
          console.error("Dashboard - Error loading data:", error)
          if (isMounted) {
            setError(
              "Failed to load user data. Please try refreshing the page."
            )
            setLoading(false)
          }
        }
      } else if (status === "unauthenticated") {
        console.log("User is not authenticated, redirecting to sign in")
        if (isMounted) {
          router.push("/auth/signin")
        }
      }
    }

    loadUserData()
    return () => {
      isMounted = false
    }
  }, [status, session, router, isRedirecting])

  const handleMeasurementUpdate = async (bodyPart, month, value) => {
    if (!measurements || !session?.user?.email) return

    setSaving(true)
    try {
      const updatedMeasurements = {
        ...measurements,
        [bodyPart]: {
          ...measurements[bodyPart],
          monthlyProgress: {
            ...(measurements[bodyPart]?.monthlyProgress || {}),
            [month]: value,
          },
          baseline: measurements[bodyPart]?.baseline || "0",
          goalPercentage: measurements[bodyPart]?.goalPercentage || "10",
        },
      }

      const userEmail = session.user.email
      await updateDoc(doc(db, "measurements", userEmail), updatedMeasurements)
      setMeasurements(updatedMeasurements)
      console.log(
        "Measurements updated successfully:",
        updatedMeasurements[bodyPart]
      )
    } catch (error) {
      console.error("Error updating measurement:", error)
      setError("Failed to update measurement. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const getChartData = () => {
    if (!measurements) return []

    return MONTHS.map((month) => {
      const dataPoint = { month }
      Object.keys(BODY_PARTS).forEach((part) => {
        if (measurements[part]) {
          const baseline = parseFloat(measurements[part].baseline) || 0
          const goalPercentage =
            parseFloat(measurements[part].goalPercentage) || 10
          const target = baseline + (baseline * goalPercentage) / 100
          const value =
            parseFloat(measurements[part].monthlyProgress?.[month]) || 0

          if (baseline && value) {
            const progress = ((value - baseline) / (target - baseline)) * 100
            dataPoint[BODY_PARTS[part]] = Math.min(Math.max(progress, 0), 100)
          }
        }
      })
      return dataPoint
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="text-center p-4">
        <p>Please sign in to access the dashboard</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">
          Welcome, {userData?.displayName}!
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Profile Information</h2>
            <p className="text-gray-600">Email: {userData?.email}</p>
            <p className="text-gray-600">
              Member since: {new Date(userData?.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Selected Body Parts</h2>
            <ul className="list-disc list-inside">
              {Array.isArray(userData?.selectedParts)
                ? userData.selectedParts.map((part) => (
                    <li key={part} className="text-gray-600">
                      {BODY_PARTS[part]}
                    </li>
                  ))
                : Object.keys(BODY_PARTS).map((part) => (
                    <li key={part} className="text-gray-600">
                      {BODY_PARTS[part]}
                    </li>
                  ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Overall Progress</h2>
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                Progress
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-indigo-600">
                {calculateTotalProgress(measurements).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-indigo-200">
            <div
              style={{ width: `${calculateTotalProgress(measurements)}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            ></div>
          </div>
        </div>
      </div>

      {measurements && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-6">Progress Tracking</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(Array.isArray(userData?.selectedParts)
              ? userData.selectedParts
              : Object.keys(BODY_PARTS)
            ).map((bodyPart) => {
              const progress = calculateProgress(measurements, bodyPart)
              if (!progress) return null
              return (
                <div
                  key={bodyPart}
                  className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-indigo-600">
                      {BODY_PARTS[bodyPart]}
                    </h3>
                    <span className="text-sm font-medium text-gray-500">
                      {progress.progress.toFixed(1)}% Complete
                    </span>
                  </div>

                  {/* Progress Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-xs text-gray-500 uppercase">
                        Baseline
                      </div>
                      <div className="text-lg font-semibold">
                        {progress.baseline}"
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-xs text-gray-500 uppercase">
                        Current
                      </div>
                      <div className="text-lg font-semibold">
                        {progress.latest}"
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-xs text-gray-500 uppercase">
                        Target
                      </div>
                      <div className="text-lg font-semibold">
                        {progress.target.toFixed(1)}"
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Monthly Measurements */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Monthly Measurements
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {MONTHS.map((month) => (
                        <div key={month} className="relative">
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            {month}
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            className="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                            value={
                              measurements[bodyPart]?.monthlyProgress?.[
                                month
                              ] || ""
                            }
                            onChange={(e) =>
                              handleMeasurementUpdate(
                                bodyPart,
                                month,
                                e.target.value
                              )
                            }
                            placeholder="inches"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      {saving && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
          Saving changes...
        </div>
      )}
    </div>
  )
}
