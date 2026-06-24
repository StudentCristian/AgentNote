"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface TranscriptField {
  id: string
  label: string
  placeholder: string
  value: string
}

interface SectionedTranscriptEditorProps {
  initialData?: Record<string, string>
  onSave?: (data: Record<string, string>) => void
  disabled?: boolean
}

/**
 * Schema de campos fijos esperados por la plantilla del doctor
 */
const TRANSCRIPT_SCHEMA: TranscriptField[] = [
  {
    id: "motivo_consulta",
    label: "Motivo de Consulta",
    placeholder: "¿Cuál es el motivo principal de la consulta?",
    value: "",
  },
  {
    id: "enfermedad_actual",
    label: "Enfermedad Actual",
    placeholder: "Descripción de la condición actual del paciente...",
    value: "",
  },
  {
    id: "estado_general",
    label: "Estado General",
    placeholder: "Observaciones sobre el estado general del paciente...",
    value: "",
  },
  {
    id: "diagnosticos",
    label: "Diagnósticos",
    placeholder: "Diagnósticos identificados...",
    value: "",
  },
  {
    id: "conducta",
    label: "Conducta / Plan de Tratamiento",
    placeholder: "Plan de tratamiento y recomendaciones...",
    value: "",
  },
  {
    id: "medicamentos",
    label: "Medicamentos",
    placeholder: "Medicamentos prescritos...",
    value: "",
  },
]

export function SectionedTranscriptEditor({
  initialData = {},
  onSave,
  disabled = false,
}: SectionedTranscriptEditorProps) {
  const [fields, setFields] = useState<TranscriptField[]>(() =>
    TRANSCRIPT_SCHEMA.map((field) => ({
      ...field,
      value: initialData[field.id] || "",
    }))
  )

  const handleFieldChange = (fieldId: string, value: string) => {
    setFields((prevFields) =>
      prevFields.map((field) =>
        field.id === fieldId ? { ...field, value } : field
      )
    )
  }

  const handleSave = () => {
    const data = fields.reduce(
      (acc, field) => {
        acc[field.id] = field.value
        return acc
      },
      {} as Record<string, string>
    )
    onSave?.(data)
  }

  const filledCount = useMemo(
    () => fields.filter((f) => f.value.trim()).length,
    [fields]
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Revisión de Transcripción
          </h3>
          <p className="text-sm text-muted-foreground">
            {filledCount}/{fields.length} campos completados
          </p>
        </div>
        <Button onClick={handleSave} disabled={disabled}>
          Guardar Cambios
        </Button>
      </div>

      <Separator />

      <div className="grid gap-4">
        {fields.map((field) => (
          <Card key={field.id} className="p-4">
            <label htmlFor={field.id} className="block text-sm font-semibold text-foreground mb-2">
              {field.label}
            </label>
            <textarea
              id={field.id}
              value={field.value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              disabled={disabled}
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
            />
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" disabled={disabled}>
          Descartar
        </Button>
        <Button onClick={handleSave} disabled={disabled}>
          Guardar Cambios
        </Button>
      </div>
    </div>
  )
}
