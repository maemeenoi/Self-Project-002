import { Inter } from "next/font/google"
import "./globals.css"
import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/[...nextauth]/route"
import SessionProvider from "@/components/SessionProvider"
import Navbar from "@/components/Navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Fitness Challenge App",
  description: "Track your fitness progress and compete with others",
}

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions)
  console.log("Root Layout - Server Session:", session)

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">{children}</main>
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}
