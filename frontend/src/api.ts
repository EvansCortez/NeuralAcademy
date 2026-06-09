export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

export class ApiError extends Error {
  readonly status: number
  readonly endpoint: string

  constructor(endpoint: string, status: number, message?: string) {
    super(message ?? `Request to ${endpoint} failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.endpoint = endpoint
  }
}

export type BackendStatus = {
  name: string
  phase: string
  features: string[]
  ready: boolean
}

export type UploadImage = {
  page: number
  index: number
  width: number
  height: number
  base64: string
}

export type UploadResult = {
  filename: string
  title: string
  author: string
  page_count: number
  text_preview: string
  full_text: string
  page_texts: string[]
  images: UploadImage[]
}

export type StudySheetSection = {
  title: string
  summary: string
  difficulty: string
}

export type Flashcard = {
  term: string
  definition: string
}

export type StudySheet = {
  main_idea: string
  sections: StudySheetSection[]
  questions: string[]
  tips: string[]
  core_terms: string[]
  flashcards: Flashcard[]
  phase: string
}

export type CodingChallengeTestCase = {
  input: unknown
  output: unknown
}

export type CodingChallenge = {
  title: string
  task: string
  starter_code: string
  test_cases: CodingChallengeTestCase[]
}

export type CodeRunResult = {
  status: 'success' | 'error' | 'timeout'
  output: string
  error: string
  code_preview: string
}

export type CodeAnalysis = {
  analysis: string
  hints: string[]
  phase: string
}

export async function getStatus(): Promise<BackendStatus> {
  const res = await fetch(`${API_BASE_URL}/status`)
  if (!res.ok) {
    throw new ApiError('/status', res.status)
  }
  return (await res.json()) as BackendStatus
}

export async function uploadPdf(file: File): Promise<UploadResult> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const detail = await res.text()
    throw new ApiError(
      '/upload',
      res.status,
      detail || `Upload failed with status ${res.status}`,
    )
  }

  return (await res.json()) as UploadResult
}

export async function generateStudySheet(text: string): Promise<StudySheet> {
  const res = await fetch(`${API_BASE_URL}/generate-study-sheet`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  })

  if (!res.ok) {
    const detail = await res.text()
    throw new ApiError(
      '/generate-study-sheet',
      res.status,
      detail || `Study sheet generation failed with status ${res.status}`,
    )
  }

  return (await res.json()) as StudySheet
}

export async function generateCodingChallenge(
  text: string,
): Promise<CodingChallenge> {
  const res = await fetch(`${API_BASE_URL}/generate-coding-challenge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  })

  if (!res.ok) {
    const detail = await res.text()
    throw new ApiError(
      '/generate-coding-challenge',
      res.status,
      detail || `Coding challenge generation failed with status ${res.status}`,
    )
  }

  return (await res.json()) as CodingChallenge
}

export async function runCode(code: string): Promise<CodeRunResult> {
  const res = await fetch(`${API_BASE_URL}/run-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: code }),
  })

  if (!res.ok) {
    const detail = await res.text()
    throw new ApiError(
      '/run-code',
      res.status,
      detail || `Code execution failed with status ${res.status}`,
    )
  }

  return (await res.json()) as CodeRunResult
}

export async function analyzeCode(code: string): Promise<CodeAnalysis> {
  const res = await fetch(`${API_BASE_URL}/analyze-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: code }),
  })

  if (!res.ok) {
    const detail = await res.text()
    throw new ApiError(
      '/analyze-code',
      res.status,
      detail || `Code analysis failed with status ${res.status}`,
    )
  }

  return (await res.json()) as CodeAnalysis
}

