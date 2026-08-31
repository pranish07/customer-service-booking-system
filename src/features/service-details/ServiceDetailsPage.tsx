import { useParams, useNavigate } from 'react-router-dom'
import { useServiceDetails, useServiceAvailability, summarizeAvailability } from './useServiceDetails'
import { ServiceDetailsContent } from './ServiceDetailsContent'
import { ServiceDetailsLoading } from './ServiceDetailsLoading'
import { ServiceDetailsError } from './ServiceDetailsError'

/**
 * Feature: view a single service's details. Reads :serviceId from the URL,
 * owns the details + availability queries, and delegates rendering to
 * presentational components.
 */
export default function ServiceDetailsPage() {
  const { serviceId = '' } = useParams()
  const navigate = useNavigate()

  const details = useServiceDetails(serviceId)
  const availability = useServiceAvailability(serviceId)

  if (details.isLoading) return <ServiceDetailsLoading />
  if (details.isError) {
    return (
      <ServiceDetailsError
        error={details.error}
        onRetry={() => details.refetch()}
      />
    )
  }

  const service = details.data!
  // Availability is only a secondary summary line, but it must still resolve to
  // an explicit state rather than silently collapsing "still loading" or
  // "failed" into the empty/no-availability copy, which would be misleading.
  let availabilitySummary: string
  if (availability.isLoading) {
    availabilitySummary = 'Checking availability…'
  } else if (availability.isError) {
    availabilitySummary = 'Availability unavailable right now.'
  } else {
    availabilitySummary = summarizeAvailability(availability.data)
  }

  function handleBook() {
    navigate(`/services/${service.id}/book`)
  }

  return (
    <ServiceDetailsContent
      service={service}
      availabilitySummary={availabilitySummary}
      onBook={handleBook}
    />
  )
}
