/**
 * Utilities para procesamiento de datos DOCX
 * Incluye normalización a mayúsculas, limpieza de Markdown, y mapping de campos
 */

/**
 * Elimina sintaxis Markdown básica de un string
 * - Elimina backticks, asteriscos, guiones bajos de énfasis
 * - Limpia enlaces [text](url) → text
 * - Elimina # de encabezados
 */
export function stripMarkdown(text: string): string {
  if (!text || typeof text !== 'string') {
    return text
  }

  return text
    // Eliminar enlaces [text](url)
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // Eliminar énfasis *text* o **text**
    .replace(/\*\*([^\*]+)\*\*/g, '$1')
    .replace(/\*([^\*]+)\*/g, '$1')
    // Eliminar énfasis _text_ o __text__
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Eliminar backticks `code`
    .replace(/`([^`]+)`/g, '$1')
    // Eliminar encabezados #, ##, etc.
    .replace(/^#+\s+/gm, '')
    // Eliminar saltos de línea múltiples
    .replace(/\n\n+/g, '\n')
    .trim()
}

/**
 * Convierte un string a mayúsculas, preservando acentos y diacríticos
 * Limpia Markdown antes de convertir
 */
export function normalizeToUpperCase(text: string): string {
  if (!text || typeof text !== 'string') {
    return text
  }

  // Primero eliminar Markdown
  const cleaned = stripMarkdown(text)
  // Luego convertir a mayúsculas (toUpperCase preserva acentos en JS)
  return cleaned.toUpperCase()
}

/**
 * Mapea campos de transcripción a los campos esperados en el DOCX
 * Normaliza valores a mayúsculas antes de retornar
 * 
 * Nota: diagnosticos sin acento (limitación BAML)
 */
export function mapTranscriptionToDocxFields(transcription: {
  motivo_consulta?: string
  enfermedad_actual?: string
  estado_general?: string
  diagnosticos?: string
  conducta?: string
  medicamentos?: string
  [key: string]: string | undefined
}): Record<string, string> {
  const fields: Record<string, string> = {}

  // Mapeo de campos con normalización
  const fieldMap = {
    motivo_consulta: 'motivo_consulta',
    enfermedad_actual: 'enfermedad_actual',
    estado_general: 'estado_general',
    diagnosticos: 'diagnosticos',
    conducta: 'conducta',
    medicamentos: 'medicamentos',
  }

  for (const [key, docxKey] of Object.entries(fieldMap)) {
    const value = transcription[key]
    if (value) {
      fields[docxKey] = normalizeToUpperCase(value)
    } else {
      fields[docxKey] = ''
    }
  }

  return fields
}

/**
 * Datos de paciente que se pueden normalizar a mayúsculas
 * Campo: valor
 */
export function normalizePatientData(
  data: Record<string, string | number | boolean | null | undefined>
): Record<string, string> {
  const normalized: Record<string, string> = {}

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      normalized[key] = normalizeToUpperCase(value)
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      normalized[key] = String(value)
    } else {
      normalized[key] = value || ''
    }
  }

  return normalized
}
