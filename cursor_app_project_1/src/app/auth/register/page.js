"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { register, isAuthenticated } from "@/utils/auth"

const questions = [
  { id: 1, text: "Tell us your name?", category: "Client Information" },
  { id: 2, text: "Name of your business", category: "Client Information" },
  {
    id: 3,
    text: "What is your email address?",
    category: "Client Information",
  },
  {
    id: 4,
    text: "What is the size of your business (number of employees)?",
    category: "Client Information",
  },
  { id: 5, text: "Which industry you in?", category: "Client Information" },
  {
    id: 6,
    text: "How aligned is your cloud strategy to broader business goals and priorities?",
    category: "Cloud Strategy",
    isScore: true,
    options: [
      { value: 1, label: "Not aligned" },
      { value: 2, label: "Somewhat aligned" },
      { value: 3, label: "Moderately aligned" },
      { value: 4, label: "Well aligned" },
      { value: 5, label: "Perfectly aligned" },
    ],
  },
  {
    id: 7,
    text: "How aligned are you with the cloud governance model to guide cloud adoption decisions (e.g cost, compliance, performance, architecture)?",
    category: "Cloud Strategy",
    isScore: true,
    options: [
      { value: 1, label: "No governance model" },
      { value: 2, label: "Basic governance" },
      { value: 3, label: "Defined governance" },
      { value: 4, label: "Well-managed governance" },
      { value: 5, label: "Optimized governance" },
    ],
  },
  {
    id: 8,
    text: "What percentage of your applications are roughly hosted in Cloud (SaaS, PasS, IaaS etc) current out of the total cost of your IT business?",
    category: "Cloud Strategy",
    isScore: true,
    options: [
      { value: 1, label: "0-20%" },
      { value: 2, label: "21-40%" },
      { value: 3, label: "41-60%" },
      { value: 4, label: "61-80%" },
      { value: 5, label: "81-100%" },
    ],
  },
  {
    id: 9,
    text: "As a business, what level of visibility you get around cloud costs by service, department, and project?",
    category: "Cloud Cost",
    isScore: true,
    options: [
      { value: 1, label: "No visibility" },
      { value: 2, label: "Limited visibility" },
      { value: 3, label: "Moderate visibility" },
      { value: 4, label: "Good visibility" },
      { value: 5, label: "Complete visibility" },
    ],
  },
  {
    id: 10,
    text: "As a business, How often do you review cloud budgets, forecasts and negotiate with cloud providers?",
    category: "Cloud Cost",
    isScore: true,
    options: [
      { value: 1, label: "Never" },
      { value: 2, label: "Annually" },
      { value: 3, label: "Quarterly" },
      { value: 4, label: "Monthly" },
      { value: 5, label: "Weekly" },
    ],
  },
  {
    id: 11,
    text: "How satisfied are you with the value for money in your cloud today?",
    category: "Cloud Cost",
    isScore: true,
    options: [
      { value: 1, label: "Very dissatisfied" },
      { value: 2, label: "Dissatisfied" },
      { value: 3, label: "Neutral" },
      { value: 4, label: "Satisfied" },
      { value: 5, label: "Very satisfied" },
    ],
  },
  {
    id: 12,
    text: "How would you rate your organization's cloud security posture against the best practices?",
    category: "Cloud Security",
    isScore: true,
    options: [
      { value: 1, label: "Poor" },
      { value: 2, label: "Fair" },
      { value: 3, label: "Good" },
      { value: 4, label: "Very good" },
      { value: 5, label: "Excellent" },
    ],
  },
  {
    id: 13,
    text: "How do you think cloud security investments are aligned to business risk and financial value and developer experience to be faster and safer?",
    category: "Cloud Security",
    isScore: true,
    options: [
      { value: 1, label: "Not aligned" },
      { value: 2, label: "Somewhat aligned" },
      { value: 3, label: "Moderately aligned" },
      { value: 4, label: "Well aligned" },
      { value: 5, label: "Perfectly aligned" },
    ],
  },
  {
    id: 14,
    text: "What is the maturity of you Cloud Platform / Center of Excellence (CCoE) or cloud operations team?",
    category: "Cloud People",
    isScore: true,
    options: [
      { value: 1, label: "No team" },
      { value: 2, label: "Basic team" },
      { value: 3, label: "Established team" },
      { value: 4, label: "Mature team" },
      { value: 5, label: "Advanced team" },
    ],
  },
  {
    id: 15,
    text: "As a business, how often you think each software change will cost an issue, incident in production?",
    category: "Cloud DevOps",
    isScore: true,
    options: [
      { value: 1, label: "Very frequently" },
      { value: 2, label: "Frequently" },
      { value: 3, label: "Occasionally" },
      { value: 4, label: "Rarely" },
      { value: 5, label: "Very rarely" },
    ],
  },
  {
    id: 16,
    text: "How often you deploy your software to Production?",
    category: "Cloud DevOps",
    isScore: true,
    options: [
      { value: 1, label: "Monthly or less" },
      { value: 2, label: "Bi-weekly" },
      { value: 3, label: "Weekly" },
      { value: 4, label: "Daily" },
      { value: 5, label: "Multiple times per day" },
    ],
  },
  {
    id: 17,
    text: "How long usually it takes a new business idea to go to production and to the hand of the end user?",
    category: "Cloud DevOps",
    isScore: true,
    options: [
      { value: 1, label: "6+ months" },
      { value: 2, label: "3-6 months" },
      { value: 3, label: "1-3 months" },
      { value: 4, label: "2-4 weeks" },
      { value: 5, label: "Less than 2 weeks" },
    ],
  },
  {
    id: 18,
    text: "How quickly can you recover when you have a technology incident?",
    category: "Cloud DevOps",
    isScore: true,
    options: [
      { value: 1, label: "Days" },
      { value: 2, label: "Hours" },
      { value: 3, label: "1 hour" },
      { value: 4, label: "Minutes" },
      { value: 5, label: "Automatic recovery" },
    ],
  },
  {
    id: 19,
    text: "Do you have ongoing training and enablement programs for cloud skills development?",
    category: "Cloud People",
    isScore: true,
    options: [
      { value: 1, label: "No program" },
      { value: 2, label: "Ad-hoc training" },
      { value: 3, label: "Basic program" },
      { value: 4, label: "Structured program" },
      { value: 5, label: "Comprehensive program" },
    ],
  },
  {
    id: 20,
    text: "How would you rate your developer experience?",
    category: "Cloud People",
    isScore: true,
    options: [
      { value: 1, label: "Poor" },
      { value: 2, label: "Fair" },
      { value: 3, label: "Good" },
      { value: 4, label: "Very good" },
      { value: 5, label: "Excellent" },
    ],
  },
]

