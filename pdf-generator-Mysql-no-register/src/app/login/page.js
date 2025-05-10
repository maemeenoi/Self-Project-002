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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Sign In
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{getErrorMessage(error)}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 text-gray-700 font-medium"
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
                Sign in with Google
              </>
            )}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <Link
            href="/questionnaire"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Take Assessment
          </Link>

          <Link
            href="/"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
