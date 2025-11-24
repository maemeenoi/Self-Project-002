import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { TimezoneProvider } from '@/context/TimezoneContext'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'makeStuffGo Portal',
  description: 'Modern dashboard for makeStuffGo platform management',
  keywords: ['admin', 'dashboard', 'management', 'azure', 'next.js'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="makestuffgo">
      <body className="font-sans bg-base-200 text-base-content antialiased min-h-screen flex flex-col" suppressHydrationWarning={true}>
        <AuthProvider>
          <TimezoneProvider>
            <main className="flex-grow bg-base-200 pb-16">
              {children}
            </main>
            <Footer />
          </TimezoneProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
