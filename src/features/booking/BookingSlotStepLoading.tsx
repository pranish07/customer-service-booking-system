import { HStack, SimpleGrid, Skeleton, VStack } from '@chakra-ui/react'

export function BookingSlotStepLoading() {
  return (
    <VStack align="stretch" spacing={4} maxW="640px" role="status" aria-live="polite">
      <HStack justify="space-between">
        <Skeleton height="24px" width="150px" />
        <Skeleton height="28px" width="100px" />
      </HStack>
      <Skeleton height="16px" width="120px" />
      <SimpleGrid columns={{ base: 2, sm: 3 }} spacing={3}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} height="40px" borderRadius="md" />
        ))}
      </SimpleGrid>
    </VStack>
  )
}
