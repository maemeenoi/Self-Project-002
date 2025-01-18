"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/firebaseConfig"
import { doc, getDoc, updateDoc } from "firebase/firestore"

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
            console.log("Dashboard - No user data found")
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

      {measurements && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Progress Tracking</h2>
          <div className="space-y-6">
            {userData?.selectedParts?.map((bodyPart) => {
              const progress = calculateProgress(bodyPart)
              if (!progress) return null

              return (
                <div key={bodyPart} className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">
                    {BODY_PARTS[bodyPart]}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        Baseline: {progress.baseline} inches
                      </p>
                      <p className="text-sm text-gray-600">
                        Target: {progress.target} inches
                      </p>
                      <p className="text-sm text-gray-600">
                        Latest: {progress.latest} inches
                      </p>
                      <div className="mt-2 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${progress.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Progress: {progress.progress.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Monthly Measurements
                      </h4>
                      <div className="space-y-2">
                        {MONTHS.map((month) => (
                          <div
                            key={month}
                            className="flex items-center space-x-2"
                          >
                            <label className="text-sm text-gray-600 w-32">
                              {month}
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              className="border rounded px-2 py-1 text-sm w-24"
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
                </div>
              )
            })}
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
