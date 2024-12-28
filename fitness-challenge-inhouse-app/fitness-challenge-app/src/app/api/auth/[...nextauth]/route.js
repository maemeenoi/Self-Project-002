import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { auth } from "@/firebaseConfig"
import { signInWithCredential, GoogleAuthProvider } from "firebase/auth"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const credential = GoogleAuthProvider.credential(account.id_token)
          await signInWithCredential(auth, credential)
          return true
        } catch (error) {
          console.error("Firebase sign-in error:", error)
          return false
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.uid = token.sub
        session.firebaseToken = token.id_token
      }
      return session
    },
    async jwt({ token, account }) {
      if (account?.id_token) {
        token.id_token = account.id_token
      }
      return token
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
