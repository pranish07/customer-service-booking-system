import { useQuery } from '@tanstack/react-query'
import { getServiceDetails, getAvailability } from '@/api/services'
import type { AvailabilitySlot } from '@/types'

/**
 * Loads a single service's details, keyed by serviceId so that navigating
 * between services always targets the right cache entry and React Query shows
 * the loading state for the new key instead of surfacing stale data.
 */
export function useServiceDetails(serviceId: string) {
  return useQuery({
    queryKey: ['services', serviceId],
    queryFn: () => getServiceDetails(serviceId),
    meta: { errorContext: `load service ${serviceId}` },
  })
}

/**
 * Loads the availability slots for a service (next 14 days by default) to
 * produce an availability summary on the details screen.
 */
export function useServiceAvailability(serviceId: string) {
  return useQuery({
    queryKey: ['availability', serviceId],
    queryFn: () => getAvailability(serviceId),
    meta: { errorContext: `load availability for ${serviceId}` },
  })
}

export function summarizeAvailability(
  slots: AvailabilitySlot[] | undefined,
): string {
  if (!slots || slots.length === 0) {
    return 'No upcoming availability.'
  }
  const available = slots.filter((s) => s.status === 'available').length
  if (available === 0) {
    return 'No available time slots in the next 14 days.'
  }
  return `${available} of ${slots.length} time slots available in the next 14 days.`
}
