import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FinOps Admin Portal',
  description: 'Comprehensive financial analytics and workflow management portal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 font-sans">
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  )
}