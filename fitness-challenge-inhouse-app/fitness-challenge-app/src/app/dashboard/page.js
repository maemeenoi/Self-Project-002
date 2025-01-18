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
          // First try with email
          let userDoc = await getDoc(doc(db, "users", session.user.email))

          // If not found, try with ID
          if (!userDoc.exists() && session.user.id) {
            userDoc = await getDoc(doc(db, "users", session.user.id))
          }

          if (userDoc.exists()) {
            console.log("Dashboard - User data found:", userDoc.data())
            if (isMounted) {
              setUserData(userDoc.data())
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
          console.error("Dashboard - Error loading user data:", error)
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
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">Name</p>
              <p className="font-medium">{userData.displayName}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-medium">{userData.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Selected Body Parts</p>
              <ul className="list-disc list-inside">
                {userData.selectedParts?.map((part) => (
                  <li key={part} className="font-medium">
                    {part.charAt(0).toUpperCase() + part.slice(1)}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-gray-600">Account Created</p>
              <p className="font-medium">
                {new Date(userData.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Last Updated</p>
              <p className="font-medium">
                {new Date(userData.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
