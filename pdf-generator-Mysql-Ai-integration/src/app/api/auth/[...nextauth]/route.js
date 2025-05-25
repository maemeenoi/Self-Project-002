// app/api/auth/[...nextauth]/route.js - AZURE SQL VERSION
import NextAuth from "next-auth/next"
import GoogleProvider from "next-auth/providers/google"
import { query } from "@/lib/db" // Updated to use Azure SQL

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (account.provider === "google") {
          console.log("Google sign-in for user:", profile.email)

          // Check if this Google account is already linked to a client
          // AZURE SQL: No changes needed for SELECT with parameters
          const existingClients = await query(
            "SELECT * FROM Client WHERE GoogleId = ? OR ContactEmail = ?",
            [profile.sub, profile.email]
          )

          if (existingClients.length > 0) {
            // Update existing user
            const client = existingClients[0]

            // Update the Google ID if not set
            // AZURE SQL: Changed NOW() to GETDATE()
            if (!client.GoogleId) {
              await query(
                "UPDATE Client SET GoogleId = ?, AuthMethod = 'google', LastLoginDate = GETDATE() WHERE ClientID = ?",
                [profile.sub, client.ClientID]
              )
            } else {
              // Just update login date
              // AZURE SQL: Changed NOW() to GETDATE()
              await query(
                "UPDATE Client SET LastLoginDate = GETDATE() WHERE ClientID = ?",
                [client.ClientID]
              )
            }
          } else {
            // Create new user
            // AZURE SQL: Changed NOW() to GETDATE()
            await query(
              `INSERT INTO Client 
               (ClientName, ContactEmail, GoogleId, AuthMethod, LastLoginDate, OrganizationName) 
               VALUES (?, ?, ?, 'google', GETDATE(), ?)`,
              [
                profile.name || profile.email.split("@")[0],
                profile.email,
                profile.sub,
                profile.email.split("@")[1], // Use domain as organization name
              ]
            )
          }
        }
        return true
      } catch (error) {
        console.error("Error in signIn callback:", error)
        return true // Still allow sign in even if db operation fails
      }
    },

    async session({ session, token }) {
      // Add client info to session
      if (session?.user?.email) {
        try {
          const clients = await query(
            "SELECT ClientID, ClientName, OrganizationName FROM Client WHERE ContactEmail = ?",
            [session.user.email]
          )

          if (clients.length > 0) {
            const client = clients[0]
            session.user.clientId = client.ClientID
            session.user.clientName = client.ClientName
            session.user.organizationName = client.OrganizationName
          }
        } catch (error) {
          console.error("Error retrieving client data for session:", error)
        }
      }
      return session
    },
  },

  pages: {
    signIn: "/questionnaire",
    error: "/questionnaire",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
