"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { db } from "@/firebaseConfig"
import { doc, getDoc } from "firebase/firestore"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState(null)
  const [error, setError] = useState(null)

  // Debug logs
  useEffect(() => {
    console.log("Dashboard - Session Status:", status)
    console.log("Dashboard - Session Data:", session)
    console.log("Dashboard - Current User:", session?.user)
  }, [status, session])

  useEffect(() => {
    if (status === "unauthenticated") {
      console.log("User is not authenticated, redirecting to signin...")
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated" && session?.user?.email) {
      const loadUserData = async () => {
        try {
          console.log("Attempting to load user data for:", session.user.email)
          console.log("Firebase Auth Token:", session.user)

          const userDocRef = doc(db, "users", session.user.email)
          console.log("User document reference:", userDocRef)

          const userDoc = await getDoc(userDocRef)
          console.log("Firestore response:", userDoc)
          console.log("User doc exists:", userDoc.exists())

          if (userDoc.exists()) {
            const data = userDoc.data()
            console.log("User data found:", data)
            setUserData(data)
            setLoading(false)
          } else {
            console.log(
              "No user data found, redirecting to registration form..."
            )
            router.push("/register")
          }
        } catch (error) {
          console.error("Error loading user data:", error)
          console.error("Error details:", {
            code: error.code,
            message: error.message,
            stack: error.stack,
          })

          if (error.code === "permission-denied") {
            setError("Permission denied. Please sign out and sign in again.")
          } else {
            setError(`Failed to load user data: ${error.message}`)
          }
          setLoading(false)
        }
      }

      loadUserData()
    }
  }, [status, session, router])

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Loading dashboard... (Status: {status})
          </p>
          {error && (
            <div className="mt-4 text-red-500">
              <p>{error}</p>
              <button
                onClick={() => router.push("/auth/signin")}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Back to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">No user data found</h2>
          <button
            onClick={() => router.push("/register")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Complete Registration
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">
          Welcome, {userData.displayName || session.user.email}!
        </h1>
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">
            Your Selected Body Parts:
          </h2>
          <ul className="list-disc list-inside">
            {userData.selectedParts?.map((part) => (
              <li key={part} className="text-gray-700">
                {part}
              </li>
            ))}
          </ul>
        </div>
        <pre className="bg-gray-100 p-4 rounded mt-4">
          {JSON.stringify({ userData, session }, null, 2)}
        </pre>
      </div>
    </div>
  )
}
