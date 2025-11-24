export default function SectionHeader({ title, description }: { 
  title: string
  description?: string 
}) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      {description && (
        <p className="text-gray-600 mt-2">{description}</p>
      )}
    </div>
  )
}