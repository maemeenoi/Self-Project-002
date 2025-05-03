"use client"

import { useState, useEffect } from "react"

export default function QuestionnaireForm({ questions, onSubmit, isLoading }) {
  const [answers, setAnswers] = useState({})
  const [currentCategory, setCurrentCategory] = useState(null)
  const [formProgress, setFormProgress] = useState(0)
  const [ratingOptions, setRatingOptions] = useState({})

  // Fetch rating options for questions
  useEffect(() => {
    async function fetchRatingOptions() {
      try {
        const response = await fetch("/api/questionnaire-options")
        if (response.ok) {
          const data = await response.json()
          setRatingOptions(data)
        } else {
          console.error("Failed to fetch rating options")
        }
      } catch (error) {
        console.error("Error fetching rating options:", error)
      }
    }

    fetchRatingOptions()
  }, [])

  // Set initial category when questions are loaded
  useEffect(() => {
    if (questions && Object.keys(questions).length > 0) {
      setCurrentCategory(Object.keys(questions)[0])
    }
  }, [questions])

  // Handle when a rating changes
  const handleRatingChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { score: parseInt(value, 10) },
    }))
  }

  // Handle text input answers
  const handleTextChange = (questionId, text) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { text },
    }))
  }

  // Navigate to previous category
  const goToPreviousCategory = () => {
    const categories = Object.keys(questions)
    const currentIndex = categories.indexOf(currentCategory)

    if (currentIndex > 0) {
      setCurrentCategory(categories[currentIndex - 1])
    }

    // Update progress
    setFormProgress(Math.max(0, ((currentIndex - 1) / categories.length) * 100))
  }

  // Navigate to next category
  const goToNextCategory = () => {
    const categories = Object.keys(questions)
    const currentIndex = categories.indexOf(currentCategory)

    if (currentIndex < categories.length - 1) {
      setCurrentCategory(categories[currentIndex + 1])

      // Update progress
      setFormProgress(
        Math.min(100, ((currentIndex + 1) / categories.length) * 100)
      )
    } else {
      // Last category - ready to submit
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    // Format answers for submission
    const formattedAnswers = Object.entries(answers).map(
      ([questionId, answer]) => ({
        questionId: parseInt(questionId, 10),
        score: answer.score,
        text: answer.text,
      })
    )

    onSubmit(formattedAnswers)
  }

  // If no questions or categories are loaded
  if (!questions || Object.keys(questions).length === 0 || !currentCategory) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading questions...</p>
      </div>
    )
  }

  const currentQuestions = questions[currentCategory] || []
  const categories = Object.keys(questions)
  const currentCategoryIndex = categories.indexOf(currentCategory)
  const isLastCategory = currentCategoryIndex === categories.length - 1

  return (
    <div className="space-y-8">
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full"
          style={{ width: `${formProgress}%` }}
        ></div>
      </div>

      {/* Category heading */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {currentCategory}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Question set {currentCategoryIndex + 1} of {categories.length}
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-8">
        {currentQuestions.map((question) => (
          <div
            key={question.QuestionID}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
          >
            <h3 className="font-medium text-gray-800 mb-3">
              {question.QuestionText}
            </h3>

            {/* Different question types based on Category */}
            {[
              "Cloud Strategy",
              "Cloud Cost",
              "Cloud Security",
              "Cloud People",
              "Cloud DevOps",
            ].includes(question.Category) ? (
              // Rating scale with options from database
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">
                  Select the most appropriate option:
                </p>
                <div className="space-y-2">
                  {ratingOptions[question.QuestionID]
                    ? // Use options from database
                      ratingOptions[question.QuestionID].map((option) => (
                        <label
                          key={option.score}
                          className={`flex items-center p-3 rounded-lg cursor-pointer ${
                            answers[question.QuestionID]?.score === option.score
                              ? "bg-blue-100 border border-blue-300"
                              : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question_${question.QuestionID}`}
                            value={option.score}
                            checked={
                              answers[question.QuestionID]?.score ===
                              option.score
                            }
                            onChange={() =>
                              handleRatingChange(
                                question.QuestionID,
                                option.score
                              )
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <div className="ml-3">
                            <span className="text-sm font-medium text-gray-900">
                              {option.score}. {option.text}
                            </span>
                          </div>
                        </label>
                      ))
                    : // Fallback to generic options
                      [1, 2, 3, 4, 5].map((rating) => (
                        <label
                          key={rating}
                          className={`flex items-center p-3 rounded-lg cursor-pointer ${
                            answers[question.QuestionID]?.score === rating
                              ? "bg-blue-100 border border-blue-300"
                              : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question_${question.QuestionID}`}
                            value={rating}
                            checked={
                              answers[question.QuestionID]?.score === rating
                            }
                            onChange={() =>
                              handleRatingChange(question.QuestionID, rating)
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <div className="ml-3">
                            <span className="text-sm font-medium text-gray-900">
                              {rating}.{" "}
                              {rating === 1
                                ? "Poor"
                                : rating === 2
                                ? "Below Average"
                                : rating === 3
                                ? "Average"
                                : rating === 4
                                ? "Good"
                                : "Excellent"}
                            </span>
                          </div>
                        </label>
                      ))}
                </div>
              </div>
            ) : (
              // Text input for other questions
              <div className="mt-4">
                <input
                  type="text"
                  value={answers[question.QuestionID]?.text || ""}
                  onChange={(e) =>
                    handleTextChange(question.QuestionID, e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your answer"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={goToPreviousCategory}
          disabled={currentCategoryIndex === 0 || isLoading}
          className={`px-4 py-2 border rounded-md ${
            currentCategoryIndex === 0 || isLoading
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Previous
        </button>

        <button
          type="button"
          onClick={goToNextCategory}
          disabled={isLoading}
          className={`px-4 py-2 rounded-md ${
            isLoading
              ? "bg-blue-400 text-white cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isLoading
            ? "Submitting..."
            : isLastCategory
            ? "Submit Assessment"
            : "Next"}
        </button>
      </div>
    </div>
  )
}
