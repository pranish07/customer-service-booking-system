import { describe, expect, it, vi, afterEach } from 'vitest'
import { resetDb } from '@/api/mock'

// This test intentionally does NOT mock @/api/services. It keeps the real client
// (with its runtime Zod schema validation) but forces the underlying mock to
// return a malformed payload, proving that validation catches it and surfaces a
// normalised ApiError rather than letting a broken object reach the UI or
// crashing on an unhandled Zod error.
vi.mock('@/api/mock', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/mock')>()
  return {
    ...actual,
    getServices: async () => [
      // Missing required fields (name is present but description/duration/
      // price/currency/category/... are not) -> fails ServiceSchema.
      { id: 'svc_bad', name: 'Incomplete Service' },
    ],
  }
})

import { getServices } from '@/api/services'

describe('runtime schema validation', () => {
  afterEach(() => {
    resetDb()
  })

  it(
    'surfaces a malformed payload as an ApiError rather than passing it through',
    { timeout: 20000 },
    async () => {
      await expect(getServices()).rejects.toMatchObject({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Response did not match the expected schema.',
        },
      })
    },
  )
})
