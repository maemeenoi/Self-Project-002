// components/questionnaire/EmailStep.jsx
"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function EmailStep({ onSubmit, isSubmitting, answers }) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false)
  const router = useRouter()

  // Debug function to log answers when component mounts
  useEffect(() => {
    console.log("EmailStep received answers:", answers)
  }, [answers])

  const handleMagicLinkSubmit = (e) => {
    e.preventDefault()

    // Simple email validation
    if (!email || !email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address")
      return
    }

    onSubmit(email)
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleSigningIn(true)
      setError("")

      // Log what we're doing
      console.log("Google Sign-In initiated")

      // Check if answers exist and are valid
      if (!answers || !Array.isArray(answers) || answers.length === 0) {
        console.error("No valid answers to save:", answers)
        setError(
          "There was a problem with your assessment data. Please try using the email option instead."
        )
        setIsGoogleSigningIn(false)
        return
      }

      // Simplified: Just store the answers in sessionStorage
      try {
        // Store as string
        sessionStorage.setItem(
          "pendingAssessmentAnswers",
          JSON.stringify(answers)
        )
        console.log("Assessment data saved to sessionStorage")
      } catch (storageError) {
        console.error("Error storing answers:", storageError)
        setError(
          "Could not save your assessment data. Please try the email option instead."
        )
        setIsGoogleSigningIn(false)
        return
      }

      // Initiate Google sign-in
      console.log("Redirecting to Google authentication...")
      signIn("google", {
        callbackUrl: `/dashboard?source=assessment&timestamp=${Date.now()}`,
      })
    } catch (error) {
      console.error("Google sign-in error:", error)
      setError(
        "Failed to sign in with Google. Please try again or use email option."
      )
      setIsGoogleSigningIn(false)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Almost Done! Get Your Assessment Results
      </h2>
      <p className="text-gray-600 mb-6">
        Enter your email to receive your full assessment report or sign in with
        Google to access your personalized dashboard immediately.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Google Sign-In Button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleSigningIn}
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 text-gray-700 font-medium"
        >
          {isGoogleSigningIn ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Signing in...
            </span>
          ) : (
            <>
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"
                  fill="#4285F4"
                />
              </svg>
              Continue with Google
            </>
          )}
        </button>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or</span>
        </div>
      </div>

      {/* Magic Link Form */}
      <form onSubmit={handleMagicLinkSubmit}>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            We'll send a link to access your results.
          </p>
          <button
            type="submit"
            disabled={isSubmitting || isGoogleSigningIn}
            className={`px-4 py-2 text-white font-medium rounded-md ${
              isSubmitting || isGoogleSigningIn
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Get Magic Link"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
