import { useQuery } from '@tanstack/react-query'
import { getServices } from '@/api/services'
import { useDebouncedValue } from '@/hooks'
import type { Service } from '@/types'

const SEARCH_DEBOUNCE_MS = 300

export interface UseServicesParams {
  search: string
  category: string
}

/**
 * Loads the full service catalog from `getServices()` and applies search +
 * category filtering on the client.
 *
 * Filtering is deliberately a derived computation over the single cached
 * `['services']` query rather than extra server requests (the API exposes no
 * filter params). Because `data` is memoised by React Query and never
 * mutated, each render recomputes a fresh filtered array — so rapid typing or
 * filter switching can never let an earlier result shadow a newer one; there
 * is no in-flight request to race, and no hand-rolled cancellation flag.
 * Changing `category`/`debouncedSearch` merely re-derives from stable data.
 */
export function useServices({ search, category }: UseServicesParams) {
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS)

  const query = useQuery({
    queryKey: ['services'],
    queryFn: getServices,
    meta: { errorContext: 'load services' },
  })

  const categories = Array.from(
    new Set((query.data ?? []).map((s) => s.category)),
  ).sort()

  const normalizedSearch = debouncedSearch.trim().toLowerCase()
  const hasFilters = normalizedSearch.length > 0 || category !== 'all'

  const data = (query.data ?? []).filter((service: Service) => {
    const matchesCategory =
      category === 'all' || service.category === category
    const matchesSearch =
      normalizedSearch.length === 0 ||
      service.name.toLowerCase().includes(normalizedSearch)
    return matchesCategory && matchesSearch
  })

  return {
    ...query,
    data,
    categories,
    hasFilters,
  }
}
