import { useLocation } from 'react-router-dom'
import {
  Box,
  Divider,
  HStack,
  SimpleGrid,
  Skeleton,
  SkeletonText,
  VStack,
  Container as ChakraContainer,
} from '@chakra-ui/react'

// Route-aware page skeletons. Each route's lazy chunk loads through a single
// <Suspense> boundary; the fallback must show the skeleton of the page about
// to render rather than a generic placeholder, so a user never sees two
// skeletons flash in sequence (Suspense fallback, then the feature's own
// loading state).
//
// These are pure presentational components (no data hooks) shared by both the
// Suspense fallback and the feature containers' `isLoading` states, keeping a
// single skeleton per page.

export function ServiceListPageSkeleton() {
  return (
    <VStack
      align="stretch"
      spacing={6}
      p={6}
      maxW="1200px"
      mx="auto"
      role="status"
      aria-live="polite"
    >
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

export function ServiceDetailsPageSkeleton() {
  return (
    <VStack
      align="stretch"
      spacing={6}
      maxW="860px"
      mx="auto"
      role="status"
      aria-live="polite"
    >
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

export function BookingPageSkeleton() {
  return (
    <ChakraContainer maxW="860px" py={8}>
    <VStack align="stretch" spacing={6} role="status" aria-live="polite">
      <Box alignSelf="flex-start">
        <Skeleton height="28px" width="150px" />
      </Box>
      <Skeleton height="32px" width="180px" />
      <HStack spacing={2} flexWrap="wrap">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} height="24px" width="72px" borderRadius="full" />
        ))}
      </HStack>
      <VStack align="stretch" spacing={4} maxW="420px">
        <FormFieldSkeleton />
        <SkeletonText noOfLines={1} spacing="4px" width="180px" />
        <Skeleton height="40px" width="170px" borderRadius="md" />
      </VStack>
    </VStack>
    </ChakraContainer>
  )
}

export function ConfirmationPageSkeleton() {
  return (
    <VStack
      align="stretch"
      spacing={8}
      maxW="540px"
      mx="auto"
      role="status"
      aria-live="polite"
    >
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

export function MyBookingsPageSkeleton() {
  return (
    <VStack
      align="stretch"
      spacing={3}
      maxW="720px"
      role="status"
      aria-live="polite"
    >
      <Box alignSelf="flex-start">
        <Skeleton height="28px" width="160px" />
      </Box>
      <Skeleton height="32px" width="180px" />
      <Skeleton height="14px" width="80px" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Box key={i} borderWidth="1px" borderRadius="md" py={3} px={4}>
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

function FormFieldSkeleton() {
  return (
    <VStack align="stretch" spacing={1}>
      <Skeleton height="14px" width="90px" />
      <Skeleton height="40px" borderRadius="md" />
    </VStack>
  )
}

function RowSkeleton({
  labelWidth,
  valueWidth,
}: {
  labelWidth: string
  valueWidth: string
}) {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="baseline">
      <Skeleton height="14px" width={labelWidth} />
      <Skeleton height="16px" width={valueWidth} />
    </Box>
  )
}

// Maps a pathname to the skeleton of the page about to render. Used as the
// Suspense fallback so the correct skeleton appears while that page's lazy
// chunk downloads (and again for the feature's own data-loading state).
export function RoutePageSkeleton() {
  const { pathname } = useLocation()

  if (pathname === '/') return <ServiceListPageSkeleton />
  if (pathname.startsWith('/services/')) {
    if (pathname.endsWith('/book')) return <BookingPageSkeleton />
    return <ServiceDetailsPageSkeleton />
  }
  if (pathname.startsWith('/confirmation')) return <ConfirmationPageSkeleton />
  if (pathname.startsWith('/my-bookings')) return <MyBookingsPageSkeleton />

  return <ServiceListPageSkeleton />
}
