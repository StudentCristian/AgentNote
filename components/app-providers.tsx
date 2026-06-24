"use client"

import type { ReactNode } from "react"
import { EdgeStoreProvider } from "@/lib/edgestore"
import { ThemeProvider } from "@/lib/providers/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <EdgeStoreProvider>{children}</EdgeStoreProvider>
      </TooltipProvider>
    </ThemeProvider>
  )
}