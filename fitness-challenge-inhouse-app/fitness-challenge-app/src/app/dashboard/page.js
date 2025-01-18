"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { db } from "@/firebaseConfig"
import { doc, getDoc } from "firebase/firestore"
import { auth } from "@/firebaseConfig"
import { onAuthStateChanged, signInWithCustomToken } from "firebase/auth"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState(null)
  const [error, setError] = useState(null)
  const [firebaseInitialized, setFirebaseInitialized] = useState(false)

  // Monitor Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Firebase Auth State Changed:", user)
      setFirebaseInitialized(true)
    })

    return () => unsubscribe()
  }, [])

  // Debug logs
  useEffect(() => {
    console.log("Dashboard - Session Status:", status)
    console.log("Dashboard - Session Data:", session)
    console.log("Dashboard - Firebase Initialized:", firebaseInitialized)
    console.log("Dashboard - Current Firebase User:", auth.currentUser)
  }, [status, session, firebaseInitialized])

  useEffect(() => {
    if (status === "unauthenticated") {
      console.log("User is not authenticated, redirecting to signin...")
      router.push("/auth/signin")
      return
    }

    if (
      status === "authenticated" &&
      session?.user?.email &&
      firebaseInitialized
    ) {
      const loadUserData = async () => {
        try {
          console.log("Starting user data load process...")
          console.log("Session user:", session.user)
          console.log("Firebase current user:", auth.currentUser)

          // Ensure Firebase is authenticated
          if (!auth.currentUser) {
            console.log(
              "No Firebase user, attempting to sign out and redirect..."
            )
            await signOut({ redirect: false })
            router.push("/auth/signin")
            return
          }

          const userDocRef = doc(db, "users", session.user.email)
          console.log("Attempting to fetch user document:", session.user.email)

          const userDoc = await getDoc(userDocRef)
          console.log("Firestore response received")

          if (userDoc.exists()) {
            const data = userDoc.data()
            console.log("User data found:", data)
            setUserData(data)
            setLoading(false)
          } else {
            console.log("No user data found, redirecting to registration...")
            router.push("/register")
          }
        } catch (error) {
          console.error("Error in loadUserData:", error)
          console.error("Error details:", {
            code: error.code,
            message: error.message,
            stack: error.stack,
          })

          if (error.code === "permission-denied") {
            console.log("Permission denied, signing out...")
            await signOut({ redirect: false })
            router.push("/auth/signin")
          } else {
            setError(`Failed to load user data: ${error.message}`)
            setLoading(false)
          }
        }
      }

      loadUserData()
    }
  }, [status, session, router, firebaseInitialized])

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false })
      router.push("/auth/signin")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (status === "loading" || !firebaseInitialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Loading dashboard... (Status: {status}, Firebase:{" "}
            {firebaseInitialized ? "Ready" : "Initializing"})
          </p>
          {error && (
            <div className="mt-4 text-red-500">
              <p>{error}</p>
              <button
                onClick={handleSignOut}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Sign Out and Try Again
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
          <div className="space-y-4">
            <button
              onClick={() => router.push("/register")}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 block w-full"
            >
              Complete Registration
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 block w-full"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Welcome, {userData.displayName || session.user.email}!
          </h1>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
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
