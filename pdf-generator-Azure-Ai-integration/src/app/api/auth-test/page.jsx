// app/auth-test/page.jsx
"use client"

import { useSession, signIn, signOut } from "next-auth/react"

export default function AuthTest() {
  const { data: session, status } = useSession()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Next-Auth Test Page</h1>

      <div className="mb-4">
        <p className="text-lg">
          Status: <strong>{status}</strong>
        </p>

        {status === "authenticated" ? (
          <div className="mt-4 p-4 bg-green-100 rounded-lg">
            <h2 className="font-bold">Session Data:</h2>
            <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-w-lg">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        ) : status === "loading" ? (
          <p>Loading session...</p>
        ) : (
          <p>Not signed in</p>
        )}
      </div>

      <div className="flex gap-4">
        {status === "authenticated" ? (
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Sign In with Google
          </button>
        )}

        <a
          href="/"
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Back to Home
        </a>
      </div>

      <div className="mt-8 text-sm text-gray-500">
        <p>Environment Variables Status:</p>
        <ul className="list-disc pl-5 mt-2">
          <li>
            NEXTAUTH_URL:{" "}
            {process.env.NEXT_PUBLIC_NEXTAUTH_URL || "Not accessible in client"}
          </li>
          <li>
            GOOGLE_CLIENT_ID:{" "}
            {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
              ? "Set"
              : "Not accessible in client"}
          </li>
        </ul>
      </div>
    </div>
  )
}
