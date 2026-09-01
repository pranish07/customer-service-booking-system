import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import {
  ErrorBoundary,
  DevErrorSimulator,
  RoutePageSkeleton,
} from '@/components'

const ServiceListPage = lazy(
  () => import('@/features/service-list/ServiceListPage'),
)
const ServiceDetailsPage = lazy(
  () => import('@/features/service-details/ServiceDetailsPage'),
)
const BookingPage = lazy(() => import('@/features/booking/BookingPage'))
const ConfirmationPage = lazy(
  () => import('@/features/confirmation/ConfirmationPage'),
)
const MyBookingsPage = lazy(
  () => import('@/features/my-bookings/MyBookingsPage'),
)

function RouteFallback() {
  // This is the code-split (Suspense) loading state. It maps the current route
  // to the skeleton of the page about to render, so the user sees a single
  // page-matched skeleton both here and in the feature's own data-loading
  // state, never two different skeletons in sequence.
  return <RoutePageSkeleton />
}

/**
 * Top-level router. Each route's page is lazy-loaded into its own chunk and
 * wrapped by Suspense; the whole router sits inside the ErrorBoundary.
 *
 * Failure model:
 *   - Per-feature data failures are React Query `isError` states handled inside
 *     each feature (loading/empty/error) — they never throw during render.
 *   - Unexpected render/runtime errors propagate here to the ErrorBoundary as
 *     a safety net. `DevErrorSimulator` (dev only) makes this path reachable:
 *     open any route with `?__boom`.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <DevErrorSimulator />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<ServiceListPage />} />
          <Route path="/services/:serviceId" element={<ServiceDetailsPage />} />
          <Route path="/services/:serviceId/book" element={<BookingPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
