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
  const [error, setError] = useState(null)

  // Debug logs
  useEffect(() => {
    console.log("Dashboard - Session Status:", status)
    console.log("Dashboard - Session Data:", session)
  }, [status, session])

  useEffect(() => {
    const checkAuth = async () => {
      console.log("Dashboard - Checking authentication...")

      if (status === "unauthenticated") {
        console.log(
          "Dashboard - User not authenticated, redirecting to signin..."
        )
        router.push("/auth/signin")
        return
      }

      if (status === "authenticated" && session?.user?.email) {
        console.log("Dashboard - Loading user data...")
        setLoading(true)
        try {
          const userDoc = await getDoc(doc(db, "users", session.user.email))
          console.log("Dashboard - User doc exists:", userDoc.exists())

          if (!userDoc.exists()) {
            console.log(
              "Dashboard - No user data, redirecting to registration..."
            )
            router.push("/register")
            return
          }

          console.log("Dashboard - User data loaded successfully")
        } catch (error) {
          console.error("Dashboard - Error loading user data:", error)
          setError(error.message)
        } finally {
          setLoading(false)
        }
      }
    }

    checkAuth()
  }, [status, session, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Loading dashboard... (Status: {status})
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p>Error loading dashboard: {error}</p>
          <button
            onClick={() => router.push("/auth/signin")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Return to Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        Welcome, {session?.user?.email}!
      </h1>
      <p className="text-gray-600">Your dashboard is ready.</p>
    </div>
  )
}
