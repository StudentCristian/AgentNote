// clients.baml

retry_policy MedicalTranscriptionRetry {
  max_retries 3
  strategy {
    type "exponential_backoff"
    delay_ms 500
    multiplier 2
    max_delay_ms 15000
  }
}

client<llm> GoogleGeminiClient {
  provider "google-ai"
  options {
    model "gemini-2.5-flash"
    api_key env.GOOGLE_AI_API_KEY
  }
  retry_policy MedicalTranscriptionRetry
}
