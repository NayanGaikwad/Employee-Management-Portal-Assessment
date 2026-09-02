import '@testing-library/jest-dom/vitest'
import 'pointer-events-polyfill'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// jsdom (Radix UI) relies on these DOM methods which jsdom doesn't implement.
// Guard them so pointer-events polyfill / focus management work in tests.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.setPointerCapture = () => undefined
  Element.prototype.releasePointerCapture = () => undefined
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => undefined
}

afterEach(() => {
  cleanup()
  try {
    window.localStorage.clear()
  } catch {
    // localStorage may be shadowed by a polyfill; teardown shouldn't fail.
  }
  vi.restoreAllMocks()
})