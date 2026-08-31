import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Flex,
  HStack,
  List,
  ListItem,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useFocusOnMount } from '@/hooks'
import type { Booking } from '@/types'

interface BookingsListProps {
  isLoading: boolean
  isError: boolean
  bookings: Booking[]
  selectedId: string | null
  onRetry: () => void
  onSelect: (booking: Booking) => void
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function BookingsList({
  isLoading,
  isError,
  bookings,
  selectedId,
  onRetry,
  onSelect,
}: BookingsListProps) {
  const errorRef = useFocusOnMount<HTMLDivElement>()

  if (isLoading) {
    return (
      <Flex justify="center" py={10} role="status" aria-live="polite">
        <Spinner aria-label="Loading your bookings" />
      </Flex>
    )
  }

  if (isError) {
    return (
      <Alert
        ref={errorRef}
        role="alert"
        tabIndex={-1}
        outline="none"
        status="error"
        variant="subtle"
        flexDirection="column"
        alignItems="flex-start"
        borderRadius="md"
        py={5}
        maxW="440px"
      >
        <HStack>
          <AlertIcon />
          <AlertTitle>Could not load bookings</AlertTitle>
        </HStack>
        <AlertDescription mb={3}>
          We could not load your bookings. Please try again in a moment.
        </AlertDescription>
        <Button colorScheme="red" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </Alert>
    )
  }

  if (bookings.length === 0) {
    return (
      <Text color="gray.600" role="status" aria-live="polite">
        You don’t have any bookings yet. <b>Book a service</b> when you’re ready.
      </Text>
    )
  }

  return (
    <VStack align="stretch" spacing={2}>
      <Text color="gray.500" fontSize="sm">
        {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
      </Text>
      <List spacing={3}>
        {bookings.map((booking) => (
          <ListItem key={booking.id}>
            <BookingRow
              booking={booking}
              isSelected={booking.id === selectedId}
              onSelect={() => onSelect(booking)}
            />
          </ListItem>
        ))}
      </List>
    </VStack>
  )
}

function BookingRow({
  booking,
  isSelected,
  onSelect,
}: {
  booking: Booking
  isSelected: boolean
  onSelect: () => void
}) {
  const border = isSelected ? '2px' : '1px'
  const borderColor = isSelected ? 'green.400' : 'gray.200'
  return (
    <Button
      as="button"
      variant="outline"
      display="flex"
      width="100%"
      height="auto"
      flexDirection="column"
      alignItems="stretch"
      py={3}
      px={4}
      borderRadius="md"
      borderWidth={border}
      borderColor={borderColor}
      _hover={{ borderColor: 'green.400' }}
      onClick={onSelect}
    >
      <Flex justify="space-between" width="100%">
        <Text fontWeight="bold">{booking.serviceName}</Text>
        <Text
          fontSize="xs"
          fontWeight="semibold"
          color={booking.status === 'confirmed' ? 'green.600' : 'gray.500'}
        >
          {booking.status === 'confirmed' ? 'Confirmed' : 'Cancelled'}
        </Text>
      </Flex>
      <Text fontSize="sm" textAlign="left" color="gray.600">
        {booking.provider}
      </Text>
      <Text fontSize="sm" textAlign="left" color="gray.600">
        {formatDateTime(booking.startTime)}
      </Text>
      <Text fontSize="xs" textAlign="left" color="gray.400">
        {booking.id}
      </Text>
    </Button>
  )
}
