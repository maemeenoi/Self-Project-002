// components/questionnaire/EmailStep.jsx
import { useState } from "react"

export default function EmailStep({ onSubmit, isSubmitting }) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()

    // Simple email validation
    if (!email || !email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address")
      return
    }

    onSubmit(email)
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Almost Done! Get Your Assessment Results
      </h2>
      <p className="text-gray-600 mb-6">
        Enter your email to receive your full assessment report and access your
        personalized dashboard.
      </p>

      <form onSubmit={handleSubmit}>
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
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            We'll only use your email to send you your assessment results.
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 text-white font-medium rounded-md ${
              isSubmitting
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
              "Get Results"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
