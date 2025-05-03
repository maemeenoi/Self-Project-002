"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "../../contexts/AuthContext"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  // Check if the current page is the landing page
  const isLandingPage = pathname === "/"

  // If we're on the landing page or login/register pages, don't show the app navbar
  if (
    isLandingPage ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/questionnaire"
  ) {
    return null
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link
                href={isLoggedIn ? "/dashboard" : "/"}
                className="flex items-center gap-2"
              >
                <span className="font-bold text-xl text-blue-600">
                  MakeStuffGo
                </span>
              </Link>
            </div>

            {isLoggedIn && (
              <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 text-sm font-medium ${
                    pathname === "/dashboard"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Dashboard
                </Link>
              </div>
            )}
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isLoggedIn ? (
              <div className="relative">
                <div className="flex items-center">
                  <span className="mr-2 text-sm text-gray-700">
                    {user?.clientName || "User"}
                  </span>
                  <button
                    onClick={() => logout()}
                    className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  href="/login"
                  className="px-3 py-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {isLoggedIn && (
              <Link
                href="/dashboard"
                className={`block px-3 py-2 text-base font-medium ${
                  pathname === "/dashboard"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                Dashboard
              </Link>
            )}
          </div>

          <div className="pt-4 pb-3 border-t border-gray-200">
            {isLoggedIn ? (
              <div className="flex items-center px-4 py-2">
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {user?.clientName || "User"}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {user?.email || ""}
                  </div>
                </div>
                <button
                  onClick={() => logout()}
                  className="ml-auto px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 px-4">
                <Link
                  href="/login"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 text-base font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
