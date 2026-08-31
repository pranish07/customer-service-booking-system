import { Box, SimpleGrid, Skeleton } from '@chakra-ui/react'

export function ServiceListLoading() {
  return (
    <Box>
      <Skeleton height="40px" mb={6} />
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Box key={i}>
            <Skeleton height="180px" mb={3} />
            <Skeleton height="20px" mb={2} />
            <Skeleton height="16px" mb={2} />
            <Skeleton height="16px" width="60%" />
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  )
}
