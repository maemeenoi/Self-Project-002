// src/app/questionnaire/page.js
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import QuestionnaireForm from "../../components/questionnaire/QuestionnaireForm"
import EmailStep from "../../components/questionnaire/EmailStep"

export default function QuestionnairePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [questions, setQuestions] = useState({})
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState({})
  const [user, setUser] = useState(null)
  const [showEmailStep, setShowEmailStep] = useState(false)
  const [answers, setAnswers] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionComplete, setSubmissionComplete] = useState(false)
  const router = useRouter()

  // Fetch session and questions on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        // Get current session
        const sessionRes = await fetch("/api/auth/session")
        if (!sessionRes.ok) {
          console.error("Session response not OK:", await sessionRes.text())
          throw new Error("Failed to fetch session")
        }

        const sessionData = await sessionRes.json()

        if (sessionData.isLoggedIn) {
          setUser(sessionData.user)
        } else {
          setUser(null)
        }

        // Fetch questions
        const questionsRes = await fetch("/api/questions")
        const questionsData = await questionsRes.json()

        console.log("API response from /api/questions:", questionsData)

        // Save detailed debug info
        setDebugInfo({
          apiResponse: questionsData,
          hasData: !!questionsData && Object.keys(questionsData).length > 0,
          responseStatus: questionsRes.status,
          responseType: typeof questionsData,
        })

        if (
          !questionsData ||
          (typeof questionsData === "object" &&
            Object.keys(questionsData).length === 0)
        ) {
          setError("No questions available in the database")
          setQuestions({})
          setIsLoading(false)
          return
        }

        setQuestions(questionsData)
        setIsLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(`Failed to load questionnaire: ${err.message}`)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleQuestionnaireSubmit = (formAnswers) => {
    setAnswers(formAnswers)
    setShowEmailStep(true)
  }

  const handleEmailSubmit = async (email) => {
    setIsSubmitting(true)

    try {
      // Combine answers with email
      const response = await fetch("/api/questionnaire/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: answers,
          email: email,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit questionnaire")
      }

      // Set submission complete
      setSubmissionComplete(true)

      // Auto-redirect after 5 seconds
      setTimeout(() => {
        router.push("/submission-complete")
      }, 5000)
    } catch (err) {
      console.error("Submission error:", err)
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Skip to dashboard function
  const skipToQuestion = () => {
    router.push("/dashboard")
  }

  // Debug panel component
  const DebugPanel = () => (
    <div className="mt-8 p-4 bg-gray-100 rounded-lg border border-gray-300">
      <h3 className="font-bold mb-2">API Debug Information:</h3>
      <pre className="text-xs overflow-auto max-h-40">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading questionnaire...</p>
        <button
          onClick={skipToQuestion}
          className="mt-6 px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Skip to dashboard
        </button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
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
                <Link
                  href="/register"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 max-w-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>

        {/* <DebugPanel /> */}

        <div className="mt-6 flex flex-col items-center">
          <button
            onClick={() => window.location.reload()}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (submissionComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
            Submission Complete!
          </h2>
          <p className="mt-2 text-gray-600">
            Thanks for completing the assessment. We've sent a magic link to
            your email to view your results.
          </p>
          <p className="mt-6 text-sm text-gray-500">
            Redirecting to confirmation page...
          </p>
        </div>
      </div>
    )
  }

  // Check if questions were loaded successfully
  const questionCategories = Object.keys(questions)
  const hasQuestions = questionCategories.length > 0

  // Render either the questionnaire form or the email step
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Cloud Assessment Questionnaire
          </h1>
          <p className="mt-4 text-gray-500">
            Help us understand your cloud infrastructure to provide personalized
            recommendations.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          {showEmailStep ? (
            <EmailStep
              onSubmit={handleEmailSubmit}
              isSubmitting={isSubmitting}
            />
          ) : (
            <>
              <QuestionnaireForm
                questions={questions}
                onSubmit={handleQuestionnaireSubmit}
                isLoading={isLoading}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
