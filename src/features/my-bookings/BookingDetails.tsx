import { Button, Divider, Heading, HStack, Text, VStack } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import type { Booking } from '@/types'

interface BookingDetailsProps {
  booking: Booking
  onBack: () => void
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

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <HStack justify="space-between" align="baseline">
      <Text color="gray.500" fontSize="sm">
        {label}
      </Text>
      <Text textAlign="right">{children}</Text>
    </HStack>
  )
}

export function BookingDetails({ booking, onBack }: BookingDetailsProps) {
  return (
    <VStack align="stretch" spacing={4} maxW="520px">
      <HStack justify="space-between">
        <Heading size="md">Booking details</Heading>
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back to list
        </Button>
      </HStack>

      <VStack align="stretch" spacing={2}>
        <Row label="Booking number">{booking.id}</Row>
        <Row label="Service">{booking.serviceName}</Row>
        <Row label="Provider">{booking.provider}</Row>
        <Row label="Date and time">{formatDateTime(booking.startTime)}</Row>
        <Row label="Status">
          <Text
            as="span"
            fontWeight="bold"
            color={booking.status === 'confirmed' ? 'green.600' : 'gray.500'}
          >
            {booking.status === 'confirmed' ? 'Confirmed' : 'Cancelled'}
          </Text>
        </Row>
      </VStack>

      <Divider />

      <VStack align="stretch" spacing={1}>
        <Text fontWeight="bold" fontSize="sm">
          Customer
        </Text>
        <Text color="gray.600">{booking.customerName}</Text>
        <Text color="gray.600">{booking.customerEmail}</Text>
        {booking.customerPhone && <Text color="gray.600">{booking.customerPhone}</Text>}
      </VStack>
    </VStack>
  )
}
