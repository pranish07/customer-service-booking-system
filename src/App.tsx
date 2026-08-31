import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Center, Spinner } from '@chakra-ui/react'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const ServiceListPage = lazy(() => import('@/features/service-list/ServiceListPage'))
const ServiceDetailsPage = lazy(() => import('@/features/service-details/ServiceDetailsPage'))
const BookingPage = lazy(() => import('@/features/booking/BookingPage'))
const ConfirmationPage = lazy(() => import('@/features/confirmation/ConfirmationPage'))
const MyBookingsPage = lazy(() => import('@/features/my-bookings/MyBookingsPage'))

function RouteFallback() {
  return (
    <Center minH="60vh">
      <Spinner size="xl" />
    </Center>
  )
}

/**
 * Top-level router. Each route's page is lazy-loaded into its own chunk and
 * wrapped by Suspense. The whole router sits inside the ErrorBoundary.
 */
export default function App() {
  return (
    <ErrorBoundary>
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
