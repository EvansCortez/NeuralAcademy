import '@testing-library/jest-dom'
import { vi } from 'vitest'

const storage: Record<string, string> = {}

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn((key: string) => (key in storage ? storage[key] : null)),
    setItem: vi.fn((key: string, value: string) => {
      storage[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete storage[key]
    }),
    clear: vi.fn(() => {
      for (const key of Object.keys(storage)) {
        delete storage[key]
      }
    }),
  },
  configurable: true,
})

