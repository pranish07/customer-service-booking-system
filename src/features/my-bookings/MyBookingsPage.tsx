import { useState } from 'react'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Container as ChakraContainer,
  Heading,
  HStack,
  VStack,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { BackIcon, MyBookingsPageSkeleton } from '@/components'
import { useFocusOnMount } from '@/hooks'
import { MyBookingsEmailPrompt } from './MyBookingsEmailPrompt'
import { BookingsList } from './BookingsList'
import { BookingDetails } from './BookingDetails'
import { BookingDetailsLoading } from './BookingDetailsLoading'
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
    <ChakraContainer maxW="860px" py={8}>
      <VStack align="stretch" spacing={6}>
        <Box alignSelf="flex-start">
          <Button
            variant="ghost"
            size="sm"
            as={RouterLink}
            to="/"
            leftIcon={<BackIcon />}
          >
            Back to services
          </Button>
        </Box>
        <Heading size="lg">My bookings</Heading>

        {email === null ? (
          <MyBookingsEmailPrompt onSubmit={setEmail} />
        ) : bookings.isLoading ? (
          <MyBookingsPageSkeleton />
        ) : selectedId !== null ? (
          detail.isLoading ? (
            <BookingDetailsLoading />
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
                We could not load the details for this booking. Please try again
                in a moment.
              </AlertDescription>
              <Button
                colorScheme="red"
                size="sm"
                onClick={() => detail.refetch()}
              >
                Try again
              </Button>
            </Alert>
          ) : detail.data ? (
            <BookingDetails
              booking={detail.data}
              onBack={() => setSelectedId(null)}
            />
          ) : null
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              alignSelf="flex-start"
              onClick={() => setEmail(null)}
              leftIcon={<BackIcon />}
            >
              Change email
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
