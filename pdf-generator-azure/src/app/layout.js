import "./globals.css"
import { Inter } from "next/font/google"
import { AuthProvider } from "../contexts/AuthContext"
import Navbar from "../components/layout/Navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Cloud Cost Assessment",
  description: "Assess and optimize your cloud infrastructure costs",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
