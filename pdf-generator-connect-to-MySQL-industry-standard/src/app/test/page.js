export default function TestPage() {
  return (
    <div data-theme="corporate" className="p-10 space-y-6">
      <div className="card bg-base-100 shadow-md p-6">
        <h1 className="text-2xl font-bold">Card Title</h1>
        <p>This is a card inside the corporate theme!</p>
      </div>

      <button className="btn btn-primary">Primary Button</button>
      <button className="btn btn-secondary">Secondary Button</button>
    </div>
  )
}
