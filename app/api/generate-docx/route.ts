export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import Docxtemplater from "docxtemplater"
import PizZip from "pizzip"
import { mapTranscriptionToDocxFields, normalizePatientData } from "@/lib/docx"

interface GenerateDocxBody {
  templateUrl?: string
  transcriptionData?: Record<string, string>
  patientData?: Record<string, string | number | boolean | null | undefined>
}

function buildDownloadFileName(patientName?: string) {
  const normalizedPatient = (patientName || "paciente")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-áéíóúñü]/gi, "")

  return `consulta-${normalizedPatient || "paciente"}.docx`
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateDocxBody
    const { templateUrl, transcriptionData, patientData } = body

    if (!templateUrl) {
      return NextResponse.json(
        { error: "Falta templateUrl para generar el documento" },
        { status: 400 }
      )
    }

    if (!transcriptionData || Object.keys(transcriptionData).length === 0) {
      return NextResponse.json(
        { error: "Faltan datos de transcripción para generar el documento" },
        { status: 400 }
      )
    }

    const templateResponse = await fetch(templateUrl)

    if (!templateResponse.ok) {
      return NextResponse.json(
        { error: "No se pudo descargar la plantilla DOCX seleccionada" },
        { status: 400 }
      )
    }

    const templateBuffer = await templateResponse.arrayBuffer()
    const zip = new PizZip(Buffer.from(templateBuffer))
    const document = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    })

    const normalizedFields = {
      ...normalizePatientData(patientData ?? {}),
      ...mapTranscriptionToDocxFields(transcriptionData),
    }

    document.render(normalizedFields)

    const generatedBuffer = document.getZip().generate({ type: "nodebuffer" })
    const fileName = buildDownloadFileName(
      typeof patientData?.nombre === "string" ? patientData.nombre : undefined
    )

    return new NextResponse(generatedBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("[generate-docx] Error generating document:", error)

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Error desconocido al generar el documento"

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "Use POST to generate a DOCX document" },
    { status: 405 }
  )
}