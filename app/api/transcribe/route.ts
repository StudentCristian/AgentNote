export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { 
  validateBAMLEnvironment, 
  transcribeAudioWithBAML,
  type TranscriptionOutput 
} from '@/lib/bamlClient'

/**
 * POST /api/transcribe
 * 
 * Transcribes audio and structures the output using BAML + Google Gemini.
 * Accepts audio transcription text and returns structured medical data.
 * 
 * Request body:
 * - audio_text: string - The transcribed audio text from the patient consultation
 * 
 * Response:
 * - TranscriptionOutput: Structured medical fields
 */
export async function POST(request: NextRequest) {
  try {
    // Validate BAML environment
    validateBAMLEnvironment()

    // Get the audio text from the request
    const formData = await request.formData()
    const rawAudioText = formData.get('audio_text')
    const audioText = typeof rawAudioText === 'string' ? rawAudioText.trim() : null

    if (!audioText) {
      return NextResponse.json(
        { error: 'Missing audio_text in request body' },
        { status: 400 }
      )
    }

    if (audioText.includes('[Audio transcription would go here via speech-to-text service]')) {
      return NextResponse.json(
        { error: 'Audio transcription placeholder received. The client must send real transcribed text before calling BAML.' },
        { status: 400 }
      )
    }

    // Call BAML to structure the audio transcription
    console.log('[Transcribe] Processing audio with BAML/Gemini...')
    const transcriptionResult = await transcribeAudioWithBAML(audioText)

    console.log('[Transcribe] Structured output:', transcriptionResult)

    return NextResponse.json(transcriptionResult)
  } catch (error) {
    console.error('[Transcribe] Error in transcription endpoint:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred during transcription'

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * GET /api/transcribe (not implemented)
 * Reserved for future streaming endpoint
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { message: 'Use POST method with audio_text to transcribe' },
    { status: 405 }
  )
}
