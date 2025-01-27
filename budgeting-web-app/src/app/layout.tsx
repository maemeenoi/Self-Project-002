import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import NavigationWrapper from '@/components/NavigationWrapper';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Budgeting Web App",
  description: "A collaborative budgeting web application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <AuthProvider>
          <NavigationWrapper />
          <main className="min-h-full">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
