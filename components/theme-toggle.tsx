"use client"

import { useTheme } from "@/lib/providers/theme-provider"
import { CheckIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const themes = [
  {
    label: "Claro",
    value: "light",
    icon: SunIcon,
  },
  {
    label: "Oscuro",
    value: "dark",
    icon: MoonIcon,
  },
  {
    label: "Sistema",
    value: "system",
    icon: MonitorIcon,
  },
] as const

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SunIcon data-icon="inline-start" />
          Tema
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {themes.map((item) => {
          const Icon = item.icon

          return (
            <DropdownMenuItem
              key={item.value}
              onClick={() => setTheme(item.value)}
              className="justify-between"
            >
              <span className="flex items-center gap-2">
                <Icon />
                {item.label}
              </span>
              {theme === item.value ? <CheckIcon /> : null}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}