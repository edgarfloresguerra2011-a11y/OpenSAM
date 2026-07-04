import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// React Testing Library cleanup between tests.
afterEach(() => {
  cleanup()
})

// jsdom doesn't implement matchMedia — many libraries expect it.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// jsdom doesn't implement IntersectionObserver either.
class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn(() => [])
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
})

// Suppress React 18 act() warnings in test output
const origError = console.error
console.error = (...args: unknown[]) => {
  const first = args[0]
  if (typeof first === 'string' && first.includes('not wrapped in act')) {
    return
  }
  origError(...args)
}
