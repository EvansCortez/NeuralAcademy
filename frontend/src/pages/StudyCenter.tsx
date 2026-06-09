import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react'
import '../App.css'

import {
  getStatus,
  uploadPdf,
  generateStudySheet,
  type BackendStatus,
  type StudySheet,
  type UploadResult,
  ApiError,
} from '../api'

type HistoryItem = {
  id: string
  filename: string
  uploadedAt: string
  result: UploadResult
}

const HISTORY_STORAGE_KEY = 'neuralacademy.uploadHistory.v1'

export default function StudyCenter() {
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [activeUpload, setActiveUpload] = useState<UploadResult | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [lastUploadedAt, setLastUploadedAt] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [studySheets, setStudySheets] = useState<Record<string, StudySheet>>({})
  const [studySheetLoading, setStudySheetLoading] = useState(false)
  const [studySheetError, setStudySheetError] = useState<string | null>(null)

  useEffect(() => {
    void refreshStatus()
  }, [])

  useEffect(() => {
    const stored = window.localStorage.getItem(HISTORY_STORAGE_KEY)
    if (!stored) return

    try {
      const parsed = JSON.parse(stored) as HistoryItem[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        setHistory(parsed)
        setActiveUpload(parsed[0].result)
        setCurrentPage(1)
        setLastUploadedAt(parsed[0].uploadedAt)
      }
    } catch {
      // ignore corrupt storage
    }
  }, [])

  useEffect(() => {
    if (!history.length) {
      window.localStorage.removeItem(HISTORY_STORAGE_KEY)
      return
    }

    window.localStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify(history.slice(0, 5)),
    )
  }, [history])

  useEffect(() => {
    if (activeUpload) {
      setCurrentPage(1)
    }
  }, [activeUpload])

  const refreshStatus = async () => {
    try {
      const data = await getStatus()
      setBackendStatus(data)
      setStatusError(null)
    } catch (err) {
      setStatusError('Backend is not reachable yet.')
      console.error(err)
    }
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setSelectedFile(file ?? null)
  }

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setUploadError(null)

    if (!selectedFile) {
      setUploadError('Please choose a PDF file to upload.')
      return
    }

    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Only PDF files are supported right now.')
      return
    }

    try {
      setUploading(true)
      const data = await uploadPdf(selectedFile)
      setActiveUpload(data)
      const timestamp = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
      setLastUploadedAt(timestamp)

      const newItem: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        filename: data.filename,
        uploadedAt: timestamp,
        result: data,
      }

      setHistory((prev) => [newItem, ...prev].slice(0, 5))
    } catch (err: unknown) {
      console.error(err)
      if (err instanceof ApiError) {
        setUploadError(
          `Upload failed (${err.status}). Check that the FastAPI server is running and try again.`,
        )
      } else {
        setUploadError(
          'Upload failed. Check that the FastAPI server is running and try again.',
        )
      }
    } finally {
      setUploading(false)
    }
  }

  const handleSelectHistory = (item: HistoryItem) => {
    setActiveUpload(item.result)
    setLastUploadedAt(item.uploadedAt)
    setStudySheetError(null)
  }

  const activeStudySheet = activeUpload
    ? studySheets[activeUpload.filename]
    : null

  const handleGenerateStudySheet = async () => {
    if (!activeUpload) {
      setStudySheetError('Upload a PDF before generating a study sheet.')
      return
    }

    if (!activeUpload.full_text.trim()) {
      setStudySheetError(
        'This PDF did not produce enough text to build a study sheet.',
      )
      return
    }

    try {
      setStudySheetLoading(true)
      setStudySheetError(null)
      const data = await generateStudySheet(activeUpload.full_text)
      setStudySheets((prev) => ({
        ...prev,
        [activeUpload.filename]: data,
      }))
    } catch (err: unknown) {
      console.error(err)
      if (err instanceof ApiError) {
        setStudySheetError(
          `Study sheet generation failed (${err.status}). Try again once the backend is ready.`,
        )
      } else {
        setStudySheetError(
          'Study sheet generation failed. Check the backend and try again.',
        )
      }
    } finally {
      setStudySheetLoading(false)
    }
  }

  const canGoPrev = activeUpload && currentPage > 1
  const canGoNext =
    activeUpload && currentPage < (activeUpload.page_count || 0)

  const goPrevPage = () => {
    if (canGoPrev) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  const goNextPage = () => {
    if (canGoNext) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const currentPageText =
    activeUpload && activeUpload.page_texts?.[currentPage - 1]

  return (
    <div className="study-center-page">
      <div className="page-heading">
        <h1>Study Center</h1>
        <p>Upload PDFs, preview extracted text, and generate AI study sheets.</p>
        <div className="app-status inline-status">
          <span>
            <span
              className={'status-dot ' + (backendStatus?.ready ? '' : 'offline')}
            />
            {backendStatus?.ready
              ? `${backendStatus.name} · Phase ${backendStatus.phase}`
              : 'Waiting for backend...'}
          </span>
        </div>
      </div>

      <main className="app-main">
        <section className="pane">
          <div className="pane-header">
            <div>
              <div className="pane-title">Upload & History</div>
              <p className="pane-subtitle">
                Drop in a lecture PDF to start exploring its contents.
              </p>
            </div>
            <span className="pill">input</span>
          </div>
          <div className="pane-body">
            <form onSubmit={handleUpload}>
              <div className="form-field">
                <label className="form-label" htmlFor="pdf">
                  PDF file
                </label>
                <input
                  id="pdf"
                  name="pdf"
                  type="file"
                  accept="application/pdf"
                  className="file-input"
                  onChange={handleFileChange}
                />
                <span className="form-hint">
                  Only .pdf files are supported. Files are processed locally in
                  your FastAPI backend.
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                }}
              >
                <button
                  type="submit"
                  className="primary-button"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading…' : 'Upload & Extract'}
                </button>
                <div className="timestamp">
                  {lastUploadedAt ? (
                    <>
                      Last uploaded at <strong>{lastUploadedAt}</strong>
                    </>
                  ) : (
                    'No uploads yet this session.'
                  )}
                </div>
              </div>
            </form>

            {uploadError && <div className="error">{uploadError}</div>}

            <div style={{ marginTop: '0.9rem' }}>
              <div className="form-label">Recent uploads</div>
              {history.length === 0 ? (
                <p className="placeholder">
                  Your last 5 uploads will appear here for quick access.
                </p>
              ) : (
                <ul className="history-list">
                  {history.map((item) => {
                    const isActive =
                      activeUpload &&
                      activeUpload.filename === item.result.filename &&
                      lastUploadedAt === item.uploadedAt
                    return (
                      <li
                        key={item.id}
                        className={
                          'history-item ' + (isActive ? 'active' : '')
                        }
                        onClick={() => handleSelectHistory(item)}
                      >
                        <div className="history-filename">
                          {item.filename}
                        </div>
                        <div className="history-meta">
                          {item.uploadedAt}
                          {item.result.page_count
                            ? ` · ${item.result.page_count} page${
                                item.result.page_count > 1 ? 's' : ''
                              }`
                            : null}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        </section>

        <section className="pane">
          <div className="pane-header">
            <div>
              <div className="pane-title">PDF Preview</div>
              <p className="pane-subtitle">
                Browse your document page-by-page and inspect the extracted
                text.
              </p>
            </div>
            <span className="pill">preview</span>
          </div>
          <div className="pane-body">
            {!activeUpload ? (
              <p className="placeholder">
                Upload a PDF on the left to see its metadata and page text
                here.
              </p>
            ) : (
              <>
                <div className="preview-header">
                  <div className="preview-title">
                    {activeUpload.title || activeUpload.filename}
                  </div>
                  <div className="preview-meta">
                    {activeUpload.author && (
                      <span>
                        by <strong>{activeUpload.author}</strong>{' '}
                      </span>
                    )}
                    {activeUpload.page_count
                      ? `· ${activeUpload.page_count} page${
                          activeUpload.page_count > 1 ? 's' : ''
                        }`
                      : null}
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Filename:</span>
                    <span className="meta-value">
                      {activeUpload.filename}
                    </span>
                  </div>
                </div>

                <div className="pdf-preview">
                  {currentPageText
                    ? currentPageText.trim() || '[No text on this page]'
                    : '[Unable to read this page]'}
                </div>
                <div className="pager">
                  <div className="pager-label">
                    Page {currentPage} of {activeUpload.page_count || '?'}
                  </div>
                  <div className="pager-controls">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={goPrevPage}
                      disabled={!canGoPrev}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={goNextPage}
                      disabled={!canGoNext}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="pane pane-right">
          <div className="pane-header">
            <div>
              <div className="pane-title">Study Sheet & Playground</div>
              <p className="pane-subtitle">
                Turn uploaded notes into guided review material.
              </p>
            </div>
            <span className="pill">phase 2</span>
          </div>
          <div className="pane-body">
            {!activeUpload ? (
              <p className="placeholder">
                Upload a PDF first, then generate a study sheet from the
                extracted text.
              </p>
            ) : (
              <>
                <div className="study-sheet-actions">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => void handleGenerateStudySheet()}
                    disabled={studySheetLoading}
                  >
                    {studySheetLoading
                      ? 'Generating…'
                      : activeStudySheet
                        ? 'Regenerate Study Sheet'
                        : 'Generate Study Sheet'}
                  </button>
                  <div className="timestamp">
                    Based on <strong>{activeUpload.filename}</strong>
                  </div>
                </div>

                {studySheetError && <div className="error">{studySheetError}</div>}

                {activeStudySheet ? (
                  <div className="study-sheet">
                    <div className="study-sheet-block">
                      <div className="study-sheet-label">Main idea</div>
                      <p className="study-sheet-main-idea">
                        {activeStudySheet.main_idea}
                      </p>
                    </div>

                    {activeStudySheet.core_terms.length > 0 && (
                      <div className="study-sheet-block">
                        <div className="study-sheet-label">Core terms</div>
                        <div className="chip-list">
                          {activeStudySheet.core_terms.map((term) => (
                            <span key={term} className="study-chip">
                              {term}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeStudySheet.sections.length > 0 && (
                      <div className="study-sheet-block">
                        <div className="study-sheet-label">Sections</div>
                        <div className="study-section-list">
                          {activeStudySheet.sections.map((section, index) => (
                            <article key={`${section.title}-${index}`} className="study-card">
                              <div className="study-card-header">
                                <h3>{section.title}</h3>
                                <span className="difficulty-badge">
                                  {section.difficulty}
                                </span>
                              </div>
                              <p>{section.summary}</p>
                            </article>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeStudySheet.questions.length > 0 && (
                      <div className="study-sheet-block">
                        <div className="study-sheet-label">Practice questions</div>
                        <ul className="study-list">
                          {activeStudySheet.questions.map((question) => (
                            <li key={question}>{question}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {activeStudySheet.tips.length > 0 && (
                      <div className="study-sheet-block">
                        <div className="study-sheet-label">Study tips</div>
                        <ul className="study-list">
                          {activeStudySheet.tips.map((tip) => (
                            <li key={tip}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="coming-next">
                      Coding challenges and Ask Sage feedback are still planned
                      next on top of this study workflow.
                    </div>
                  </div>
                ) : (
                  <div className="study-sheet-empty">
                    <p className="coming-soon-label">
                      This panel now supports study sheet generation.
                    </p>
                    <ul className="right-pane-list">
                      <li>Generate a structured summary from extracted PDF text.</li>
                      <li>Review core terms, section summaries, and questions.</li>
                      <li>Build toward the coding playground in the next phase.</li>
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      {statusError && (
        <div className="error" style={{ marginTop: '0.75rem' }}>
          {statusError}{' '}
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              setStatusError(null)
              void refreshStatus()
            }}
          >
            Retry status
          </button>
        </div>
      )}
    </div>
  )
}
