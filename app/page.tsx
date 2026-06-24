import DashboardLayout from "@/app/(dashboard)/layout"
import { NuevaConsultaClient } from "@/components/nueva-consulta/nueva-consulta-client"

export default function Home() {
  return (
    <DashboardLayout>
      <NuevaConsultaClient />
    </DashboardLayout>
  )
}
