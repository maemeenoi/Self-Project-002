export default function DashboardHeader({ title, user }: { 
  title: string
  user?: any
}) {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {user && (
            <p className="text-gray-600 mt-2">Welcome back, {user.name}</p>
          )}
        </div>
      </div>
    </div>
  )
}