import { Box, Divider, HStack, Skeleton, SkeletonText, VStack } from '@chakra-ui/react'

export function ServiceDetailsLoading() {
  return (
    <VStack align="stretch" spacing={6} maxW="860px" mx="auto" role="status" aria-live="polite">
      <Box alignSelf="flex-start">
        <Skeleton height="28px" width="160px" />
      </Box>
      <Skeleton height="300px" borderRadius="lg" />
      <Box borderWidth="1px" borderRadius="lg" p={6}>
        <HStack spacing={2} mb={3}>
          <Skeleton height="20px" width="80px" borderRadius="full" />
          <Skeleton height="20px" width="70px" borderRadius="full" />
        </HStack>
        <Skeleton height="32px" width="60%" mb={2} />
        <Skeleton height="16px" width="80%" mb={4} />
        <Divider my={4} />
        <HStack spacing={8} mb={4}>
          <Box>
            <Skeleton height="12px" width="40px" mb={1} />
            <Skeleton height="20px" width="60px" />
          </Box>
          <Box>
            <Skeleton height="12px" width="50px" mb={1} />
            <Skeleton height="20px" width="70px" />
          </Box>
          <Box>
            <Skeleton height="12px" width="55px" mb={1} />
            <Skeleton height="20px" width="80px" />
          </Box>
        </HStack>
        <SkeletonText noOfLines={4} spacing="8px" mb={4} />
        <Skeleton height="14px" width="120px" mb={6} />
        <HStack justify="space-between" flexWrap="wrap" spacing={4}>
          <Skeleton height="16px" width="200px" />
          <Skeleton height="48px" width="160px" borderRadius="md" />
        </HStack>
      </Box>
    </VStack>
  )
}
