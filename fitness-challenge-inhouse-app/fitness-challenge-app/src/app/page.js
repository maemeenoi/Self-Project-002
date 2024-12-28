import { getServerSession } from "next-auth"
import { signIn } from "next-auth/react"

export default async function Home() {
  const session = await getServerSession()

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-8 tracking-tight">
          Welcome to Fitness Challenge
        </h1>
        {session ? (
          <div className="space-y-6">
            <p className="text-2xl text-gray-600">
              Welcome back, {session.user.name}!
            </p>
            <a
              href="/dashboard"
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Go to Dashboard
            </a>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-2xl text-gray-600">
                Sign in to start your fitness journey
              </p>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                Join our fitness challenge, set your goals, and compete with
                others to achieve your fitness targets.
              </p>
            </div>
            <button
              onClick={() => signIn("google")}
              className="inline-flex items-center justify-center bg-white text-gray-800 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-gray-200"
            >
              <img
                src="/google-icon.svg"
                alt="Google"
                className="w-6 h-6 mr-3"
              />
              Sign in with Google
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
