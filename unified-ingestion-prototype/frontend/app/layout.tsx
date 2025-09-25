import Link from 'next/link';
import '../styles/globals.css';

export const metadata = { title: 'Unified Ingestion Prototype' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">
        <div className="mx-auto max-w-6xl p-6">
          <header className="mb-6">
            <h1 className="text-2xl font-bold">MakeStuffGo · Unified Ingestion</h1>
            <p className="text-sm text-gray-600">Jira (CSV/API) + GitHub (API) → SQLite via Prisma</p>
            
            {/* Navigation */}
            <nav className="mt-4 flex gap-4">
              <Link 
                href="/dashboard" 
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                📊 Dashboard
              </Link>
              <Link 
                href="/ingestion" 
                className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                🚀 Live Ingestion
              </Link>
              <Link 
                href="/test" 
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
              >
                🧪 Test
              </Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
