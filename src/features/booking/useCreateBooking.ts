import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createBooking } from '@/api/services'
import type { Booking, BookingRequest } from '@/types'

/**
 * Creates a booking via POST /bookings. On success the affected query caches
 * are invalidated (bookings, services, availability) so the My Bookings list
 * and the availability grid reflect the new booking, then `onSuccess` is
 * invoked so the caller can navigate to the confirmation screen.
 *
 * Errors are thrown as a normalised `ApiError` (see `@/api/client`) whose
 * `error.code` identifies the category:
 *   - `VALIDATION_ERROR`     -> field-level 400
 *   - `SLOT_UNAVAILABLE`     -> 409 slot taken
 *   - `DUPLICATE_BOOKING`    -> 409 duplicate booking
 *   - everything else        -> 404 / 500 handled generically
 */
export function useCreateBooking(onSuccess?: (booking: Booking) => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: BookingRequest) => createBooking(request),
    onSuccess: (booking) => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] })
      void queryClient.invalidateQueries({ queryKey: ['services'] })
      void queryClient.invalidateQueries({ queryKey: ['availability'] })
      onSuccess?.(booking)
    },
  })
}
