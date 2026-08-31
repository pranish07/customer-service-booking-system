import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Divider,
  Heading,
  HStack,
  List,
  ListItem,
  Text,
  VStack,
} from '@chakra-ui/react'
import type { ServiceDetails, AvailabilitySlot } from '@/types'
import type { CustomerDetails } from './bookingFlow'

export interface BookingSubmitError {
  kind: 'validation' | 'conflict' | 'server'
  message: string
  /** Field-level messages (validation 400 only). */
  fields?: Record<string, string>
}

interface BookingSummaryProps {
  service: ServiceDetails
  slot: AvailabilitySlot
  customer: CustomerDetails
  isConfirming: boolean
  submitError: BookingSubmitError | null
  onConfirm: () => void
  onBack: () => void
  /** Validation 400 — return to the details form to fix fields. */
  onEditDetails: () => void
  /** Conflict 409 — return to the slot grid and pick another time. */
  onPickAnotherTime: () => void
  /** Generic 500 — retry the request. */
  onRetry: () => void
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
  isConfirming,
  submitError,
  onConfirm,
  onBack,
  onEditDetails,
  onPickAnotherTime,
  onRetry,
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

      {submitError && (
        <SubmitErrorAlert
          error={submitError}
          onEditDetails={onEditDetails}
          onPickAnotherTime={onPickAnotherTime}
          onRetry={onRetry}
        />
      )}

      <HStack spacing={3}>
        <Button variant="ghost" onClick={onBack} isDisabled={isConfirming}>
          Back
        </Button>
        <Button
          colorScheme="green"
          onClick={onConfirm}
          isLoading={isConfirming}
          loadingText="Confirming…"
        >
          Confirm booking
        </Button>
      </HStack>
    </VStack>
  )
}

function SubmitErrorAlert({
  error,
  onEditDetails,
  onPickAnotherTime,
  onRetry,
}: {
  error: BookingSubmitError
  onEditDetails: () => void
  onPickAnotherTime: () => void
  onRetry: () => void
}) {
  const isConflict = error.kind === 'conflict'
  const isValidation = error.kind === 'validation'
  return (
    <Alert
      role="alert"
      status={isConflict ? 'warning' : 'error'}
      flexDirection="column"
      alignItems="flex-start"
    >
      <HStack>
        <AlertIcon />
        <AlertTitle>{isConflict ? 'Time no longer available' : 'Could not confirm'}</AlertTitle>
      </HStack>
      <AlertDescription>
        <Text>{error.message}</Text>
        {isValidation && error.fields && (
          <List spacing={1} mt={2} fontSize="sm">
            {Object.entries(error.fields).map(([field, msg]) => (
              <ListItem key={field}>
                <strong>{field}:</strong> {msg}
              </ListItem>
            ))}
          </List>
        )}
      </AlertDescription>
      <HStack spacing={3}>
        {isValidation ? (
          <Button size="sm" onClick={onEditDetails}>
            Fix details
          </Button>
        ) : isConflict ? (
          <Button size="sm" colorScheme="orange" onClick={onPickAnotherTime}>
            Choose another time
          </Button>
        ) : (
          <Button size="sm" onClick={onRetry}>
            Try again
          </Button>
        )}
      </HStack>
    </Alert>
  )
}
