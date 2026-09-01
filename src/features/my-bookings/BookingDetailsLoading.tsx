import { Box, Divider, HStack, Skeleton, VStack } from '@chakra-ui/react'

export function BookingDetailsLoading() {
  return (
    <VStack align="stretch" spacing={4} maxW="520px" role="status" aria-live="polite">
      <HStack justify="space-between">
        <Skeleton height="24px" width="140px" />
        <Skeleton height="28px" width="110px" />
      </HStack>
      <VStack align="stretch" spacing={3}>
        <RowSkeleton labelWidth="110px" valueWidth="90px" />
        <RowSkeleton labelWidth="60px" valueWidth="160px" />
        <RowSkeleton labelWidth="65px" valueWidth="120px" />
        <RowSkeleton labelWidth="90px" valueWidth="170px" />
        <RowSkeleton labelWidth="50px" valueWidth="80px" />
      </VStack>
      <Divider />
      <VStack align="stretch" spacing={2}>
        <Skeleton height="14px" width="70px" />
        <Skeleton height="16px" width="140px" />
        <Skeleton height="16px" width="180px" />
        <Skeleton height="16px" width="120px" />
      </VStack>
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
