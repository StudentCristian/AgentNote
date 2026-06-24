/**
 * BAML Client Configuration
 * 
 * Imports and configures the BAML client generated from baml_src files.
 * Uses Google Gemini for transcription and structuring.
 */

import { b as bamlClient } from '../baml_client'

/**
 * Validate that required environment variables are set
 */
export function validateBAMLEnvironment() {
  const requiredVars = ['GOOGLE_AI_API_KEY']
  const missing = requiredVars.filter(key => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required BAML environment variables: ${missing.join(', ')}. ` +
      `Please set these in your .env.local file.`
    )
  }
}

/**
 * Type for transcription output from BAML
 * Note: diagnosticos is without accent (BAML limitation)
 */
export interface TranscriptionOutput {
  motivo_consulta: string
  enfermedad_actual: string
  estado_general: string
  diagnosticos: string
  conducta: string
  medicamentos: string
}

/**
 * Get the BAML client for making requests
 */
export function getBAMLClient() {
  validateBAMLEnvironment()
  return bamlClient
}

/**
 * Call the TranscribeAudio function from BAML
 */
export async function transcribeAudioWithBAML(audioText: string) {
  const client = getBAMLClient()
  return client.TranscribeAudio(audioText)
}
