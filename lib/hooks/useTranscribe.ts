"use client"

import { useState, useCallback } from "react"
import type { TranscriptionOutput } from "@/baml_client/types"

interface UseTranscribeOptions {
  onSuccess?: (data: TranscriptionOutput) => void
  onError?: (error: Error) => void
}

async function getTranscriptionErrorMessage(response: Response) {
  try {
    const errorPayload = (await response.json()) as { error?: string }
    if (errorPayload.error) {
      return errorPayload.error
    }
  } catch {
    // Ignore invalid error payloads and keep the HTTP status message.
  }

  return `Transcription failed: ${response.statusText}`
}

export function useTranscribe(options?: UseTranscribeOptions) {
  const [data, setData] = useState<TranscriptionOutput | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const transcribe = useCallback(
    async (audioText: string) => {
      setIsLoading(true)
      setError(null)
      setData(null)

      try {
        const formData = new FormData()
        formData.append("audio_text", audioText)

        const response = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error(await getTranscriptionErrorMessage(response))
        }

        const result: TranscriptionOutput = await response.json()
        setData(result)
        options?.onSuccess?.(result)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        options?.onError?.(error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [options]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    transcribe,
    data,
    isLoading,
    error,
    reset,
  }
}
