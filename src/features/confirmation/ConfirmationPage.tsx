import { Button, Container as ChakraContainer, Heading, Text, VStack } from '@chakra-ui/react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getBookingById } from '@/api/services'
import { ConfirmationCard } from './ConfirmationCard'
import type { Booking } from '@/types'

interface ConfirmationLocationState {
  booking?: Booking
}

/**
 * Feature: success screen shown immediately after a booking is created.
 * Lazy-loaded as its own chunk.
 *
 * Reads the booking either from the router `location.state` (set when the
 * booking flow navigates here on success) or, when opened from a bookmark /
 * shared URL, from the `?bookingId=` query parameter via GET /bookings/{id}.
 */
export default function ConfirmationPage() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const bookingId = searchParams.get('bookingId')
  const stateBooking = (location.state as ConfirmationLocationState | null)?.booking

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['bookings', bookingId],
    queryFn: () => getBookingById(bookingId!),
    enabled: Boolean(bookingId) && !stateBooking,
  })

  const booking = stateBooking ?? data

  return (
    <ChakraContainer maxW="760px" py={10}>
      {isLoading && !stateBooking ? (
        <VStack align="stretch" spacing={6}>
          <Heading size="lg">Booking confirmation</Heading>
          <Text as="span" color="gray.500">
            Loading confirmation…
          </Text>
        </VStack>
      ) : isError && !stateBooking ? (
        <VStack align="stretch" spacing={6}>
          <Heading size="lg">Booking confirmation</Heading>
          <Text as="span" color="gray.500">
            We could not load this booking. It may have been removed.
          </Text>
          <Button colorScheme="red" onClick={() => refetch()} alignSelf="flex-start">
            Try again
          </Button>
        </VStack>
      ) : booking ? (
        <VStack align="stretch" spacing={6}>
          <Heading size="lg">Booking confirmation</Heading>
          <ConfirmationCard booking={booking} />
        </VStack>
      ) : (
        <VStack align="stretch" spacing={6}>
          <Heading size="lg">Booking confirmation</Heading>
          <Text as="span" color="gray.500">
            No booking reference was provided in this link.
          </Text>
        </VStack>
      )}
    </ChakraContainer>
  )
}
