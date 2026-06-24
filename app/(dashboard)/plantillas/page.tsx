export default function PlantillasPage() {
  return (
    <div className="h-full w-full p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-4xl font-bold text-foreground">Plantillas</h1>
        <p className="mb-8 text-muted-foreground">
          Gestiona tus plantillas DOCX para la generación de documentos.
        </p>

        <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
          <p className="text-sm text-muted-foreground">
            No hay plantillas personalizadas. Se usará plantilla por defecto.
          </p>
        </div>
      </div>
    </div>
  )
}
