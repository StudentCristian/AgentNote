// Structured transcription output class
class TranscriptionOutput {
  motivo_consulta string @description("Reason for visit / Chief complaint")
  enfermedad_actual string @description("Current illness or condition")
  estado_general string @description("Patient's general state/appearance")
  diagnosticos string @description("Identified diagnoses")
  conducta string @description("Treatment plan and recommendations")
  medicamentos string @description("Prescribed medications")
}

// Main transcription function - structures audio into medical record fields
function TranscribeAudio(audio_text: string) -> TranscriptionOutput {
  client GoogleGeminiClient
  prompt #"
    The transcribed audio corresponds to a physician dictating a clinical summary after evaluating the patient.

    Preserve all clinically relevant findings exactly as stated.

    Do not assume that missing information is irrelevant.

    If a finding cannot be clearly assigned to a field, place it in the most appropriate field rather than omitting it.

    Prioritize completeness over summarization.
    
    {{ ctx.output_format }}
    
    ## Transcribed Audio:
    
    {{ audio_text }}
  "#
}
