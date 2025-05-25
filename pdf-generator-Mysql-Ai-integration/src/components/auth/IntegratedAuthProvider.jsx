// components/IntegratedAuthProvider.jsx
"use client"

import { SessionProvider, useSession } from "next-auth/react"
import { useEffect } from "react"
import {
  AuthProvider as CustomAuthProvider,
  useAuth,
} from "@/providers/auth/AuthContext"

// Synchronize Next-Auth session with your custom AuthContext
function SessionSync({ children }) {
  const { data: session, status } = useSession()
  const { user, setUser } = useAuth()

  useEffect(() => {
    // When Next-Auth session changes, update your custom AuthContext
    if (status === "authenticated" && session) {
      // If authenticated with Next-Auth, sync the user to your custom context
      if (!user || user.email !== session.user.email) {
        setUser({
          userId: session.user.clientId,
          clientId: session.user.clientId,
          clientName: session.user.clientName || session.user.name,
          email: session.user.email,
          isAuthenticated: true,
        })
      }
    }
  }, [session, status, user, setUser])

  return children
}

// Combined provider that wraps both auth systems
export function IntegratedAuthProvider({ children }) {
  return (
    <SessionProvider>
      <CustomAuthProvider>
        <SessionSync>{children}</SessionSync>
      </CustomAuthProvider>
    </SessionProvider>
  )
}
