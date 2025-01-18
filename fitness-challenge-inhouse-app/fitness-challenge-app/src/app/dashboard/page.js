"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/firebaseConfig"
import { doc, getDoc } from "firebase/firestore"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    console.log("Dashboard - Session status:", status)
    console.log("Dashboard - Session data:", session)

    const loadUserData = async () => {
      if (status === "authenticated" && session?.user?.id) {
        try {
          const userDoc = await getDoc(doc(db, "users", session.user.id))
          if (userDoc.exists()) {
            console.log("Dashboard - User data found:", userDoc.data())
            setUserData(userDoc.data())
          } else {
            console.log("Dashboard - No user data found")
            router.push("/register")
          }
        } catch (error) {
          console.error("Dashboard - Error loading user data:", error)
          setError("Failed to load user data")
        } finally {
          setLoading(false)
        }
      } else if (status === "unauthenticated") {
        console.log("Dashboard - User not authenticated")
        router.push("/auth/signin")
      }
    }

    loadUserData()
  }, [status, session, router])

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
      <h1 className="text-2xl font-bold mb-4">Welcome to your Dashboard</h1>
      {userData && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
          <div className="space-y-2">
            <p>Name: {userData.name}</p>
            <p>Email: {userData.email}</p>
            <p>Goal: {userData.goal}</p>
          </div>
        </div>
      )}
    </div>
  )
}
