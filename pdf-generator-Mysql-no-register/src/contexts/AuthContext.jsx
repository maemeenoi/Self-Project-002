"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react" // Import Next-Auth signOut function

// Create context
const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check if user is logged in on mount
  useEffect(() => {
    async function checkSession() {
      try {
        // First try to check Next-Auth session via your API endpoint
        const response = await fetch("/api/auth/session")
        const data = await response.json()

        if (data.isLoggedIn && data.user) {
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Error checking session:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  // Logout function - supports both auth systems
  const logout = async () => {
    try {
      // Try to log out using your custom API
      const response = await fetch("/api/auth/logout", {
        method: "GET",
      })

      // Also sign out from Next-Auth
      await signOut({ redirect: false })

      // Clear user state regardless of API response
      setUser(null)

      // Redirect to home page
      router.push("/")

      return { success: true }
    } catch (error) {
      console.error("Logout error:", error)

      // Clear user state even if the API call failed
      setUser(null)

      return { success: false, error: error.message }
    }
  }

  // Context value with setUser exposed for Next-Auth integration
  const value = {
    user,
    setUser, // Expose setUser for Next-Auth integration
    isLoggedIn: !!user,
    loading,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
