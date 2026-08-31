import { Box, Skeleton, VStack } from '@chakra-ui/react'

export function ServiceDetailsLoading() {
  return (
    <VStack align="stretch" spacing={6} maxW="860px" mx="auto">
      <Skeleton height="300px" borderRadius="lg" />
      <Box>
        <Skeleton height="24px" width="180px" mb={2} />
        <Skeleton height="40px" mb={2} />
        <Skeleton height="16px" mb={4} />
        <Skeleton height="120px" />
      </Box>
    </VStack>
  )
}
