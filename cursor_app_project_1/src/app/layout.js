import "./globals.css"

export const metadata = {
  title: "Admin Dashboard",
  description: "Data-driven admin dashboard with assessment reports",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <div className="min-h-screen bg-gray-100">
          {/* Header */}
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <h1 className="text-2xl font-bold text-purple-600">
                      Admin Dashboard
                    </h1>
                  </div>
                </div>
                <div className="flex items-center">
                  {/* Add user menu here later */}
                </div>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white shadow-sm mt-auto">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
              <p className="text-center text-gray-500 text-sm">
                © {new Date().getFullYear()} Admin Dashboard. All rights
                reserved.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
