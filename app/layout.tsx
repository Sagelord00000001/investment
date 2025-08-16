import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/components/auth/auth-provider'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "InvestPro - Professional Investment Platform",
  description: "Professional investment platform with institutional-grade security, real-time analytics, and advanced portfolio management tools.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
