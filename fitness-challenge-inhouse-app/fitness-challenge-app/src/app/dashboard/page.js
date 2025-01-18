"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { auth, db } from "@/firebaseConfig"
import { doc, getDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { signOut } from "next-auth/react"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log("Dashboard - Session status:", status)
    console.log("Dashboard - Session data:", session)

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Dashboard - Firebase user:", firebaseUser)

      if (status === "authenticated" && firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          if (userDoc.exists()) {
            console.log("Dashboard - User data found:", userDoc.data())
            setUserData(userDoc.data())
          } else {
            console.log("Dashboard - No user data found")
            setError("User profile not found")
            await signOut()
          }
        } catch (err) {
          console.error("Dashboard - Error fetching user data:", err)
          setError(err.message)
        } finally {
          setLoading(false)
        }
      } else if (status === "unauthenticated") {
        console.log("Dashboard - User not authenticated")
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [status, session])

  if (loading) {
    return <div className="text-center p-4">Loading dashboard...</div>
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>
  }

  if (!session) {
    return (
      <div className="text-center p-4">
        Please sign in to access the dashboard
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to your Dashboard</h1>
      {userData && (
        <div>
          <p>Name: {userData.name}</p>
          <p>Email: {userData.email}</p>
          <p>Goal: {userData.goal}</p>
        </div>
      )}
    </div>
  )
}
