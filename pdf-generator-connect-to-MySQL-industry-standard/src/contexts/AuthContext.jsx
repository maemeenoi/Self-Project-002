"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

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

  // Login function
  const login = async (email, password) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      // Fetch the session data again to get the user info
      const sessionResponse = await fetch("/api/auth/session")
      const sessionData = await sessionResponse.json()

      if (sessionData.isLoggedIn && sessionData.user) {
        setUser(sessionData.user)
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "GET",
      })

      if (!response.ok) {
        console.error("Logout API error:", response.status)
      }

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

  // Register function
  const register = async (userData) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Registration failed")
      }

      // Set user data
      setUser({
        userId: data.userId,
        clientId: data.clientId,
        clientName: userData.name,
        email: userData.email,
      })

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Context value
  const value = {
    user,
    isLoggedIn: !!user,
    loading,
    login,
    logout,
    register,
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
