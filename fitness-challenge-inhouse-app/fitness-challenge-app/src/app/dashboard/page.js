"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/firebaseConfig"
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore"
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

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [userData, setUserData] = useState(null)
  const [measurements, setMeasurements] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("measurements")
  const [leaderboardData, setLeaderboardData] = useState([])
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadUserData = async () => {
      if (
        status === "authenticated" &&
        session?.user?.email &&
        !isRedirecting
      ) {
        try {
          // Load user profile
          let userDoc = await getDoc(doc(db, "users", session.user.email))
          if (!userDoc.exists() && session.user.id) {
            userDoc = await getDoc(doc(db, "users", session.user.id))
          }

          if (userDoc.exists()) {
            if (isMounted) {
              setUserData(userDoc.data())

              // Load measurements
              const measurementDoc = await getDoc(
                doc(db, "measurements", session.user.email)
              )
              if (measurementDoc.exists()) {
                setMeasurements(measurementDoc.data())
              }

              // Load leaderboard data
              const leaderboardSnapshot = await getDocs(
                collection(db, "measurements")
              )
              const leaderboardEntries = []
              for (const doc of leaderboardSnapshot.docs) {
                const userData = await getDoc(doc(db, "users", doc.id))
                if (userData.exists()) {
                  const measurements = doc.data()
                  const totalProgress = calculateTotalProgress(measurements)
                  leaderboardEntries.push({
                    userId: doc.id,
                    displayName: userData.data().displayName,
                    progress: totalProgress,
                  })
                }
              }
              leaderboardEntries.sort((a, b) => b.progress - a.progress)
              setLeaderboardData(leaderboardEntries)
              setLoading(false)
            }
          } else {
            if (isMounted) {
              setIsRedirecting(true)
              router.push("/register")
            }
          }
        } catch (error) {
          console.error("Dashboard - Error loading data:", error)
          if (isMounted) {
            setError("Failed to load user data")
            setLoading(false)
          }
        }
      } else if (status === "unauthenticated") {
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

  const calculateTotalProgress = (measurements) => {
    if (!measurements) return 0
    let totalProgress = 0
    let count = 0

    Object.keys(measurements).forEach((bodyPart) => {
      if (bodyPart !== "lastUpdated") {
        const progress = calculateProgress(bodyPart, measurements)
        if (progress) {
          totalProgress += progress.progress
          count++
        }
      }
    })

    return count > 0 ? totalProgress / count : 0
  }

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
        },
        lastUpdated: new Date().toISOString(),
      }

      await updateDoc(
        doc(db, "measurements", session.user.email),
        updatedMeasurements
      )
      setMeasurements(updatedMeasurements)

      // Update leaderboard position
      const totalProgress = calculateTotalProgress(updatedMeasurements)
      const userIndex = leaderboardData.findIndex(
        (entry) => entry.userId === session.user.email
      )
      if (userIndex !== -1) {
        const newLeaderboard = [...leaderboardData]
        newLeaderboard[userIndex].progress = totalProgress
        newLeaderboard.sort((a, b) => b.progress - a.progress)
        setLeaderboardData(newLeaderboard)
      }
    } catch (error) {
      console.error("Error updating measurement:", error)
      setError("Failed to update measurement")
    } finally {
      setSaving(false)
    }
  }

  const calculateProgress = (bodyPart, measurementsData = measurements) => {
    if (!measurementsData?.[bodyPart]) return null

    const baseline = parseFloat(measurementsData[bodyPart].baseline) || 0
    const goalPercentage =
      parseFloat(measurementsData[bodyPart].goalPercentage) || 0
    const target = baseline + (baseline * goalPercentage) / 100

    // Get all monthly values and sort them by date
    const monthlyEntries = Object.entries(
      measurementsData[bodyPart].monthlyProgress || {}
    )
      .map(([month, value]) => ({
        month,
        value: parseFloat(value) || 0,
        date: new Date(month.split(" ")[0] + " 1, " + month.split(" ")[1]),
      }))
      .sort((a, b) => b.date - a.date)

    // Get the latest measurement
    const latestMeasurement =
      monthlyEntries.length > 0 ? monthlyEntries[0].value : baseline

    const progressPercentage =
      ((latestMeasurement - baseline) / (target - baseline)) * 100
    return {
      baseline,
      target,
      latest: latestMeasurement,
      progress: Math.min(Math.max(progressPercentage, 0), 100),
    }
  }

  const getChartData = () => {
    if (!measurements || !userData?.selectedParts) return []

    return MONTHS.map((month) => {
      const dataPoint = { month }
      userData.selectedParts.forEach((part) => {
        const measurement = measurements[part]?.monthlyProgress?.[month]
        if (measurement) {
          const baseline = parseFloat(measurements[part].baseline) || 0
          const goalPercentage =
            parseFloat(measurements[part].goalPercentage) || 0
          const target = baseline + (baseline * goalPercentage) / 100
          const value = parseFloat(measurement)
          const progress = ((value - baseline) / (target - baseline)) * 100
          dataPoint[BODY_PARTS[part]] = Math.min(Math.max(progress, 0), 100)
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
      <div className="text-center p-4">
        <p className="text-red-500">{error}</p>
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
      {/* Profile Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow rounded-lg p-6 mb-6 text-white">
        <h1 className="text-2xl font-bold mb-4">
          Welcome, {userData?.displayName}!
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Profile Information</h2>
            <p className="text-gray-200">Email: {userData?.email}</p>
            <p className="text-gray-200">
              Member since: {new Date(userData?.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Selected Body Parts</h2>
            <ul className="list-disc list-inside">
              {userData?.selectedParts?.map((part) => (
                <li key={part} className="text-gray-200">
                  {BODY_PARTS[part]}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Your Ranking</h2>
            <p className="text-2xl font-bold">
              #
              {leaderboardData.findIndex(
                (entry) => entry.userId === session?.user?.email
              ) + 1}
            </p>
            <p className="text-gray-200">
              Overall Progress:{" "}
              {calculateTotalProgress(measurements).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab("measurements")}
              className={`mr-4 py-2 px-4 font-medium ${
                activeTab === "measurements"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Measurements
            </button>
            <button
              onClick={() => setActiveTab("charts")}
              className={`mr-4 py-2 px-4 font-medium ${
                activeTab === "charts"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Progress Charts
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`py-2 px-4 font-medium ${
                activeTab === "leaderboard"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Leaderboard
            </button>
          </nav>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "measurements" && measurements && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-6">Measurement Tracking</h2>
          <div className="space-y-8">
            {userData?.selectedParts?.map((bodyPart) => {
              const progress = calculateProgress(bodyPart)
              if (!progress) return null

              return (
                <div
                  key={bodyPart}
                  className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      {BODY_PARTS[bodyPart]}
                    </h3>
                    <div className="text-sm text-gray-500">
                      Target: {progress.target} inches
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Baseline: {progress.baseline} inches</span>
                      <span>Latest: {progress.latest} inches</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-right text-sm text-gray-600 mt-1">
                      Progress: {progress.progress.toFixed(1)}%
                    </div>
                  </div>

                  {/* Monthly Inputs */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {MONTHS.map((month) => (
                      <div key={month} className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {month}
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              )
            })}
          </div>
        </div>
      )}

      {activeTab === "charts" && measurements && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-6">Progress Charts</h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis
                  domain={[0, 100]}
                  label={{
                    value: "Progress (%)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                <Legend />
                {userData?.selectedParts?.map((part, index) => (
                  <Line
                    key={part}
                    type="monotone"
                    dataKey={BODY_PARTS[part]}
                    stroke={`hsl(${
                      (index * 360) / userData.selectedParts.length
                    }, 70%, 50%)`}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === "leaderboard" && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-6">Leaderboard</h2>
          <div className="space-y-4">
            {leaderboardData.map((entry, index) => (
              <div
                key={entry.userId}
                className={`p-4 rounded-lg ${
                  entry.userId === session?.user?.email
                    ? "bg-gradient-to-r from-purple-100 to-indigo-100 border-2 border-indigo-500"
                    : "bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl font-bold text-indigo-600">
                      #{index + 1}
                    </span>
                    <span className="font-medium">{entry.displayName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">Progress</span>
                    <div className="text-lg font-semibold text-indigo-600">
                      {entry.progress.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {saving && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          Saving changes...
        </div>
      )}
    </div>
  )
}
