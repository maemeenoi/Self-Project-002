import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Admin Dashboard
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Data-driven insights for your business
        </p>
        <div className="space-x-4">
          <Link href="/auth/login" className="btn btn-primary">
            Login
          </Link>
          <Link href="/auth/register" className="btn btn-outline btn-primary">
            Register
          </Link>
        </div>
      </div>
    </div>
  )
}
