import {
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  HStack,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { CheckCircleIcon } from '@/components/CheckCircleIcon'
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
    <VStack align="stretch" spacing={8} maxW="540px" mx="auto">
      <VStack spacing={4} textAlign="center" pt={2}>
        <Box
          boxSize="72px"
          borderRadius="full"
          bg="green.50"
          color="green.600"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <CheckCircleIcon boxSize="9" />
        </Box>
        <VStack spacing={1}>
          <Heading size="lg">Booking confirmed!</Heading>
          <Text color="gray.600">A confirmation has been sent to your email.</Text>
        </VStack>
      </VStack>

      <Card variant="outline">
        <CardBody>
          <VStack align="stretch" spacing={2}>
            <Text
              fontSize="xs"
              color="gray.500"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              Reference
            </Text>
            <Text fontWeight="bold" fontSize="lg">
              {booking.id}
            </Text>
          </VStack>

          <Divider my={5} />

          <VStack align="stretch" spacing={4}>
            <Row label="Service">
              <Text fontWeight="semibold">{booking.serviceName}</Text>
            </Row>
            <Row label="Provider">
              <Text>{booking.provider}</Text>
            </Row>
            <Row label="Date and time">
              <Text textAlign="right">{formatDateTime(booking.startTime)}</Text>
            </Row>
            <Row label="Status">
              <Text
                as="span"
                fontWeight="bold"
                color={booking.status === 'confirmed' ? 'green.600' : 'gray.600'}
              >
                {displayStatus(booking.status)}
              </Text>
            </Row>
          </VStack>
        </CardBody>
      </Card>

      <HStack spacing={3} justify="center" flexWrap="wrap">
        <Button
          colorScheme="green"
          size="lg"
          as={RouterLink}
          to="/my-bookings"
          minW="180px"
        >
          View my bookings
        </Button>
        <Button
          variant="outline"
          size="lg"
          as={RouterLink}
          to={`/services/${booking.serviceId}/book`}
          minW="180px"
        >
          Book another service
        </Button>
      </HStack>
    </VStack>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <HStack justify="space-between" align="baseline" spacing={6}>
      <Text color="gray.500" fontSize="sm">
        {label}
      </Text>
      {children}
    </HStack>
  )
}