"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { signIn } from "next-auth/react"
import LoginModal from "../components/LoginModal"
import GoogleSignInButton from "@/components/GoogleSignInButton"
import FlowDiagram from "@/components/FlowDiagram"

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [returnEmail, setReturnEmail] = useState("")
  const [isSendingLink, setIsSendingLink] = useState(false)
  const [linkSent, setLinkSent] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [error, setError] = useState("")

  const handleMagicLinkRequest = async (e) => {
    e.preventDefault()

    if (
      !returnEmail ||
      !returnEmail.includes("@") ||
      !returnEmail.includes(".")
    ) {
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
          email: returnEmail,
          redirectUrl: "/dashboard",
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to send magic link")
      }

      setLinkSent(true)
      setReturnEmail("")
    } catch (error) {
      console.error("Error sending magic link:", error)
      setError(error.message)
    } finally {
      setIsSendingLink(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="font-bold text-xl text-primary">
                  MakeStuffGo
                </span>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Login
              </button>
              <Link
                href="/questionnaire"
                className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Take Assessment
              </Link>
            </div>
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <button
                onClick={() => {
                  setIsMenuOpen(false)
                  setIsLoginModalOpen(true)
                }}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                Login
              </button>
              <Link
                href="/questionnaire"
                className="block px-3 py-2 text-base font-medium text-green-600 hover:bg-green-50 hover:text-green-700"
              >
                Take Assessment
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Optimize Your</span>
              <span className="block text-blue-600">Cloud Costs</span>
            </h1>
            <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
              Take control of your cloud spending with our comprehensive
              assessment and optimization platform. Identify savings
              opportunities and improve your cloud maturity.
            </p>
            <div className="mt-8 sm:flex sm:justify-center lg:justify-start">
              <div className="rounded-md shadow">
                <Link
                  href="/questionnaire"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:py-4 md:text-lg md:px-10"
                >
                  Take Assessment
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-12 lg:mt-0 lg:col-span-6">
            <div className="bg-blue-900 p-8 rounded-xl shadow-xl">
              <div className="relative h-64 w-full rounded-lg overflow-hidden">
                {/* Placeholder for visualization graphic */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-70"></div>
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 100 100"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern
                      id="grid"
                      width="10"
                      height="10"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 10 0 L 0 0 0 10"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="0.5"
                        opacity="0.3"
                      />
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#grid)" />

                  {/* Simple visualization elements */}
                  <circle
                    cx="30"
                    cy="30"
                    r="10"
                    fill="white"
                    fillOpacity="0.6"
                  />
                  <circle
                    cx="70"
                    cy="40"
                    r="15"
                    fill="white"
                    fillOpacity="0.6"
                  />
                  <circle
                    cx="50"
                    cy="70"
                    r="12"
                    fill="white"
                    fillOpacity="0.6"
                  />

                  <line
                    x1="30"
                    y1="30"
                    x2="70"
                    y2="40"
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="70"
                    y1="40"
                    x2="50"
                    y2="70"
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="50"
                    y1="70"
                    x2="30"
                    y2="30"
                    stroke="white"
                    strokeWidth="1.5"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    Cloud Cost Efficiency
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-400 h-2.5 rounded-full"
                      style={{ width: "70%" }}
                    ></div>
                  </div>
                  <span className="ml-2 text-white text-sm">70%</span>
                </div>
                <p className="mt-2 text-white text-sm">
                  Average cost savings for our clients
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flow Diagram Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
              How It Works
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Simple Steps to Cloud Optimization
            </p>
          </div>
          <FlowDiagram />
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A better way to manage cloud costs
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our platform provides comprehensive tools to assess, visualize,
              and optimize your cloud infrastructure.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              {/* Feature 1 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Cloud Maturity Assessment
                  </h3>
                  <p className="mt-2 text-base text-gray-500">
                    Evaluate your cloud infrastructure against industry
                    standards and identify areas for improvement.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Cost Optimization
                  </h3>
                  <p className="mt-2 text-base text-gray-500">
                    Discover cost-saving opportunities and get actionable
                    recommendations to reduce your cloud spending.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Comprehensive Reports
                  </h3>
                  <p className="mt-2 text-base text-gray-500">
                    Generate detailed PDF reports to share with stakeholders and
                    track your progress over time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment CTA Section */}
      <div className="bg-blue-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Ready to optimize your cloud infrastructure?
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Start with our free cloud assessment and get personalized
              recommendations.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/questionnaire"
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:py-4 md:text-lg md:px-10"
              >
                Take the Assessment Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:order-2">
              <span className="text-gray-400 text-sm">
                © 2025 MakeStuffGo. All rights reserved.
              </span>
            </div>
            <div className="mt-8 md:mt-0 md:order-1">
              <p className="text-center text-base text-gray-400">
                Ensuring every dollar you spend on the cloud is working as hard
                as you
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
