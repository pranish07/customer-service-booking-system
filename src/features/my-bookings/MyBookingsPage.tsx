import { useState } from 'react'
import { Button, Container as ChakraContainer, Flex, Heading, HStack, Spinner, Text, VStack } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { MyBookingsEmailPrompt } from './MyBookingsEmailPrompt'
import { BookingsList } from './BookingsList'
import { BookingDetails } from './BookingDetails'
import { useBookings, useBookingById } from './useBookings'

/**
 * Feature: the customer's booking history. Lazy-loaded as its own chunk.
 *
 * Asks for an email, then lists that customer's bookings (GET /bookings).
 * Selecting a row opens the full details fetched on demand via GET /bookings/{id}.
 */
export default function MyBookingsPage() {
  const [email, setEmail] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const bookings = useBookings(email)
  const detail = useBookingById(selectedId)

  return (
    <ChakraContainer maxW="720px" py={10}>
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between" align="center">
          <Heading size="lg">My bookings</Heading>
          <Button variant="ghost" size="sm" as={RouterLink} to="/">
            ← Back to services
          </Button>
        </HStack>

        {email === null ? (
          <MyBookingsEmailPrompt onSubmit={setEmail} />
        ) : selectedId !== null ? (
          detail.isLoading ? (
            <Flex justify="center" py={10}>
              <Spinner />
            </Flex>
          ) : detail.isError ? (
            <VStack align="stretch" spacing={3} maxW="520px">
              <Text color="gray.600">We could not load this booking.</Text>
              <Button
                colorScheme="red"
                alignSelf="flex-start"
                onClick={() => detail.refetch()}
              >
                Try again
              </Button>
            </VStack>
          ) : detail.data ? (
            <BookingDetails booking={detail.data} onBack={() => setSelectedId(null)} />
          ) : null
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              alignSelf="flex-start"
              onClick={() => setEmail(null)}
            >
              ← Change email
            </Button>
            <BookingsList
              isLoading={bookings.isLoading}
              isError={bookings.isError}
              bookings={bookings.data ?? []}
              selectedId={selectedId}
              onRetry={() => bookings.refetch()}
              onSelect={(booking) => setSelectedId(booking.id)}
            />
          </>
        )}
      </VStack>
    </ChakraContainer>
  )
}
