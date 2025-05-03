import { useState, useEffect, createContext, useContext } from "react"
import { useRouter } from "next/navigation"
import {
  isAuthenticated,
  login as authLogin,
  register as authRegister,
  logout as authLogout,
} from "../utils/auth"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      try {
        if (isAuthenticated()) {
          // You can add an API call here to get user data
          setUser({ isAuthenticated: true })
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const data = await authLogin(email, password)
      setUser({ isAuthenticated: true, ...data.user })
      return data
    } catch (error) {
      throw error
    }
  }

  const register = async (name, email, password) => {
    try {
      const data = await authRegister(name, email, password)
      setUser({ isAuthenticated: true, ...data.user })
      return data
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    authLogout()
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
