// src/app/submission-complete/page.js
export default function SubmissionCompletePage() {
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>

        <h2 className="text-2xl font-bold text-gray-800 mt-4">Success!</h2>

        <div className="mt-4 space-y-4">
          <p className="text-gray-600">
            Thank you for completing the Cloud Assessment Questionnaire.
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
                  <strong>Next Steps:</strong>
                </p>
                <ul className="mt-1 text-sm text-blue-700 list-disc list-inside">
                  <li>Check your email for a magic link</li>
                  <li>Click the link to view your assessment dashboard</li>
                  <li>Review your cloud maturity score and recommendations</li>
                </ul>
              </div>
            </div>
          </div>

          <p className="text-gray-500 text-sm">
            Didn't receive an email? Check your spam folder or contact support.
          </p>
        </div>
      </div>
    </div>
  )
}
