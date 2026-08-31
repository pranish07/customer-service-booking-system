import { Badge, HStack, Text } from '@chakra-ui/react'
import type { BookingStep } from './bookingFlow'

const STEPS: { key: BookingStep; label: string }[] = [
  { key: 'date', label: 'Date' },
  { key: 'slot', label: 'Time' },
  { key: 'details', label: 'Details' },
  { key: 'summary', label: 'Summary' },
]

const ORDER: BookingStep[] = ['date', 'slot', 'details', 'summary']

interface BookingStepperProps {
  current: BookingStep
}

export function BookingStepper({ current }: BookingStepperProps) {
  const currentIndex = ORDER.indexOf(current)
  return (
    <HStack spacing={2} flexWrap="wrap">
      {STEPS.map((step, index) => {
        const active = index === currentIndex
        const done = index < currentIndex
        return (
          <Badge
            key={step.key}
            colorScheme={done ? 'green' : active ? 'blue' : 'gray'}
            variant={done || active ? 'solid' : 'subtle'}
            px={3}
            py={1}
          >
            <Text as="span" fontSize="sm">
              {index + 1}. {step.label}
            </Text>
          </Badge>
        )
      })}
    </HStack>
  )
}
