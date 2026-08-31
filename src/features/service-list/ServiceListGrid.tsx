import { SimpleGrid } from '@chakra-ui/react'
import type { Service } from '@/types'
import { ServiceCard } from './ServiceCard'

interface ServiceListGridProps {
  services: Service[]
  onSelectService: (serviceId: string) => void
}

export function ServiceListGrid({ services, onSelectService }: ServiceListGridProps) {
  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6}>
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          onClick={onSelectService}
        />
      ))}
    </SimpleGrid>
  )
}
