// app/login/page.js
"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { useState } from "react"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const error = searchParams.get("error")
  const [isSigningIn, setIsSigningIn] = useState(false)

  // Error messages based on Next-Auth error codes
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "OAuthSignin":
        return "There was a problem signing in with Google. Please try again."
      case "OAuthCallback":
        return "There was a problem with the Google authentication callback."
      case "OAuthCreateAccount":
        return "There was a problem creating your account."
      case "EmailCreateAccount":
        return "There was a problem creating your account with this email."
      case "Callback":
        return "There was a problem with the authentication callback."
      case "OAuthAccountNotLinked":
        return "This email is already associated with another account."
      case "EmailSignin":
        return "There was a problem sending the email for sign-in."
      case "CredentialsSignin":
        return "The credentials you provided were invalid."
      case "SessionRequired":
        return "You must be signed in to access this page."
      default:
        return "An error occurred during authentication. Please try again."
    }
  }

  const handleGoogleSignIn = () => {
    setIsSigningIn(true)
    signIn("google", { callbackUrl })
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <span className="font-bold text-xl text-blue-600 hover:text-blue-800 transition-colors">
              MakeStuffGo
            </span>
          </Link>
          <nav className="flex space-x-6">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              href="/questionnaire"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
            >
              Assessment
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-600 mt-2">
              Sign in to access your cloud assessment dashboard
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-red-500 mr-2 mt-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-red-700">{getErrorMessage(error)}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center px-5 py-3 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors duration-200"
            >
              {isSigningIn ? (
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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">or</span>
              </div>
            </div>

            <div className="space-y-4">
              <Link
                href="/questionnaire"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 font-medium transition-colors duration-200"
              >
                Take the Assessment
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              First time here?{" "}
              <Link
                href="/questionnaire"
                className="text-blue-600 hover:underline font-medium"
              >
                Complete the assessment
              </Link>{" "}
              to get your personalized cloud maturity dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
          © 2025 MakeStuffGo. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
