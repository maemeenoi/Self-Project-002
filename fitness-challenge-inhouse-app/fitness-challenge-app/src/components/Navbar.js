"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"

export default function Navbar() {
  const { data: session, status } = useSession()

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors duration-200"
            >
              Fitness Challenge
            </Link>
            {session && (
              <div className="hidden md:flex items-center space-x-6">
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                >
                  Dashboard
                </Link>
                <Link
                  href="/leaderboard"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                >
                  Leaderboard
                </Link>
                <Link
                  href="/rules"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                >
                  Rules
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center">
            {status === "loading" ? (
              <div className="text-gray-600">Loading...</div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-medium hidden sm:inline-block">
                  {session.user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
