import { useQuery } from '@tanstack/react-query'
import { getBookingById, getBookings } from '@/api/services'

/**
 * Fetches the customer's bookings for `email` via GET /bookings?email=…
 * Keyed by email so switching the entered address refetches the right list.
 * `enabled` defers the request until an email has actually been submitted.
 */
export function useBookings(email: string | null) {
  return useQuery({
    queryKey: ['bookings', { email }],
    queryFn: () => getBookings(email!),
    enabled: Boolean(email),
  })
}

/**
 * Fetches a single booking via GET /bookings/{id} when a row is selected.
 * Keyed by id per the API contract.
 */
export function useBookingById(bookingId: string | null) {
  return useQuery({
    queryKey: ['bookings', bookingId],
    queryFn: () => getBookingById(bookingId!),
    enabled: Boolean(bookingId),
  })
}
