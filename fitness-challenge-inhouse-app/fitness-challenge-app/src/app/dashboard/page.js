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

  // Debug logs
  useEffect(() => {
    console.log("Dashboard - Session Status:", status)
    console.log("Dashboard - Session Data:", session)
  }, [status, session])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated" && session?.user?.email) {
      const loadUserData = async () => {
        try {
          console.log("Attempting to load user data for:", session.user.email)
          const userDoc = await getDoc(doc(db, "users", session.user.email))
          console.log("User doc exists:", userDoc.exists())

          if (userDoc.exists()) {
            setUserData(userDoc.data())
          } else {
            console.log("No user data found, redirecting to registration")
            router.push("/register")
          }
        } catch (error) {
          console.error("Error loading user data:", error)
        } finally {
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
        <pre className="bg-gray-100 p-4 rounded mt-4">
          {JSON.stringify({ userData, session }, null, 2)}
        </pre>
      </div>
    </div>
  )
}
