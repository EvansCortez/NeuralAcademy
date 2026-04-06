import { describe, expect, it, vi, beforeEach } from 'vitest'
import {
  getStatus,
  uploadPdf,
  ApiError,
  type BackendStatus,
  type UploadResult,
} from './api'

describe('API client', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('throws ApiError when status endpoint fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
      text: async () => 'Internal Server Error',
    } as unknown as Response)

    await expect(getStatus()).rejects.toBeInstanceOf(ApiError)
  })

  it('parses backend status correctly on success', async () => {
    const payload: BackendStatus = {
      name: 'NeuralAcademy',
      phase: '2',
      features: [],
      ready: true,
    }

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => payload,
    } as unknown as Response)

    const result = await getStatus()
    expect(result).toEqual(payload)
  })

  it('uploads a PDF and parses result', async () => {
    const mockResult: UploadResult = {
      filename: 'test.pdf',
      title: 'Test Document',
      author: 'Author',
      page_count: 1,
      text_preview: 'Preview',
      full_text: 'Full text',
      page_texts: ['Page 1'],
      images: [],
    }

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResult,
    } as unknown as Response)

    const file = new File(['dummy'], 'test.pdf', { type: 'application/pdf' })
    const result = await uploadPdf(file)
    expect(result.filename).toBe('test.pdf')
    expect(result.page_count).toBe(1)
  })
})
