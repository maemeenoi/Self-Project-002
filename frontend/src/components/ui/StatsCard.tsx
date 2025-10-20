interface StatsCardProps {
  title: string
  value: string
  description: string
  trend?: string
}

export function StatsCard({ title, value, description, trend }: StatsCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-1 w-0">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
        <div className="mt-3">
          <div className="text-sm">
            <span className="text-gray-500">{description}</span>
            {trend && (
              <span className="ml-2 text-green-600 font-medium">
                {trend}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}