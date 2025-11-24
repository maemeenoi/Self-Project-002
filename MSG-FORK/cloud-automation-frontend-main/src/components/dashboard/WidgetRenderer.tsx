export default function WidgetRenderer({ widget, data }: { 
  widget: any
  data?: any 
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {widget.name}
      </h3>
      <div className="text-gray-600">
        {widget.description}
      </div>
      {data && (
        <div className="mt-4 text-sm text-gray-500">
          Data available: {JSON.stringify(data, null, 2)}
        </div>
      )}
    </div>
  )
}