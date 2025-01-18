"use client"

import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/firebaseConfig"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()

  // Debug logs for session state
  useEffect(() => {
    console.log("Session Status:", status)
    console.log("Session Data:", session)
  }, [status, session])

  useEffect(() => {
    if (status === "authenticated") {
      console.log("User authenticated, redirecting to dashboard...")
      try {
        router.push("/dashboard")
      } catch (error) {
        console.error("Redirect error:", error)
      }
    }
  }, [status, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    console.log("Starting sign in process...")

    try {
      console.log("Signing in with Firebase...")
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      )
      console.log("Firebase sign in successful:", userCredential.user)

      // Get the Firebase ID token
      const idToken = await userCredential.user.getIdToken()
      console.log("Got Firebase ID token")

      console.log("Signing in with NextAuth...")
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      console.log("NextAuth sign in result:", result)

      if (result?.error) {
        console.error("SignIn error:", result.error)
        setError("Invalid email or password")
      } else {
        console.log("Sign in successful, checking user profile...")
        try {
          const userDoc = await getDoc(doc(db, "users", email))
          if (userDoc.exists()) {
            console.log("User profile exists, redirecting to dashboard...")
            router.push("/dashboard")
          } else {
            console.log("No user profile found, redirecting to registration...")
            router.push("/register")
          }
        } catch (error) {
          console.error("Error checking user profile:", error)
          setError("Error checking user profile. Please try again.")
        }
      }
    } catch (error) {
      console.error("Sign in error:", error)
      if (error.code === "auth/invalid-credential") {
        setError("Invalid email or password")
      } else {
        setError(`An error occurred: ${error.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Debug log for render state
  console.log("Current render state:", { status, isLoading, error })

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading... (Status: {status})</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="text-blue-600 hover:text-blue-500"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
