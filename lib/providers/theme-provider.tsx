"use client"

import * as React from "react"

export type Theme = "light" | "dark" | "system"

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: "class"
  defaultTheme?: Theme
  enableSystem?: boolean
  enableColorScheme?: boolean
  disableTransitionOnChange?: boolean
  storageKey?: string
}

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: "light" | "dark"
  systemTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)

const MEDIA_QUERY = "(prefers-color-scheme: dark)"

function getSystemTheme() {
  if (typeof window === "undefined") {
    return "light" as const
  }

  return window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light"
}

function getStoredTheme(storageKey: string, defaultTheme: Theme) {
  if (typeof window === "undefined") {
    return defaultTheme
  }

  try {
    const storedTheme = window.localStorage.getItem(storageKey)

    if (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system") {
      return storedTheme
    }
  } catch {
    return defaultTheme
  }

  return defaultTheme
}

function disableTransitionsTemporarily() {
  const style = document.createElement("style")
  style.appendChild(
    document.createTextNode(
      "*,*::before,*::after{transition:none!important;-webkit-transition:none!important}"
    )
  )
  document.head.appendChild(style)

  return () => {
    window.getComputedStyle(document.body)
    window.setTimeout(() => {
      document.head.removeChild(style)
    }, 1)
  }
}

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  enableColorScheme = true,
  disableTransitionOnChange = false,
  storageKey = "theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(() =>
    getStoredTheme(storageKey, defaultTheme)
  )
  const [systemTheme, setSystemTheme] = React.useState<"light" | "dark">(() =>
    getSystemTheme()
  )

  const resolvedTheme =
    theme === "system" && enableSystem ? systemTheme : theme === "system" ? "light" : theme

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(MEDIA_QUERY)

    const updateSystemTheme = () => {
      setSystemTheme(mediaQuery.matches ? "dark" : "light")
    }

    updateSystemTheme()
    mediaQuery.addEventListener("change", updateSystemTheme)

    return () => {
      mediaQuery.removeEventListener("change", updateSystemTheme)
    }
  }, [])

  React.useEffect(() => {
    const root = document.documentElement
    const nextTheme = theme === "system" && enableSystem ? systemTheme : resolvedTheme
    const restoreTransitions = disableTransitionOnChange
      ? disableTransitionsTemporarily()
      : null

    if (attribute === "class") {
      root.classList.remove("light", "dark")
      root.classList.add(nextTheme)
    }

    if (enableColorScheme) {
      root.style.colorScheme = nextTheme
    }

    restoreTransitions?.()
  }, [attribute, disableTransitionOnChange, enableColorScheme, enableSystem, resolvedTheme, systemTheme, theme])

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      setThemeState(nextTheme)

      try {
        window.localStorage.setItem(storageKey, nextTheme)
        document.cookie = `theme=${nextTheme}; path=/; max-age=31536000; samesite=lax`
      } catch {}
    },
    [storageKey]
  )

  React.useEffect(() => {
    try {
      document.cookie = `theme=${theme}; path=/; max-age=31536000; samesite=lax`
    } catch {}
  }, [theme])

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      systemTheme,
      setTheme,
    }),
    [resolvedTheme, setTheme, systemTheme, theme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = React.useContext(ThemeContext)

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
