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

// Add achievement titles
const ACHIEVEMENT_TITLES = {
  100: {
    title: "Ultimate Goal Crusher 👑",
    color: "from-purple-500 to-pink-500",
  },
  90: { title: "Elite Achiever 🌟", color: "from-yellow-400 to-orange-500" },
  75: { title: "Progress Champion ⭐", color: "from-blue-500 to-indigo-500" },
  50: { title: "Determined Warrior 💪", color: "from-green-500 to-teal-500" },
  25: { title: "Rising Challenger 🌱", color: "from-cyan-500 to-blue-500" },
  0: { title: "Journey Beginner 🎯", color: "from-gray-400 to-gray-500" },
}

const getAchievementTitle = (progress) => {
  const thresholds = Object.keys(ACHIEVEMENT_TITLES).sort((a, b) => b - a)
  for (const threshold of thresholds) {
    if (progress >= threshold) {
      return ACHIEVEMENT_TITLES[threshold]
    }
  }
  return ACHIEVEMENT_TITLES[0]
}

// Helper functions
const calculateProgress = (measurements, bodyPart) => {
  if (!measurements?.[bodyPart]) return null

  const baseline = parseFloat(measurements[bodyPart].baseline) || 0
  const goalPercentage = parseFloat(measurements[bodyPart].goalPercentage) || 0
  const target = baseline + (baseline * goalPercentage) / 100

  // Initialize progress with baseline if no monthly values exist
  if (
    !measurements[bodyPart].monthlyProgress ||
    Object.keys(measurements[bodyPart].monthlyProgress).length === 0
  ) {
    return {
      baseline,
      target,
      latest: baseline,
      progress: 0,
    }
  }

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
    .sort((a, b) => b.date - a.date)

  // If no valid monthly values, return baseline
  if (monthlyValues.length === 0) {
    return {
      baseline,
      target,
      latest: baseline,
      progress: 0,
    }
  }

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
              selectedParts: userData.selectedParts || Object.keys(BODY_PARTS),
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
              // Create initial measurements structure for new users
              const initialMeasurements = {}
              updatedUserData.selectedParts.forEach((part) => {
                initialMeasurements[part] = {
                  baseline: "0",
                  goalPercentage: "0",
                  monthlyProgress: MONTHS.reduce((acc, month) => {
                    acc[month] = ""
                    return acc
                  }, {}),
                }
              })

              measurementData = initialMeasurements
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-3 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
            <div className="text-center md:text-left w-full md:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                Welcome, {userData?.displayName}!
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Member since:{" "}
                {new Date(userData?.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-center md:text-right w-full md:w-auto">
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
                {calculateTotalProgress(measurements).toFixed(1)}%
              </div>
              <div className="text-xs sm:text-sm text-gray-500">
                Overall Progress
              </div>
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
            Overall Progress
          </h2>
          <div className="relative pt-1">
            <div className="overflow-hidden h-2 sm:h-3 mb-3 sm:mb-4 text-xs flex rounded-full bg-gray-200">
              <div
                style={{ width: `${calculateTotalProgress(measurements)}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 animate-progress"
              ></div>
            </div>
          </div>
        </div>

        {/* Body Parts Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {(Array.isArray(userData?.selectedParts)
            ? userData.selectedParts
            : Object.keys(BODY_PARTS)
          ).map((bodyPart) => {
            const progress = calculateProgress(measurements, bodyPart)
            if (!progress) return null
            const achievement = getAchievementTitle(progress.progress)

            return (
              <div
                key={bodyPart}
                className="bg-white rounded-lg shadow-lg p-4 sm:p-6 transform hover:scale-[1.01] transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-2 sm:gap-4 mb-4">
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
                      {BODY_PARTS[bodyPart]}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {achievement.title}
                    </p>
                  </div>
                  <div className="text-center sm:text-right">
                    <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
                      {progress.progress.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Progress Stats */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
                  <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                    <div className="text-[10px] sm:text-xs text-gray-500 uppercase">
                      Baseline
                    </div>
                    <div className="text-sm sm:text-lg font-semibold">
                      {progress.baseline}"
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                    <div className="text-[10px] sm:text-xs text-gray-500 uppercase">
                      Current
                    </div>
                    <div className="text-sm sm:text-lg font-semibold">
                      {progress.latest}"
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                    <div className="text-[10px] sm:text-xs text-gray-500 uppercase">
                      Target
                    </div>
                    <div className="text-sm sm:text-lg font-semibold">
                      {progress.target.toFixed(1)}"
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-1000 bg-gradient-to-r ${achievement.color}`}
                      style={{ width: `${progress.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Monthly Measurements */}
                <div className="mt-4">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-3">
                    Monthly Measurements
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                    {MONTHS.map((month) => (
                      <div key={month} className="relative">
                        <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">
                          {month}
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          className="block w-full px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          value={
                            measurements[bodyPart]?.monthlyProgress?.[month] ||
                            ""
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

        {saving && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-3 py-2 text-sm sm:px-4 sm:py-2 rounded-lg shadow-lg animate-pulse">
            Saving changes...
          </div>
        )}

        <style jsx global>{`
          @keyframes progressAnimation {
            from {
              width: 0;
            }
            to {
              width: 100%;
            }
          }

          .animate-progress {
            animation: progressAnimation 1.5s ease-out;
          }

          .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </div>
  )
}
