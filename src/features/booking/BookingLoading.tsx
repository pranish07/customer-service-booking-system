import { Skeleton, SkeletonText, VStack } from '@chakra-ui/react'

export function BookingLoading() {
  return (
    <VStack align="stretch" spacing={4} maxW="420px" role="status" aria-live="polite">
      <Skeleton height="16px" width="110px" />
      <FormControlSkeleton />
      <SkeletonText noOfLines={1} spacing="4px" width="160px" />
      <Skeleton height="40px" width="180px" borderRadius="md" />
    </VStack>
  )
}

function FormControlSkeleton() {
  return (
    <VStack align="stretch" spacing={1}>
      <Skeleton height="14px" width="90px" />
      <Skeleton height="40px" borderRadius="md" />
    </VStack>
  )
}
