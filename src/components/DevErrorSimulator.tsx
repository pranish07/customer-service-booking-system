/**
 * Dev-only helper to prove the top-level ErrorBoundary is reachable.
 *
 * Opening any route with `?__boom` (for example `/services/svc_01?__boom`)
 * throws during render while `import.meta.env.DEV`, which the ErrorBoundary in
 * App.tsx catches. It is compiled away in production builds.
 *
 * It exists to distinguish the two kinds of failure the app shows:
 *   - Per-feature loading/empty/error states (React Query `isError`) — these
 *     are data states React Query resolves; they never throw during render and
 *     are handled by each feature. The ErrorBoundary is NOT involved.
 *   - Unexpected render/runtime errors (e.g. a null deref in a component) —
 *     these propagate and are caught by the ErrorBoundary as a safety net.
 */
export function DevErrorSimulator() {
  if (!import.meta.env.DEV) return null
  if (new URLSearchParams(window.location.search).get('__boom')) {
    throw new Error('Simulated render error for ErrorBoundary testing')
  }
  return null
}
