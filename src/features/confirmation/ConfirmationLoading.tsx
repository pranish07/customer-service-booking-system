import { Box, Divider, Skeleton, VStack } from '@chakra-ui/react'

export function ConfirmationLoading() {
  return (
    <VStack align="stretch" spacing={8} maxW="540px" mx="auto" role="status" aria-live="polite">
      <VStack spacing={4} textAlign="center" pt={2}>
        <Skeleton height="72px" width="72px" borderRadius="full" mx="auto" />
        <VStack spacing={1}>
          <Skeleton height="24px" width="180px" mx="auto" />
          <Skeleton height="14px" width="240px" mx="auto" />
        </VStack>
      </VStack>

      <Box borderWidth="1px" borderRadius="md">
        <VStack align="stretch" spacing={2} p={5}>
          <Skeleton height="12px" width="70px" />
          <Skeleton height="20px" width="90px" />
        </VStack>
        <Divider mx={5} />
        <VStack align="stretch" spacing={4} p={5}>
          <RowSkeleton labelWidth="55px" valueWidth="150px" />
          <RowSkeleton labelWidth="60px" valueWidth="120px" />
          <RowSkeleton labelWidth="85px" valueWidth="170px" />
          <RowSkeleton labelWidth="45px" valueWidth="80px" />
        </VStack>
      </Box>

      <Box display="flex" justifyContent="center" gap={3} flexWrap="wrap">
        <Skeleton height="48px" width="180px" borderRadius="md" />
        <Skeleton height="48px" width="180px" borderRadius="md" />
      </Box>
    </VStack>
  )
}

function RowSkeleton({ labelWidth, valueWidth }: { labelWidth: string; valueWidth: string }) {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="baseline">
      <Skeleton height="14px" width={labelWidth} />
      <Skeleton height="16px" width={valueWidth} />
    </Box>
  )
}