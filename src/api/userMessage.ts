import type { ApiError } from '@/types'

/**
 * Returns a user-facing, non-technical error message for the UI, falling back
 * to `fallback` when the error carries no server-supplied copy or is not an
 * ApiError at all.
 *
 * The machine-readable `error.code` is intentionally NOT shown to the user —
 * it is still available on the original `ApiError` for logging/telemetry (see
 * `logApiError`), so the UI copy stays friendly while the cause stays
 * diagnosable in the console/observability pipeline.
 */
export function userFacingMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'error' in err) {
    const body = (err as ApiError).error
    return body.message?.trim() ? body.message : fallback
  }
  return fallback
}

/**
 * Logs an ApiError's machine code (and message) for telemetry/debugging
 * without surfacing raw server text to the user. No-op for non-ApiErrors.
 */
export function logApiError(err: unknown, context: string): void {
  if (err && typeof err === 'object' && 'error' in err) {
    const { code, message } = (err as ApiError).error
    // Dev/observability hook — replace with real telemetry in a later phase.
    console.error(`[api] ${context} failed (${code}): ${message ?? ''}`)
    return
  }
  console.error(`[api] ${context} failed:`, err)
}
