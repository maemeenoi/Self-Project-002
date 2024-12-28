import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { auth } from '@/firebaseConfig';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === 'google') {
        const credential = GoogleAuthProvider.credential(account.id_token);
        try {
          await signInWithCredential(auth, credential);
        } catch (error) {
          console.error('Firebase sign-in error:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      session.user.uid = token.sub;
      return session;
    },
  },
});

export { handler as GET, handler as POST };