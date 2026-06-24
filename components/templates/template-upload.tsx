"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useEdgeStore } from "@/lib/edgestore"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card } from "@/components/ui/card"
import { FileUploader } from "@/components/upload/multi-file"
import {
  FileCheckIcon,
  FileTextIcon,
  Loader2Icon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react"
import {
  type CompletedFileState,
  UploaderProvider,
} from "@/components/upload/uploader-provider"

interface TemplateUploadProps {
  onTemplateSelected?: (template: UploadedTemplate | null) => void
  disabled?: boolean
}

export interface UploadedTemplate {
  id: string
  name: string
  size: number
  url: string
  uploadedAt: string
}
const DOCX_ACCEPT = {
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
}

export function TemplateUpload({ onTemplateSelected, disabled = false }: TemplateUploadProps) {
  const { edgestore } = useEdgeStore()
  const [templates, setTemplates] = useState<UploadedTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true)
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null)
  const onTemplateSelectedRef = useRef(onTemplateSelected)

  useEffect(() => {
    onTemplateSelectedRef.current = onTemplateSelected
  }, [onTemplateSelected])

  const loadTemplates = useCallback(async () => {
    try {
      setIsLoadingTemplates(true)

      const response = await fetch("/api/templates", {
        method: "GET",
        cache: "no-store",
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error || "No se pudieron cargar las plantillas")
      }

      const body = (await response.json()) as { templates: UploadedTemplate[] }
      setTemplates(body.templates)

      setSelectedTemplateId((currentSelection) => {
        return currentSelection && body.templates.some((template) => template.id === currentSelection)
          ? currentSelection
          : body.templates[0]?.id ?? null
      })

      setError(null)
    } catch (fetchError) {
      const message =
        fetchError instanceof Error
          ? fetchError.message
          : "No se pudieron cargar las plantillas"
      setError(message)
    } finally {
      setIsLoadingTemplates(false)
    }
  }, [])

  useEffect(() => {
    void loadTemplates()
  }, [loadTemplates])

  useEffect(() => {
    const selectedTemplate =
      templates.find((template) => template.id === selectedTemplateId) ?? null

    onTemplateSelectedRef.current?.(selectedTemplate)
  }, [selectedTemplateId, templates])

  const handleTemplateSelection = useCallback(
    (template: UploadedTemplate | null) => {
      setSelectedTemplateId(template?.id ?? null)
      onTemplateSelectedRef.current?.(template)
    },
    []
  )

  const handleUploadCompleted = useCallback(
    (file: CompletedFileState) => {
      const nextTemplate: UploadedTemplate = {
        id: file.url,
        name: file.file.name,
        size: file.file.size,
        url: file.url,
        uploadedAt: new Date().toISOString(),
      }

      handleTemplateSelection(nextTemplate)
      setError(null)
      void loadTemplates()
    },
    [handleTemplateSelection, loadTemplates]
  )

  const handleDeleteTemplate = useCallback(
    async (template: UploadedTemplate) => {
      try {
        setDeletingTemplateId(template.id)
        await edgestore.templates.delete({
          url: template.url,
        })

        setTemplates((currentTemplates) => {
          const remainingTemplates = currentTemplates.filter(
            (currentTemplate) => currentTemplate.id !== template.id
          )

          setSelectedTemplateId((currentSelection) => {
            if (currentSelection !== template.id) {
              return currentSelection
            }

            return remainingTemplates[0]?.id ?? null
          })

          return remainingTemplates
        })

        setError(null)
      } catch (deleteError) {
        const message =
          deleteError instanceof Error
            ? deleteError.message
            : "No se pudo eliminar la plantilla"
        setError(message)
      } finally {
        setDeletingTemplateId(null)
      }
    },
    [edgestore]
  )

  return (
    <div className="flex flex-col gap-4">
      <UploaderProvider
        uploadFn={async ({ file, onProgressChange }) => {
          const response = await edgestore.templates.upload({
            file,
            input: {
              fileName: file.name,
            },
            onProgressChange: (progress) => {
              const nextProgress = progress <= 1 ? progress * 100 : progress
              void onProgressChange(nextProgress)
            },
          })

          return { url: response.url }
        }}
        onUploadCompleted={handleUploadCompleted}
      >
        {({ fileStates, uploadFiles, resetFiles, isUploading }) => {
          const pendingFiles = fileStates.filter((file) => file.status === "PENDING")

          return (
            <Card className="p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Biblioteca de plantillas</p>
                  <p className="text-xs text-muted-foreground">
                    Sube una o varias plantillas DOCX, revisa el progreso y deja una seleccionada para esta consulta.
                  </p>
                </div>
                <div className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  {isLoadingTemplates ? "Cargando..." : `${templates.length} disponibles`}
                </div>
              </div>

              <FileUploader
                maxFiles={5}
                maxSize={10 * 1024 * 1024}
                accept={DOCX_ACCEPT}
                disabled={disabled || isUploading}
                dropzoneClassName="min-h-40 border-muted-foreground/30"
              />

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  onClick={() => void uploadFiles()}
                  disabled={pendingFiles.length === 0 || disabled || isUploading}
                  className="gap-2"
                >
                  {isUploading ? <Loader2Icon className="animate-spin" /> : <UploadIcon />}
                  {isUploading ? "Subiendo..." : "Subir plantillas"}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetFiles}
                  disabled={fileStates.length === 0 || isUploading}
                >
                  Limpiar cola
                </Button>
                <Button
                  variant="outline"
                  onClick={() => void loadTemplates()}
                  disabled={isLoadingTemplates || isUploading}
                >
                  Actualizar biblioteca
                </Button>
              </div>
            </Card>
          )
        }}
      </UploaderProvider>

      {isLoadingTemplates ? (
        <Card className="p-4 text-sm text-muted-foreground">
          Cargando plantillas disponibles desde EdgeStore...
        </Card>
      ) : null}

      {templates.length > 0 ? (
        <div className="flex flex-col gap-3">
          {templates.map((template) => {
            const isSelected = template.id === selectedTemplateId

            return (
              <div
                key={template.id}
                className={`rounded-xl border p-4 transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handleTemplateSelection(template)}
                    className="flex min-w-0 flex-1 items-start gap-3 text-left"
                  >
                    <div className="rounded-lg bg-muted p-2 text-muted-foreground">
                      <FileTextIcon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{template.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(template.size / 1024 / 1024).toFixed(2)} MB • {new Date(template.uploadedAt).toLocaleString("es-ES")}
                      </p>
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    {isSelected ? <FileCheckIcon className="text-primary" /> : null}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          disabled={deletingTemplateId === template.id}
                          onClick={(event) => event.stopPropagation()}
                          aria-label={`Eliminar ${template.name}`}
                        >
                          {deletingTemplateId === template.id ? (
                            <Loader2Icon className="size-4 animate-spin" />
                          ) : (
                            <Trash2Icon className="size-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Eliminar plantilla</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción borrará la plantilla de la biblioteca y también de EdgeStore. No se podrá recuperar.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => void handleDeleteTemplate(template)}
                          >
                            Eliminar plantilla
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}

      {error && (
        <Card className="border-red-200 bg-red-50 p-4 dark:bg-red-950/20 dark:border-red-900">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </Card>
      )}
    </div>
  )
}
