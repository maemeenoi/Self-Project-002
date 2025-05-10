// components/LoginModal.jsx
import { useState } from "react"
import { signIn } from "next-auth/react"
import GoogleSignInButton from "./GoogleSignInButton"

export default function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("")
  const [isSendingLink, setIsSendingLink] = useState(false)
  const [linkSent, setLinkSent] = useState(false)
  const [error, setError] = useState("")

  const handleMagicLinkRequest = async (e) => {
    e.preventDefault()

    if (!email || !email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address")
      return
    }

    setIsSendingLink(true)
    setError("")

    try {
      const response = await fetch("/api/auth/send-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          redirectUrl: "/dashboard",
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to send magic link")
      }

      setLinkSent(true)
      setEmail("")
    } catch (error) {
      console.error("Error sending magic link:", error)
      setError(error.message)
    } finally {
      setIsSendingLink(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-500"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span className="sr-only">Close</span>
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Log in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your cloud assessment dashboard
          </p>
        </div>

        {linkSent ? (
          <div className="text-center py-6">
            <svg
              className="mx-auto h-12 w-12 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              Magic Link Sent!
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Check your email inbox for a link to access your dashboard.
            </p>
            <button
              onClick={() => setLinkSent(false)}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800"
            >
              Send another link
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Sign in with Google
                </p>
                <GoogleSignInButton callbackUrl="/dashboard" />
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Get a Magic Link
                </p>
                <form onSubmit={handleMagicLinkRequest}>
                  <div className="mb-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    {error && (
                      <p className="mt-1 text-sm text-red-600">{error}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingLink}
                    className={`w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      isSendingLink
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {isSendingLink ? "Sending..." : "Send Magic Link"}
                  </button>
                </form>
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-500 text-center">
              We'll send a secure link to your email for instant access.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
