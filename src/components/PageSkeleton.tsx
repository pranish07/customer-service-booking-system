import { Box, Divider, HStack, Skeleton, SkeletonText, VStack } from '@chakra-ui/react'

export function PageSkeleton() {
  return (
    <Box maxW="860px" mx="auto" py={8} role="status" aria-live="polite">
      <VStack align="stretch" spacing={6}>
        <Skeleton height="28px" width="150px" />
        <Skeleton height="32px" width="240px" />
        <Box borderWidth="1px" borderRadius="lg" p={6}>
          <SkeletonText noOfLines={4} spacing="10px" />
          <Divider my={6} />
          <HStack spacing={4}>
            <Skeleton height="40px" width="150px" borderRadius="md" />
            <Skeleton height="40px" width="120px" borderRadius="md" />
          </HStack>
        </Box>
      </VStack>
    </Box>
  )
}