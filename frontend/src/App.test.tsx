import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import App from './App'

describe('App shell', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input)

        if (url.includes('/status')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              name: 'NeuralAcademy',
              phase: '2',
              features: [],
              ready: false,
            }),
          } as Response
        }

        if (url.includes('/upload')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              filename: 'systems.pdf',
              title: 'Distributed Systems',
              author: 'Evans',
              page_count: 2,
              text_preview: 'Consensus overview',
              full_text: 'Consensus overview and fault tolerance notes.',
              page_texts: ['Consensus overview', 'Fault tolerance'],
              images: [],
            }),
          } as Response
        }

        if (url.includes('/generate-study-sheet')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              main_idea: 'Understand consensus and fault tolerance.',
              sections: [
                {
                  title: 'Consensus',
                  summary: 'Nodes agree on a shared decision.',
                  difficulty: 'Medium',
                },
              ],
              questions: ['Why is consensus important?'],
              tips: ['Compare the happy path to failure cases.'],
              core_terms: ['Consensus', 'Fault'],
              flashcards: [],
              phase: '2-ai-powered',
            }),
          } as Response
        }

        throw new Error(`Unhandled fetch for ${url}`)
      }) as typeof fetch,
    )
  })

  it('renders the NeuralAcademy header', () => {
    render(<App />)
    expect(screen.getByText(/NeuralAcademy/i)).toBeInTheDocument()
  })

  it('shows placeholder before any uploads', () => {
    render(<App />)
    expect(
      screen.getByText(/No uploads yet this session/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Upload a PDF on the left/i),
    ).toBeInTheDocument()
  })

  it('generates and renders a study sheet after upload', async () => {
    render(<App />)

    const file = new File(['pdf'], 'systems.pdf', {
      type: 'application/pdf',
    })

    const input = screen.getByLabelText(/PDF file/i) as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }))

    await screen.findByText(/Distributed Systems/i)

    fireEvent.click(
      screen.getByRole('button', { name: /Generate Study Sheet/i }),
    )

    await screen.findByText(/Understand consensus and fault tolerance/i)
    expect(screen.getByText(/Why is consensus important/i)).toBeInTheDocument()
    expect(screen.getByText(/Core terms/i)).toBeInTheDocument()
    expect(screen.getByText(/^Fault$/i)).toBeInTheDocument()
  })
})

describe('Backend status', () => {
  it('handles backend status fetch failure gracefully', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValueOnce(new Error('offline')) as typeof fetch,
    )

    render(<App />)

    await waitFor(() =>
      expect(
        screen.getByText(/Backend is not reachable yet/i),
      ).toBeInTheDocument(),
    )
  })
})
