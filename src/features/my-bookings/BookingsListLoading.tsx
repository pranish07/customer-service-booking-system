import { Box, Skeleton, VStack } from '@chakra-ui/react'

export function BookingsListLoading() {
  return (
    <VStack align="stretch" spacing={3} role="status" aria-live="polite">
      <Skeleton height="14px" width="80px" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Box
          key={i}
          borderWidth="1px"
          borderRadius="md"
          py={3}
          px={4}
        >
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Skeleton height="16px" width="140px" />
            <Skeleton height="14px" width="70px" borderRadius="full" />
          </Box>
          <Skeleton height="14px" width="100px" mb={1} />
          <Skeleton height="14px" width="160px" mb={1} />
          <Skeleton height="12px" width="80px" />
        </Box>
      ))}
    </VStack>
  )
}
