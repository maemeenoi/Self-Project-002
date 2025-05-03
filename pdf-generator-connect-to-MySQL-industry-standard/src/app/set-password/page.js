// src/app/set-password/page.js
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validate password
    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to set password")
      }

      // Show success message
      setSuccess(true)

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Create Account Password
          </h2>
          <p className="mt-2 text-gray-600">
            Set a password for easy login on your next visit (optional)
          </p>
        </div>

        {success ? (
          <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-md">
            <p className="font-medium">Password set successfully!</p>
            <p className="mt-1">Redirecting to your dashboard...</p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter a secure password"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Skip for now
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 text-white font-medium rounded-md ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isSubmitting ? "Setting Password..." : "Set Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
