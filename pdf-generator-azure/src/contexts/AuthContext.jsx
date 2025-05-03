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

        if (data.isLoggedIn) {
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
        throw new Error(data.message || "Login failed")
      }

      setUser({
        userId: data.userId,
        clientId: data.clientId,
        clientName: data.clientName,
        email: data.email,
      })

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })

      setUser(null)
      router.push("/")

      return { success: true }
    } catch (error) {
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
