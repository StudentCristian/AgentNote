export default function ConfiguracionPage() {
  return (
    <div className="h-full w-full p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-4xl font-bold text-foreground">Configuración</h1>
        <p className="mb-8 text-muted-foreground">
          Preferencias y configuración de la aplicación.
        </p>

        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Tema</h2>
            <p className="text-sm text-muted-foreground">
              Selecciona el tema (claro/oscuro) en el menú superior.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Datos de Doctor</h2>
            <p className="text-sm text-muted-foreground">
              Información del doctor en construcción.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
