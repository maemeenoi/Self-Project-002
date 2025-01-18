import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { auth } from "@/firebaseConfig"
import { signInWithEmailAndPassword } from "firebase/auth"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          )

          const user = userCredential.user
          const idToken = await user.getIdToken()

          return {
            id: user.uid,
            email: user.email,
            name: user.email.split("@")[0],
            firebaseToken: idToken,
          }
        } catch (error) {
          console.error("Authentication error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      console.log("JWT Callback - Trigger:", trigger)
      console.log("JWT Callback - Token exists:", !!token)
      console.log("JWT Callback - User exists:", !!user)

      if (user) {
        // Initial sign in
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.firebaseToken = user.firebaseToken
      }

      return token
    },
    async session({ session, token }) {
      console.log("Session Callback - Creating session")
      console.log("Session Callback - Token exists:", !!token)

      if (token && session.user) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.name = token.name
        session.user.firebaseToken = token.firebaseToken
      }

      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET || "your-default-secret",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
