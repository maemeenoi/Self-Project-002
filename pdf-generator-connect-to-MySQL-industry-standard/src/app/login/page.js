// src/app/login/page.js
"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isPasswordLogin, setIsPasswordLogin] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get("redirect") || "/dashboard"
  const errorParam = searchParams.get("error")

  // Set error message from URL parameter if present
  useState(() => {
    if (errorParam) {
      switch (errorParam) {
        case "missing_token":
          setError("Missing authentication token. Please try again.")
          break
        case "invalid_token":
          setError("Invalid or expired token. Please request a new link.")
          break
        case "server_error":
          setError("An error occurred. Please try again later.")
          break
        default:
          setError("Authentication error. Please try again.")
      }
    }
  }, [errorParam])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      if (isPasswordLogin) {
        // Password login
        if (!email || !password) {
          throw new Error("Email and password are required")
        }

        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Login failed")
        }

        // Redirect to dashboard or requested page
        router.push(redirectPath)
      } else {
        // Magic link login
        if (!email) {
          throw new Error("Email is required")
        }

        const response = await fetch("/api/auth/send-magic-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, redirectUrl: redirectPath }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to send magic link")
        }

        // Show success message
        setMagicLinkSent(true)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (magicLinkSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <svg
            className="h-16 w-16 text-green-500 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            ></path>
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">
            Check Your Email
          </h2>
          <p className="mt-2 text-gray-600">
            We've sent a magic link to <strong>{email}</strong>. Click the link
            in the email to access your account.
          </p>
          <p className="mt-6 text-sm text-gray-500">
            Don't see the email? Check your spam folder or{" "}
            <button
              onClick={() => setMagicLinkSent(false)}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              try again
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Sign In</h2>
          <p className="mt-2 text-gray-600">
            Access your Cloud Assessment Dashboard
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="mt-6">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setIsPasswordLogin(false)}
              className={`w-1/2 py-2 text-center ${
                !isPasswordLogin
                  ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                  : "border-b border-gray-200 text-gray-500"
              }`}
            >
              Magic Link
            </button>
            <button
              type="button"
              onClick={() => setIsPasswordLogin(true)}
              className={`w-1/2 py-2 text-center ${
                isPasswordLogin
                  ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                  : "border-b border-gray-200 text-gray-500"
              }`}
            >
              Password
            </button>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>

            {isPasswordLogin && (
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                />
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2 px-4 text-white font-medium rounded-md ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isSubmitting
                  ? "Processing..."
                  : isPasswordLogin
                  ? "Sign In"
                  : "Send Magic Link"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account yet?{" "}
              <Link
                href="/questionnaire"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Take the assessment
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
