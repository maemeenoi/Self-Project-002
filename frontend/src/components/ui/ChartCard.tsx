interface ChartCardProps {
  title: string
  description?: string
  loading?: boolean
  children?: React.ReactNode
}

export function ChartCard({ title, description, loading, children }: ChartCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
        <div className="mt-3">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : children ? (
            children
          ) : (
            <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="mx-auto h-8 w-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h2a2 2 0 01-2-2z"
                  />
                </svg>
                <h3 className="mt-2 text-xs font-medium text-gray-900">No Data</h3>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}