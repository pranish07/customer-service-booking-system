import { useState } from 'react'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Container as ChakraContainer,
  Flex,
  Heading,
  HStack,
  Spinner,
  VStack,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { useFocusOnMount } from '@/hooks'
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
  const detailErrorRef = useFocusOnMount<HTMLDivElement>()

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
            <Flex justify="center" py={10} role="status" aria-live="polite">
              <Spinner aria-label="Loading booking details" />
            </Flex>
          ) : detail.isError ? (
            <Alert
              ref={detailErrorRef}
              role="alert"
              tabIndex={-1}
              outline="none"
              status="error"
              variant="subtle"
              flexDirection="column"
              alignItems="flex-start"
              borderRadius="md"
              py={5}
              maxW="520px"
            >
              <HStack>
                <AlertIcon />
                <AlertTitle>Could not load booking</AlertTitle>
              </HStack>
              <AlertDescription mb={3}>
                We could not load the details for this booking. Please try again in a
                moment.
              </AlertDescription>
              <Button colorScheme="red" size="sm" onClick={() => detail.refetch()}>
                Try again
              </Button>
            </Alert>
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
