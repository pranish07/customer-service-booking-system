import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
} from '@chakra-ui/react'

interface BookingDateStepProps {
  minDate: string
  maxDate: string
  value: string
  onChange: (date: string) => void
  onContinue: () => void
}

export function BookingDateStep({
  minDate,
  maxDate,
  value,
  onChange,
  onContinue,
}: BookingDateStepProps) {
  return (
    <VStack align="stretch" spacing={4} maxW="420px">
      <FormControl>
        <FormLabel>Select a date</FormLabel>
        <Input
          type="date"
          min={minDate}
          max={maxDate}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </FormControl>
      <Text fontSize="sm" color="gray.500">
        {minDate} — {maxDate}
      </Text>
      <Button
        colorScheme="green"
        isDisabled={!value}
        onClick={onContinue}
        alignSelf="flex-start"
      >
        Show available times
      </Button>
    </VStack>
  )
}
