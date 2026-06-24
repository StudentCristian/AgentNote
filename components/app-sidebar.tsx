"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  ClipboardListIcon,
  FileTextIcon,
  LifeBuoyIcon,
  SendIcon,
  SettingsIcon,
  StethoscopeIcon,
  GalleryVerticalEndIcon,
} from "lucide-react"

const data = {
  teams: [
    {
      name: "AgentNotes",
      logo: GalleryVerticalEndIcon,
      plan: "Flujo clínico local",
    },
  ],
  navMain: [
    {
      title: "Nueva consulta",
      url: "/nueva-consulta",
      icon: React.createElement(StethoscopeIcon),
      items: [
        {
          title: "Grabación y transcripción",
          url: "/nueva-consulta",
        },
      ],
    },
    {
      title: "Consultas",
      url: "/consultas",
      icon: React.createElement(ClipboardListIcon),
      items: [
        {
          title: "Historial clínico",
          url: "/consultas",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Plantillas",
      url: "/plantillas",
      icon: React.createElement(FileTextIcon),
    },
    {
      name: "Configuración",
      url: "/configuracion",
      icon: React.createElement(SettingsIcon),
    },
  ],
  navSecondary: [
    {
      title: "Ayuda",
      url: "/configuracion",
      icon: React.createElement(LifeBuoyIcon),
    },
    {
      title: "Enviar comentarios",
      url: "/configuracion",
      icon: React.createElement(SendIcon),
    },
  ],
  user: {
    name: "Dr. Efraín Román",
    email: "MVP local",
    avatar: "",
  },
} as const

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const navMain = data.navMain.map((item) => ({
    ...item,
    isActive: pathname === item.url || pathname.startsWith(`${item.url}/`),
  }))

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} label="Consultorio" />
        <NavProjects projects={data.projects} label="Recursos" />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
