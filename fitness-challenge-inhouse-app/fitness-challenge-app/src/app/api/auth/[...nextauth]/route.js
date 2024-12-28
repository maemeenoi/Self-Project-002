import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { auth } from "@/firebaseConfig"
import { signInWithEmailAndPassword } from "firebase/auth"

export const authOptions = {
  pages: {
    signIn: "/auth/signin",
  },
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
          return {
            id: user.uid,
            email: user.email,
            name: user.email.split("@")[0],
          }
        } catch (error) {
          console.error("Authentication error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Always allow redirects to dashboard
      if (url.includes("/dashboard")) {
        return url
      }
      // Allow relative URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      // Allow URLs from the same origin
      if (url.startsWith(baseUrl)) {
        return url
      }
      // Default to dashboard
      return `${baseUrl}/dashboard`
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
