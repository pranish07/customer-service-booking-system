import {
  Button,
  Divider,
  Heading,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react'
import type { ServiceDetails, AvailabilitySlot } from '@/types'
import type { CustomerDetails } from './bookingFlow'

interface BookingSummaryProps {
  service: ServiceDetails
  slot: AvailabilitySlot
  customer: CustomerDetails
  onBack: () => void
}

function formatPrice(currency: string, minorUnits: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(minorUnits)
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

export function BookingSummary({
  service,
  slot,
  customer,
  onBack,
}: BookingSummaryProps) {
  return (
    <VStack align="stretch" spacing={4} maxW="540px">
      <Heading size="md">Review your booking</Heading>

      <VStack align="stretch" spacing={1}>
        <Text fontWeight="bold">{service.name}</Text>
        <Text color="gray.600">{service.description}</Text>
        <Text color="gray.600">
          {formatDateTime(slot.startTime)} · {service.durationMinutes} min
        </Text>
        <Text fontWeight="bold" color="green.600">
          {formatPrice(service.currency, service.price)}
        </Text>
      </VStack>

      <Divider />

      <VStack align="stretch" spacing={1}>
        <Text fontWeight="bold">Customer</Text>
        <Text color="gray.600">{customer.customerName}</Text>
        <Text color="gray.600">{customer.customerEmail}</Text>
        {customer.customerPhone && (
          <Text color="gray.600">{customer.customerPhone}</Text>
        )}
        <Text color="gray.600">{customer.address}</Text>
      </VStack>

      <Divider />

      <HStack spacing={3}>
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
      </HStack>
    </VStack>
  )
}
