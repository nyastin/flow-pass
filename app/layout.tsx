import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TanStackQueryProvider } from "@/lib/tanstack-query"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "4DK Dance Concert Registration",
  description: "Register for the 4DK Fundraising Dance Concert",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <TanStackQueryProvider>{children}</TanStackQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
