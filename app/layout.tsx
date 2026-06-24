import type { Metadata } from "next"
import { cookies } from "next/headers"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { AppProviders } from "@/components/app-providers"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "AgentNotes",
  description: "Consultas clínicas por voz para Dr. Efraín Román",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const themeCookie = cookieStore.get("theme")?.value
  const initialThemeClass =
    themeCookie === "light" || themeCookie === "dark" ? themeCookie : undefined

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased${initialThemeClass ? ` ${initialThemeClass}` : ""}`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
