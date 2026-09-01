import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Heading,
  HStack,
  Image,
  Skeleton,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { BackIcon } from '@/components/BackIcon'
import type { ServiceDetails } from '@/types'

interface ServiceDetailsContentProps {
  service: ServiceDetails
  availabilitySummary: string
  availabilityLoading: boolean
  onBook: () => void
}

function formatPrice(currency: string, minorUnits: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(minorUnits)
}

export function ServiceDetailsContent({
  service,
  availabilitySummary,
  availabilityLoading,
  onBook,
}: ServiceDetailsContentProps) {
  const price = formatPrice(service.currency, service.price)

  return (
    <VStack align="stretch" spacing={6} maxW="860px" mx="auto">
      <Box alignSelf="flex-start">
        <Button variant="ghost" size="sm" as={RouterLink} to="/" leftIcon={<BackIcon />}>
          Back to services
        </Button>
      </Box>
      {service.imageUrl && (
        <Image
          src={service.imageUrl}
          alt={service.name}
          height="300px"
          objectFit="cover"
          borderRadius="lg"
        />
      )}
      <Card>
        <CardBody>
          <HStack spacing={2} mb={1}>
            <Badge colorScheme="blue" variant="subtle">
              {service.category}
            </Badge>
            <Badge colorScheme="yellow" variant="subtle">
              ★ {service.averageRating.toFixed(1)}
            </Badge>
          </HStack>
          <Heading size="xl" mb={1}>
            {service.name}
          </Heading>
          <Text color="gray.500">{service.description}</Text>

          <Divider my={4} />

          <Box
            display="grid"
            gridTemplateColumns={{ base: '1fr 1fr', sm: 'repeat(3, 1fr)' }}
            gap={4}
          >
            <Stat>
              <StatLabel>Price</StatLabel>
              <StatNumber fontSize="lg" color="green.600">
                {price}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Duration</StatLabel>
              <StatNumber fontSize="lg">
                {service.durationMinutes} min
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Provider</StatLabel>
              <StatNumber fontSize="lg" color="gray.700">
                {service.provider}
              </StatNumber>
            </Stat>
          </Box>

          <Text color="gray.600" mt={4}>
            {service.longDescription}
          </Text>

          <Text mt={4} fontSize="sm" color="gray.500">
            Location: {service.location}
          </Text>

          <HStack justify="space-between" mt={6} flexWrap="wrap" spacing={4}>
            {availabilityLoading ? (
              <Skeleton height="16px" width="220px" role="status" aria-live="polite" />
            ) : (
              <Text fontSize="sm" color="gray.600">
                {availabilitySummary}
              </Text>
            )}
            <Button colorScheme="green" size="lg" onClick={onBook}>
              Book this service
            </Button>
          </HStack>
        </CardBody>
      </Card>
    </VStack>
  )
}
