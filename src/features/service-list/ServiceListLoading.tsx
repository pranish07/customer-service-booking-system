import { Box, HStack, SimpleGrid, Skeleton, SkeletonText, VStack } from '@chakra-ui/react'

export function ServiceListLoading() {
  return (
    <VStack align="stretch" spacing={6} p={6} maxW="1200px" mx="auto" role="status" aria-live="polite">
      <Skeleton height="32px" width="140px" />
      <HStack spacing={4} flexWrap="wrap">
        <Box flex="1" minW="240px">
          <Skeleton height="40px" borderRadius="md" />
        </Box>
        <Skeleton height="40px" width="220px" borderRadius="md" />
      </HStack>
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Box key={i} borderWidth="1px" borderRadius="lg" overflow="hidden">
            <Skeleton height="180px" borderRadius="0" />
            <Box p={4}>
              <Skeleton height="18px" width="70px" mb={2} borderRadius="full" />
              <Skeleton height="20px" width="70%" mb={2} />
              <SkeletonText noOfLines={2} spacing="4px" mb={2} />
              <Skeleton height="14px" width="60px" />
            </Box>
            <Box px={4} pb={4}>
              <Skeleton height="20px" width="80px" />
            </Box>
          </Box>
        ))}
      </SimpleGrid>
    </VStack>
  )
}