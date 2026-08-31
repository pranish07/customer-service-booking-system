import {
  Alert,
  AlertIcon,
  Button,
  Divider,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { Booking } from '@/types'

interface ConfirmationCardProps {
  booking: Booking
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString([], {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function displayStatus(status: Booking['status']): string {
  return status === 'confirmed' ? 'Confirmed' : 'Cancelled'
}

export function ConfirmationCard({ booking }: ConfirmationCardProps) {
  return (
    <VStack align="stretch" spacing={4} maxW="520px" mx="auto" textAlign="center">
      <Alert
        status="success"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        borderRadius="md"
        py={6}
      >
        <AlertIcon boxSize={8} />
        <Text fontWeight="bold" fontSize="lg" mt={2}>
          Booking confirmed!
        </Text>
        <Text color="gray.600" fontSize="sm">
          A confirmation has been sent to your email.
        </Text>
      </Alert>

      <VStack align="stretch" spacing={1} textAlign="left">
        <Row label="Booking number">
          <Text fontWeight="bold">{booking.id}</Text>
        </Row>
        <Row label="Service">
          <Text>{booking.serviceName}</Text>
        </Row>
        <Row label="Provider">
          <Text>{booking.provider}</Text>
        </Row>
        <Row label="Date and time">
          <Text>{formatDateTime(booking.startTime)}</Text>
        </Row>
        <Row label="Status">
          <Text fontWeight="bold" color={booking.status === 'confirmed' ? 'green.600' : 'gray.600'}>
            {displayStatus(booking.status)}
          </Text>
        </Row>
      </VStack>

      <Divider />

      <HStack spacing={3} justify="center">
        <Button colorScheme="green" as={RouterLink} to="/my-bookings">
          View my bookings
        </Button>
        <Button variant="outline" as={RouterLink} to={`/services/${booking.serviceId}/book`}>
          Book another
        </Button>
      </HStack>
    </VStack>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <HStack justify="space-between" align="baseline">
      <Text color="gray.500" fontSize="sm">
        {label}
      </Text>
      {children}
    </HStack>
  )
}
