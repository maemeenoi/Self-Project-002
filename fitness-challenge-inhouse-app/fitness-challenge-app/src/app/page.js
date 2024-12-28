"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-8 tracking-tight">
          Welcome to Fitness Challenge
        </h1>
        {session ? (
          <div className="space-y-6">
            <p className="text-2xl text-gray-600">
              Welcome back, {session.user.email}!
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-2xl text-gray-600">
                Start your fitness journey today
              </p>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                Join our fitness challenge, set your goals, and compete with
                others to achieve your fitness targets.
              </p>
            </div>
            <div className="space-x-4">
              <Link
                href="/auth/signin"
                className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="inline-block bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Register
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
