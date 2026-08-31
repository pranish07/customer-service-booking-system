import {
  Badge,
  Box,
  Card,
  CardBody,
  CardFooter,
  Heading,
  Image,
  Text,
} from '@chakra-ui/react'
import type { Service } from '@/types'

interface ServiceCardProps {
  service: Service
  onClick: (serviceId: string) => void
}

export function ServiceCard({ service, onClick }: ServiceCardProps) {
  const price = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: service.currency,
    minimumFractionDigits: 2,
  }).format(service.price)

  return (
    <Card
      overflow="hidden"
      cursor="pointer"
      onClick={() => onClick(service.id)}
      transition="transform 0.2s"
      _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg' }}
    >
      {service.imageUrl && (
        <Image
          src={service.imageUrl}
          alt={service.name}
          height="180px"
          objectFit="cover"
        />
      )}
      <CardBody>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Badge colorScheme="blue" variant="subtle">
            {service.category}
          </Badge>
        </Box>
        <Heading size="md" mb={1}>
          {service.name}
        </Heading>
        <Text color="gray.600" noOfLines={2} mb={2}>
          {service.description}
        </Text>
        <Text fontSize="sm" color="gray.500">
          {service.durationMinutes} min
        </Text>
      </CardBody>
      <CardFooter>
        <Text fontWeight="bold" fontSize="lg" color="green.600">
          {price}
        </Text>
      </CardFooter>
    </Card>
  )
}
