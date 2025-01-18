"use client"

import { SessionProvider as Provider } from "next-auth/react"
import { useEffect } from "react"

export default function SessionProvider({ children, session }) {
  useEffect(() => {
    console.log("SessionProvider - Initial session:", session)
  }, [session])

  return (
    <Provider
      session={session}
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true}
    >
      {children}
    </Provider>
  )
}
