"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/firebaseConfig"
import { doc, getDoc, updateDoc } from "firebase/firestore"
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
  const [activeTab, setActiveTab] = useState("measurements") // or "charts"
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
            console.log("Dashboard - User data found:", userDoc.data())
            if (isMounted) {
              setUserData(userDoc.data())

              // Load measurements
              const measurementDoc = await getDoc(
                doc(db, "measurements", session.user.email)
              )
              if (measurementDoc.exists()) {
                setMeasurements(measurementDoc.data())
              }
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
    } catch (error) {
      console.error("Error updating measurement:", error)
      setError("Failed to update measurement")
    } finally {
      setSaving(false)
    }
  }

  const calculateProgress = (bodyPart) => {
    if (!measurements?.[bodyPart]) return null

    const baseline = parseFloat(measurements[bodyPart].baseline) || 0
    const goalPercentage =
      parseFloat(measurements[bodyPart].goalPercentage) || 0
    const target = baseline + (baseline * goalPercentage) / 100

    const monthlyValues = Object.values(
      measurements[bodyPart].monthlyProgress || {}
    )
    const latestMeasurement = monthlyValues.reduce((latest, current) => {
      return current ? parseFloat(current) : latest
    }, baseline)

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
          dataPoint[BODY_PARTS[part]] = parseFloat(measurement)
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
              {userData?.selectedParts?.map((part) => (
                <li key={part} className="text-gray-600">
                  {BODY_PARTS[part]}
                </li>
              ))}
            </ul>
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
              className={`py-2 px-4 font-medium ${
                activeTab === "charts"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Progress Charts
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
                <div key={bodyPart} className="border rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      {BODY_PARTS[bodyPart]}
                    </h3>
                    <div className="text-sm text-gray-500">
                      Goal: {progress.target} inches
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Baseline: {progress.baseline} inches</span>
                      <span>Current: {progress.latest} inches</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-indigo-600 rounded-full transition-all duration-500"
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
                <YAxis />
                <Tooltip />
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

      {saving && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow">
          Saving changes...
        </div>
      )}
    </div>
  )
}
