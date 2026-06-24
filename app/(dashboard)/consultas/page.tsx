export default function ConsultasPage() {
  return (
    <div className="h-full w-full p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-4xl font-bold text-foreground">Consultas</h1>
        <p className="mb-8 text-muted-foreground">
          Historial de consultas clínicas capturadas.
        </p>

        <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Sin consultas registradas aún.
          </p>
        </div>
      </div>
    </div>
  )
}
