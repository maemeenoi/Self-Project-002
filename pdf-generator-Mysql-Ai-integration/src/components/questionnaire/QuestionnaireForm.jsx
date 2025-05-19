"use client"

import { useState, useEffect } from "react"

export default function QuestionnaireForm({ questions, onSubmit, isLoading }) {
  const [answers, setAnswers] = useState({})
  const [currentCategory, setCurrentCategory] = useState("Client Information") // Start with client info
  const [formProgress, setFormProgress] = useState(0)
  const [ratingOptions, setRatingOptions] = useState({})

  // Basic client information questions (1-5)
  const clientInfoQuestion = [
    {
      QuestionID: 1,
      QuestionText: "Your Name",
      Category: "Client Information",
      placeholder: "Enter your full name",
    },
    {
      QuestionID: 2,
      QuestionText: "Organization/Business Name",
      Category: "Client Information",
      placeholder: "Enter your organization name",
    },
    {
      QuestionID: 3,
      QuestionText: "Email Address",
      Category: "Client Information",
      placeholder: "email@example.com",
      type: "email",
    },
    {
      QuestionID: 4,
      QuestionText: "Company Size (number of employees)",
      Category: "Client Information",
      options: [
        "1-10 employees",
        "11-50 employees",
        "51-200 employees",
        "201-500 employees",
        "501-1000 employees",
        "1000+ employees",
      ],
    },
    {
      QuestionID: 5,
      QuestionText: "Industry",
      Category: "Client Information",
      options: [
        "Technology",
        "Financial Services",
        "Healthcare",
        "Education",
        "Manufacturing",
        "Retail",
        "Government",
        "Non-profit",
        "Other",
      ],
    },
  ]

  // Combine client info with provided questions
  const allQuestion = {
    "Client Information": clientInfoQuestion,
    ...questions,
  }

  // Fetch rating options for questions
  useEffect(() => {
    async function fetchRatingOptions() {
      try {
        const response = await fetch("/api/questionnaire-options")
        if (response.ok) {
          const data = await response.json()
          console.log("Rating options fetched:", data)
          setRatingOptions(data)
        } else {
          console.error(
            "Failed to fetch rating options:",
            await response.text()
          )
        }
      } catch (error) {
        console.error("Error fetching rating options:", error)
      }
    }

    fetchRatingOptions()
  }, [])

  // Handle when a rating changes
  const handleRatingChange = (questionId, value, optionId, standardText) => {
    console.log(
      `Rating changed for question ${questionId}: value=${value}, optionId=${optionId}, text=${standardText}`
    )
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        score: parseInt(value, 10),
        questionId: questionId,
        optionId: optionId,
        standardText: standardText, // Store the standard text
      },
    }))
  }

  // Handle text input answers
  const handleTextChange = (questionId, text) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { text },
    }))
  }

  // Handle dropdown select answers
  const handleSelectChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { text: value },
    }))
  }

  // Navigate to previous category
  const goToPreviousCategory = () => {
    const categories = Object.keys(allQuestion)
    const currentIndex = categories.indexOf(currentCategory)

    if (currentIndex > 0) {
      setCurrentCategory(categories[currentIndex - 1])
    }

    // Update progress
    setFormProgress(Math.max(0, ((currentIndex - 1) / categories.length) * 100))
  }

  // Check if all required fields in the current category are filled
  const isCurrentCategoryComplete = () => {
    // For Client Information category, check that required fields are filled
    if (currentCategory === "Client Information") {
      // Make sure questions 1-3 (name, business, email) have answers
      const requiredQuestion = [1, 2, 3]
      return requiredQuestion.every(
        (qId) =>
          answers[qId] && answers[qId].text && answers[qId].text.trim() !== ""
      )
    }

    // For other categories, we can be more flexible
    return true
  }

  // Navigate to next category
  const goToNextCategory = () => {
    // Validate current category first
    if (!isCurrentCategoryComplete()) {
      alert("Please fill in all required fields before continuing.")
      return
    }

    const categories = Object.keys(allQuestion)
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
      ([questionId, answer]) => {
        // Create the answer object
        const formatted = {
          questionId: parseInt(questionId, 10),
          score: answer.score,
          text: answer.text,
          standardText: answer.standardText,
          optionId: answer.optionId,
        }

        // Only include optionId if it exists
        if (answer.optionId) {
          formatted.optionId = answer.optionId
        }

        return formatted
      }
    )

    console.log("Submitting answers:", formattedAnswers)
    // Check if we have answers to submit
    if (formattedAnswers.length === 0) {
      console.error("No answers to submit - answers object is empty")
    }
    onSubmit(formattedAnswers)
  }

  // If no questions or categories are loaded
  if (!allQuestion || Object.keys(allQuestion).length === 0) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading questions...</p>
      </div>
    )
  }

  const currentQuestion = allQuestion[currentCategory] || []
  const categories = Object.keys(allQuestion)
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

      {/* Question */}
      <div className="space-y-8">
        {currentQuestion.map((question) => (
          <div
            key={question.QuestionID}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
          >
            <h3 className="font-medium text-gray-800 mb-3">
              {question.QuestionText}
              {currentCategory === "Client Information" &&
                question.QuestionID <= 3 && (
                  <span className="text-red-500 ml-1">*</span>
                )}
            </h3>

            {/* Different question types based on Category and QuestionID */}
            {currentCategory === "Client Information" ? (
              // Form inputs for client information
              <div className="mt-4">
                {question.options ? (
                  // Select dropdown for options
                  <select
                    value={answers[question.QuestionID]?.text || ""}
                    onChange={(e) =>
                      handleSelectChange(question.QuestionID, e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select an option</option>
                    {question.options.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  // Text input for name, business, email
                  <input
                    type={question.type || "text"}
                    value={answers[question.QuestionID]?.text || ""}
                    onChange={(e) =>
                      handleTextChange(question.QuestionID, e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder={question.placeholder || ""}
                    required={question.QuestionID <= 3}
                  />
                )}
              </div>
            ) : question.QuestionID === 20 ? (
              // Special case: Question 20 is a text input (opinion answer)
              <div className="mt-4">
                <textarea
                  value={answers[question.QuestionID]?.text || ""}
                  onChange={(e) =>
                    handleTextChange(question.QuestionID, e.target.value)
                  }
                  placeholder="Enter your thoughts here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                ></textarea>
              </div>
            ) : [
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
                  {ratingOptions[question.QuestionID] ? (
                    // Use options from database with StandardText
                    ratingOptions[question.QuestionID].map((option) => (
                      <label
                        key={option.id || option.score}
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
                            answers[question.QuestionID]?.score === option.score
                          }
                          onChange={() =>
                            handleRatingChange(
                              question.QuestionID,
                              option.score,
                              option.id,
                              option.text // Pass StandardText
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
                  ) : (
                    // If no options are available, show loading message
                    <div className="text-sm text-gray-500 italic">
                      Loading options...
                    </div>
                  )}
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

      {/* Required fields note for Client Information section */}
      {currentCategory === "Client Information" && (
        <div className="text-sm text-gray-500">
          <span className="text-red-500">*</span> Required fields
        </div>
      )}

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
