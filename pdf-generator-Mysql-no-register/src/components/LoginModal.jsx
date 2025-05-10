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
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 relative animate-fadeIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Modal header */}
        <div className="text-center mb-6">
          <div className="inline-block p-3 bg-blue-50 rounded-full mb-2">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your cloud assessment dashboard
          </p>
        </div>

        {linkSent ? (
          // Success state when magic link is sent
          <div className="text-center py-6">
            <div className="inline-block p-3 bg-green-100 rounded-full mb-2">
              <svg
                className="h-8 w-8 text-green-600"
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
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              Check Your Email
            </h3>
            <p className="mt-3 text-sm text-gray-600">
              We've sent a magic link to <strong>{email}</strong>. Click the
              link in the email to access your dashboard.
            </p>
            <div className="mt-6 flex flex-col space-y-3">
              <button
                onClick={() => setLinkSent(false)}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Use a different email
              </button>
              <button
                onClick={onClose}
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Close this window
              </button>
            </div>
          </div>
        ) : (
          // Login options
          <>
            <div className="mb-6">
              {/* Google Sign In */}
              <div className="mb-5">
                <GoogleSignInButton
                  callbackUrl="/dashboard"
                  disabled={isSendingLink}
                />
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Magic Link Form */}
              <div>
                <form onSubmit={handleMagicLinkRequest} className="space-y-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                      disabled={isSendingLink}
                    />
                    {error && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center">
                        <svg
                          className="h-4 w-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {error}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingLink}
                    className={`w-full flex justify-center items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-white font-medium transition-colors ${
                      isSendingLink
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {isSendingLink ? (
                      <>
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
                        Sending...
                      </>
                    ) : (
                      "Send Magic Link"
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Footer message */}
            <p className="mt-5 text-sm text-gray-500 text-center">
              We'll send a secure link to your email for instant access.
              <br />
              No password required.
            </p>
          </>
        )}

        {/* Footer link - for new users */}
        <div className="mt-6 text-center text-sm border-t border-gray-100 pt-4">
          <p className="text-gray-600">
            New to MakeStuffGo?{" "}
            <a
              href="/questionnaire"
              className="text-blue-600 font-medium hover:text-blue-800"
            >
              Take the assessment
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
