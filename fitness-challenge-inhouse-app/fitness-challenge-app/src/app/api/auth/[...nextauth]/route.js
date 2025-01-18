import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { auth } from "@/firebaseConfig"
import { signInWithEmailAndPassword } from "firebase/auth"

export const authOptions = {
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
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
    async jwt({ token, user, account }) {
      console.log("JWT Callback - Token:", token)
      console.log("JWT Callback - User:", user)

      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.firebaseToken = user.firebaseToken
        token.authenticated = true
      }
      return token
    },
    async session({ session, token }) {
      console.log("Session Callback - Session:", session)
      console.log("Session Callback - Token:", token)

      if (token && session.user) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.name = token.name
        session.user.firebaseToken = token.firebaseToken
        session.authenticated = token.authenticated
      }
      return session
    },
  },
  events: {
    async signIn(message) {
      console.log("SignIn Event:", message)
    },
    async signOut(message) {
      console.log("SignOut Event:", message)
    },
    async session(message) {
      console.log("Session Event:", message)
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
