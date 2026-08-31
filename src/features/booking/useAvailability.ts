import { useQuery } from '@tanstack/react-query'
import { getAvailability, getServiceDetails } from '@/api/services'

const DAYS_AHEAD = 14

/**
 * Fetches the available slots for `serviceId` on a specific `date`
 * (YYYY-MM-DD) via GET /services/{id}/availability. The query is keyed by
 * both the service and date so React Query caches per date and never serves
 * one date's slots for another. `enabled` defers the request until a date is
 * actually chosen.
 */
export function useAvailability(serviceId: string, date: string | null) {
  return useQuery({
    queryKey: ['availability', serviceId, { date }],
    queryFn: () => getAvailability(serviceId, { date: date! }),
    enabled: Boolean(date),
    meta: { errorContext: `load availability for ${serviceId} on ${date ?? '?'}` },
  })
}

/**
 * Loads the service being booked so the summary step can show its name, price,
 * and duration. Keyed by serviceId.
 */
export function useBookingService(serviceId: string) {
  return useQuery({
    queryKey: ['services', serviceId],
    queryFn: () => getServiceDetails(serviceId),
    meta: { errorContext: `load service ${serviceId}` },
  })
}

/**
 * Returns the next 14 calendar dates (the window the mock generates slots for)
 * as YYYY-MM-DD strings. Used to offer a finite set of selectable dates.
 */
export function getSelectableDates(): string[] {
  const dates: string[] = []
  const today = new Date()
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const cursor = new Date(today)
    cursor.setDate(cursor.getDate() + i)
    const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(
      cursor.getDate(),
    ).padStart(2, '0')}`
    dates.push(iso)
  }
  return dates
}
