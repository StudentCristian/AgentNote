"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle, Loader2, Download } from "lucide-react"
import { AudioBottomBar } from "@/components/audio/audio-bottom-bar"
import { SectionedTranscriptEditor } from "@/components/transcript/sectioned-transcript-editor"
import type { TranscriptionOutput } from "@/baml_client/types"
import {
  type UploadedTemplate,
  TemplateUpload,
} from "@/components/templates/template-upload"

const toTranscriptionRecord = (
  data: TranscriptionOutput
): Record<string, string> => ({
  ...data,
})

export function NuevaConsultaClient() {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<UploadedTemplate | null>(null)
  const [templateUrl, setTemplateUrl] = useState<string | null>(null)
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null)
  const [transcriptionData, setTranscriptionData] = useState<Record<string, string>>({})
  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false)
  const [docxError, setDocxError] = useState<string | null>(null)
  const [docxSuccess, setDocxSuccess] = useState(false)

  const handleGenerateDocx = async () => {
    if (!templateUrl) {
      setDocxError("Por favor carga una plantilla DOCX antes de generar el documento")
      return
    }

    if (Object.keys(transcriptionData).length === 0) {
      setDocxError("Por favor completa la transcripción antes de generar el documento")
      return
    }

    setIsGeneratingDocx(true)
    setDocxError(null)
    setDocxSuccess(false)

    try {
      const response = await fetch("/api/generate-docx", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateUrl,
          transcriptionData,
          patientData: {
            nombre: selectedPatient || "Paciente",
            fecha: new Date().toLocaleDateString("es-ES"),
            hora: new Date().toLocaleTimeString("es-ES"),
          },
        }),
      })

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || ""

        if (contentType.includes("application/json")) {
          const error = (await response.json()) as { error?: string }
          throw new Error(error.error || "Error al generar documento")
        }

        const errorText = await response.text()
        throw new Error(errorText || "Error al generar documento")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `consulta_${new Date().getTime()}.docx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setDocxSuccess(true)
      setTimeout(() => setDocxSuccess(false), 3000)
    } catch (error) {
      setDocxError(
        error instanceof Error ? error.message : "Error desconocido al generar documento"
      )
    } finally {
      setIsGeneratingDocx(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col bg-background">
      <div className="flex-1 overflow-auto px-4 py-8 pb-40 md:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Nueva Consulta</h1>
            <p className="mt-2 text-muted-foreground">
              Crea una nueva consulta clínica: selecciona paciente, plantilla, graba audio y genera el documento Word.
            </p>
          </div>

          <Separator />

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground">1. Paciente</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Selecciona un paciente existente o crea uno nuevo.
            </p>
            <div className="mt-4 rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                {selectedPatient ? `Paciente: ${selectedPatient}` : "No hay paciente seleccionado"}
              </p>
              <Input
                placeholder="Nombre del paciente"
                value={selectedPatient || ""}
                onChange={(e) => setSelectedPatient(e.target.value || null)}
                className="mt-2"
              />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground">2. Plantilla DOCX</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Carga una plantilla Word con placeholders para los campos de consulta.
            </p>
            <div className="mt-4">
              <TemplateUpload
                onTemplateSelected={(template) => {
                  setSelectedTemplate(template)
                  setTemplateUrl(template?.url ?? null)
                }}
              />
            </div>
            <div className="mt-4 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              {selectedTemplate ? (
                <span>Plantilla seleccionada: {selectedTemplate.name}</span>
              ) : (
                <span>Selecciona una plantilla ya cargada o sube una nueva antes de transcribir.</span>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground">3. Grabación de Audio</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Usa el panel inferior para grabar audio de la consulta. El audio es temporal y se pierde si recargas la página.
            </p>
            <div className="mt-4 rounded-lg bg-muted p-4">
              {recordedAudio ? (
                <p className="text-sm text-muted-foreground">
                  ✓ Audio grabado ({(recordedAudio.size / 1024).toFixed(2)} KB)
                </p>
              ) : isTranscribing ? (
                <p className="text-sm text-muted-foreground">
                  Transcribiendo el audio actual...
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Usa el botón de grabación inferior
                </p>
              )}
            </div>
          </Card>

          {transcriptionError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{transcriptionError}</p>
            </div>
          )}

          {Object.keys(transcriptionData).length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground">4. Transcripción</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Revisa y edita los campos generados por la IA. Los datos se normalizarán a mayúsculas en el documento final.
              </p>
              <div className="mt-4">
                <SectionedTranscriptEditor
                  key={JSON.stringify(transcriptionData)}
                  initialData={transcriptionData}
                  onSave={setTranscriptionData}
                  disabled={false}
                />
              </div>
            </Card>
          )}

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground">5. Generar Documento</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Genera y descarga el documento Word final con todos los datos normalizados.
            </p>
            
            {docxError && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{docxError}</p>
              </div>
            )}
            
            {docxSuccess && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">Documento generado y descargado exitosamente</p>
              </div>
            )}

            <div className="mt-4">
              <Button
                onClick={handleGenerateDocx}
                disabled={!templateUrl || Object.keys(transcriptionData).length === 0 || isGeneratingDocx}
                size="lg"
                className="gap-2"
              >
                {isGeneratingDocx ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Generar y Descargar Documento
                  </>
                )}
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                Requeridos: plantilla DOCX cargada y transcripción completada
              </p>
            </div>
          </Card>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background px-4 py-4 md:left-[calc(var(--sidebar-width)+0.5rem)] md:right-2 md:rounded-tl-xl md:px-8">
        <div className="mx-auto max-w-5xl">
          <AudioBottomBar
            onAudioRecorded={setRecordedAudio}
            onTranscriptionStart={() => {
              setIsTranscribing(true)
              setTranscriptionError(null)
            }}
            onTranscriptionComplete={(data) => {
              setIsTranscribing(false)
              setTranscriptionData(toTranscriptionRecord(data))
            }}
            onTranscriptionError={(error) => {
              setIsTranscribing(false)
              setTranscriptionError(error.message)
            }}
            disabled={!selectedPatient?.trim() || !templateUrl}
          />
        </div>
      </div>
    </div>
  )
}