"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { db } from "@/firebaseConfig"
import { doc, getDoc, setDoc } from "firebase/firestore"

export default function Register() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    goal: "",
  })
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    let isMounted = true

    const checkUserProfile = async () => {
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
            console.log(
              "Registration - User already has a profile, redirecting to dashboard"
            )
            if (isMounted) {
              setIsRedirecting(true)
              router.push("/dashboard")
            }
          } else {
            if (isMounted) {
              setLoading(false)
            }
          }
        } catch (error) {
          console.error("Registration - Error checking user profile:", error)
          if (isMounted) {
            setLoading(false)
          }
        }
      } else if (status === "unauthenticated") {
        if (isMounted) {
          router.push("/auth/signin")
        }
      }
    }

    checkUserProfile()
    return () => {
      isMounted = false
    }
  }, [status, session, router, isRedirecting])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const userData = {
        name: formData.name,
        email: session.user.email,
        goal: formData.goal,
        createdAt: new Date().toISOString(),
      }

      // Save to both locations to ensure we can find the user
      if (session.user.email) {
        await setDoc(doc(db, "users", session.user.email), userData)
      }
      if (session.user.id) {
        await setDoc(doc(db, "users", session.user.id), userData)
      }

      router.push("/dashboard")
    } catch (error) {
      console.error("Registration error:", error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading registration...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete Your Profile
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <label htmlFor="goal" className="sr-only">
                Fitness Goal
              </label>
              <input
                id="goal"
                name="goal"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Your Fitness Goal"
                value={formData.goal}
                onChange={(e) =>
                  setFormData({ ...formData, goal: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? "Saving..." : "Complete Registration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