export default function Register() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Registration data
    name: "",
    email: "",
    password: "",
    phone: "",
    // Questionnaire responses
    responses: questions.reduce((acc, q) => {
      acc[q.id] = q.isScore ? null : ""
      return acc
    }, {}),
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/dashboard")
    }
  }, [router])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleResponseChange = (questionId, value) => {
    setFormData((prev) => ({
      ...prev,
      responses: {
        ...prev.responses,
        [questionId]: value,
      },
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // First register the user
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          responses: formData.responses,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to register")
      }

      const data = await response.json()
      console.log("Registration and questionnaire submission successful", data)
      window.location.href = "/dashboard"
    } catch (err) {
      setError(err.message || "Failed to register")
    } finally {
      setLoading(false)
    }
  }

  const renderRegistrationForm = () => (
    <div className="space-y-6">
      <div className="rounded-md shadow-sm -space-y-px">
        <div>
          <label htmlFor="name" className="sr-only">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="phone" className="sr-only">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="email-address" className="sr-only">
            Email address
          </label>
          <input
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Email address"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
          />
        </div>
      </div>
    </div>
  )

  const renderQuestionnaireForm = () => {
    const currentCategory = questions[step - 2]?.category
    const categoryQuestions = questions.filter(
      (q) => q.category === currentCategory
    )

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">{currentCategory}</h3>
        {categoryQuestions.map((question) => (
          <div key={question.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {question.text}
            </label>
            {question.isScore ? (
              <div className="flex space-x-4">
                {question.options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`px-4 py-2 rounded ${
                      formData.responses[question.id] === option.value
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                    onClick={() =>
                      handleResponseChange(question.id, option.value)
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={formData.responses[question.id] || ""}
                onChange={(e) =>
                  handleResponseChange(question.id, e.target.value)
                }
              />
            )}
          </div>
        ))}
      </div>
    )
  }

  const categories = [...new Set(questions.map((q) => q.category))]
  const totalSteps = categories.length + 1 // Registration + categories

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {step === 1
              ? "Create your account"
              : `Questionnaire - ${questions[step - 2]?.category}`}
          </h2>
          {step === 1 && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{" "}
              <Link
                href="/auth/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                sign in to your account
              </Link>
            </p>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {step === 1 ? renderRegistrationForm() : renderQuestionnaireForm()}

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div className="flex justify-between space-x-4">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="group relative flex-1 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Previous
              </button>
            )}
            {step < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="group relative flex-1 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="group relative flex-1 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? "Creating account..." : "Complete Registration"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
