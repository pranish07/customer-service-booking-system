import '@testing-library/jest-dom/vitest'

// jsdom does not implement window.matchMedia, which Chakra UI's responsive
// hooks (e.g. SkeletonText -> useBreakpointValue -> useMediaQuery) rely on.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }),
})
