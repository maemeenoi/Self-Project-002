'use client'

import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function Navbar() {
  const { data: session, status } = useSession()

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-800">
              Fitness Challenge
            </Link>
            {session && (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/leaderboard" className="text-gray-600 hover:text-gray-900">
                  Leaderboard
                </Link>
                <Link href="/rules" className="text-gray-600 hover:text-gray-900">
                  Rules
                </Link>
              </>
            )}
          </div>
          <div>
            {status === 'loading' ? (
              <div className="text-gray-600">Loading...</div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">{session.user.name}</span>
                <button
                  onClick={() => signOut()}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Sign In with Google
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}