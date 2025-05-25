// src/app/submission-complete/page.js
import Link from "next/link"

export default function SubmissionCompletePage() {
  return (
    <div>
      {/* Simple Header */}
      <nav className="bg-white shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center">
              <span className="font-bold text-xl text-primary">
                MakeStuffGo
              </span>
            </Link>
            <div className="flex space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>

          <h2 className="text-2xl font-bold text-gray-800 mt-4">
            Assessment Complete! 🎉
          </h2>

          <div className="mt-4 space-y-4">
            <p className="text-gray-600">
              Thank you for completing the FinOps Cloud Assessment! Your
              comprehensive report is being prepared.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-left">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>What happens next:</strong>
                  </p>
                  <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                    <li>Check your email for a secure access link</li>
                    <li>Click the link to view your interactive dashboard</li>
                    <li>Explore your FinOps maturity scores and AI insights</li>
                    <li>Download your comprehensive PDF report</li>
                    <li>Share results with your team</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 text-left">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-amber-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-700">
                    <strong>💡 Pro Tip:</strong> Want instant access with
                    Google? Next time, choose "Continue with Google" during the
                    assessment for immediate dashboard access and AI-powered
                    insights!
                  </p>
                </div>
              </div>
            </div>

            <p className="text-gray-500 text-sm">
              Email not arriving? Check your spam folder or contact our support
              team.
            </p>

            <div className="mt-6 space-y-3">
              <Link
                href="/questionnaire"
                className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Take Another Assessment
              </Link>
              <Link
                href="/"
                className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
