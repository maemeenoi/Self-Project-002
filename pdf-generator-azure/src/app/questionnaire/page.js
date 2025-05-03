"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import QuestionnaireForm from "./QuestionnaireForm"

export default function QuestionnairePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [questions, setQuestions] = useState({})
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const router = useRouter()

  // Fetch session and questions on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        // Get current session
        console.log("Fetching session...")
        const sessionRes = await fetch("/api/auth/session")
        if (!sessionRes.ok) {
          console.error("Session response not OK:", await sessionRes.text())
          throw new Error("Failed to fetch session")
        }

        const sessionData = await sessionRes.json()
        console.log("Session data:", sessionData)

        if (!sessionData.isLoggedIn) {
          router.push("/login")
          return
        }

        setUser(sessionData.user)

        // Fetch questions
        console.log("Fetching questions...")
        const questionsRes = await fetch("/api/questions")

        if (!questionsRes.ok) {
          const errorText = await questionsRes.text()
          console.error("Questions response not OK:", errorText)
          throw new Error("Failed to fetch questions")
        }

        const questionsData = await questionsRes.json()
        console.log("Questions data:", questionsData)

        if (
          !questionsData ||
          !Array.isArray(questionsData) ||
          questionsData.length === 0
        ) {
          setError("No questions available in the database")
          setIsLoading(false)
          return
        }

        // Group all assessment questions by category
        // Include all questions that are not basic info (category is not "Client Information")
        const groupedQuestions = questionsData.reduce((acc, question) => {
          // Skip basic info questions or use category-based filtering
          if (question.Category !== "Client Information") {
            if (!acc[question.Category]) {
              acc[question.Category] = []
            }
            acc[question.Category].push(question)
          }
          return acc
        }, {})

        console.log("Grouped questions:", groupedQuestions)

        // Check if we have any questions after filtering
        if (Object.keys(groupedQuestions).length === 0) {
          setError("No assessment questions found. Please skip to dashboard.")
          setIsLoading(false)
          return
        }

        setQuestions(groupedQuestions)
        setIsLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(`Failed to load questionnaire: ${err.message}`)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  async function handleSubmit(answers) {
    setIsLoading(true)
    try {
      console.log("Submitting answers:", answers)
      const response = await fetch("/api/questionnaire/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Submission response not OK:", errorText)

        let errorMessage
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || "Failed to submit questionnaire"
        } catch (e) {
          errorMessage = "Failed to submit questionnaire"
        }

        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log("Submission successful:", data)

      // Redirect to dashboard on successful submission
      router.push("/dashboard")
    } catch (err) {
      console.error("Submission error:", err)
      setError(err.message)
      setIsLoading(false)
    }
  }

  // Function to skip the questionnaire
  const skipToQuestion = () => {
    router.push("/dashboard")
  }

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
        <div className="mt-6 flex flex-col items-center">
          <button
            onClick={() => window.location.reload()}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            Skip questionnaire and go to dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Check if questions were loaded successfully
  const questionCategories = Object.keys(questions)
  if (questionCategories.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 max-w-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
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
              <p className="text-sm text-yellow-700">
                No questionnaire categories found. Please contact support.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
          <QuestionnaireForm
            questions={questions}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
