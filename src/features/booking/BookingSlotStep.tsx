import {
  Box,
  Button,
  Heading,
  HStack,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react'
import type { AvailabilitySlot } from '@/types'

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
}

interface BookingSlotStepProps {
  date: string
  slots: AvailabilitySlot[]
  selectedSlotId: string | null
  isLoading: boolean
  onSelectSlot: (slot: AvailabilitySlot) => void
  onBack: () => void
}

export function BookingSlotStep({
  date,
  slots,
  selectedSlotId,
  isLoading,
  onSelectSlot,
  onBack,
}: BookingSlotStepProps) {
  return (
    <VStack align="stretch" spacing={4} maxW="640px">
      <HStack justify="space-between">
        <Heading size="md">Available times</Heading>
        <Button variant="ghost" size="sm" onClick={onBack}>
          Change date
        </Button>
      </HStack>
      <Text color="gray.600">For {date}</Text>

      {isLoading ? (
        <Box textAlign="center" py={8}>
          <Spinner />
        </Box>
      ) : slots.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Text color="gray.600">No available time slots on this date.</Text>
          <Text fontSize="sm" color="gray.500">
            Please choose a different date.
          </Text>
          <Button variant="outline" size="sm" mt={4} onClick={onBack}>
            Change date
          </Button>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 2, sm: 3 }} spacing={3}>
          {slots.map((slot) => {
            const isBooked = slot.status === 'booked'
            const isSelected = slot.id === selectedSlotId
            return (
              <Button
                key={slot.id}
                isDisabled={isBooked}
                variant={isSelected ? 'solid' : 'outline'}
                colorScheme={isSelected ? 'green' : isBooked ? 'gray' : 'green'}
                onClick={() => onSelectSlot(slot)}
              >
                {formatTime(slot.startTime)}
                {isBooked ? ' · Booked' : ''}
              </Button>
            )
          })}
        </SimpleGrid>
      )}
    </VStack>
  )
}
