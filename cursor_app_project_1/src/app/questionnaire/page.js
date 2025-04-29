"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const steps = [
  {
    title: "Technical Assessment",
    questions: [
      {
        id: "tech1",
        text: "How would you rate your technical infrastructure?",
        type: "scale",
        options: [1, 2, 3, 4, 5],
      },
      {
        id: "tech2",
        text: "How mature is your development process?",
        type: "scale",
        options: [1, 2, 3, 4, 5],
      },
    ],
  },
  {
    title: "Process Assessment",
    questions: [
      {
        id: "proc1",
        text: "How well-defined are your business processes?",
        type: "scale",
        options: [1, 2, 3, 4, 5],
      },
      {
        id: "proc2",
        text: "How effective is your process documentation?",
        type: "scale",
        options: [1, 2, 3, 4, 5],
      },
    ],
  },
  {
    title: "People Assessment",
    questions: [
      {
        id: "people1",
        text: "How would you rate your team's skills and expertise?",
        type: "scale",
        options: [1, 2, 3, 4, 5],
      },
      {
        id: "people2",
        text: "How effective is your training and development program?",
        type: "scale",
        options: [1, 2, 3, 4, 5],
      },
    ],
  },
]

export default function Questionnaire() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [error, setError] = useState("")

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleNext = () => {
    const currentQuestions = steps[currentStep].questions
    const currentAnswers = currentQuestions.map((q) => answers[q.id])

    if (currentAnswers.some((a) => a === undefined)) {
      setError("Please answer all questions before proceeding")
      return
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
      setError("")
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
      setError("")
    }
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers,
          step: currentStep,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save responses")
      }

      // Redirect to dashboard after successful submission
      router.push("/dashboard")
    } catch (err) {
      setError(err.message)
    }
  }

  const currentStepData = steps[currentStep]

  return (
    <div className="min-h-[calc(100vh-8rem)] py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>

          {error && (
            <div className="alert alert-error mb-6">
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-8">
            {currentStepData.questions.map((question) => (
              <div key={question.id} className="space-y-4">
                <label className="block text-lg font-medium text-gray-900">
                  {question.text}
                </label>
                <div className="flex space-x-4">
                  {question.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleAnswer(question.id, option)}
                      className={`btn ${
                        answers[question.id] === option
                          ? "btn-primary"
                          : "btn-outline"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="btn btn-outline"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="btn btn-primary"
            >
              {currentStep === steps.length - 1 ? "Submit" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
