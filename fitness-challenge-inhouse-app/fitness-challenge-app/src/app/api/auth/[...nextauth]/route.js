import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { auth } from '@/firebaseConfig';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          // Create a credential from Google's ID token
          const credential = GoogleAuthProvider.credential(account.id_token);
          
          // Sign in to Firebase with the credential
          await signInWithCredential(auth, credential);
          return true;
        } catch (error) {
          console.error('Firebase sign-in error:', error);
          return true; // Still return true to allow NextAuth sign in
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.uid = session.user.email;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (account?.id_token) {
        token.id_token = account.id_token;
      }
      return token;
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 