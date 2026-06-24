"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  Stethoscope, 
  ClipboardList, 
  FileText, 
  Settings 
} from "lucide-react"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  description?: string
}

const navItems: NavItem[] = [
  {
    label: "Nueva consulta",
    href: "/nueva-consulta",
    icon: <Stethoscope className="h-5 w-5" />,
    description: "Crear una nueva consulta",
  },
  {
    label: "Consultas",
    href: "/consultas",
    icon: <ClipboardList className="h-5 w-5" />,
    description: "Historial de consultas",
  },
  {
    label: "Plantillas",
    href: "/plantillas",
    icon: <FileText className="h-5 w-5" />,
    description: "Gestionar plantillas DOCX",
  },
  {
    label: "Configuración",
    href: "/configuracion",
    icon: <Settings className="h-5 w-5" />,
    description: "Preferencias",
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 h-screen w-64 border-r border-border bg-background px-4 py-6 shadow-sm">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">AgentNotes</h1>
        <p className="text-sm text-muted-foreground">Consultas clínicas por voz</p>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              title={item.description}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-6 left-4 right-4 border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          v0.1.0 • MVP Local
        </p>
      </div>
    </aside>
  )
}
