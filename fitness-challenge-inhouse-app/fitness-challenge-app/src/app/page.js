import { getServerSession } from 'next-auth'

export default async function Home() {
  const session = await getServerSession()

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to Fitness Challenge</h1>
      {session ? (
        <div className="space-y-4">
          <p className="text-xl text-gray-600">
            Welcome back, {session.user.name}!
          </p>
          <a
            href="/dashboard"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xl text-gray-600">
            Sign in to start tracking your fitness journey
          </p>
          <p className="text-gray-500 max-w-md">
            Join our fitness challenge, set your goals, and compete with others to achieve your fitness targets.
          </p>
        </div>
      )}
    </div>
  )
}