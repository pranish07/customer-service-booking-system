import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  VStack,
} from '@chakra-ui/react'
import { BackIcon } from '@/components/BackIcon'
import {
  customerDetailsSchema,
  type CustomerDetailsFormValues,
} from './customerDetailsSchema'

interface CustomerDetailsFormProps {
  initialValues: CustomerDetailsFormValues | null
  onSubmit: (values: CustomerDetailsFormValues) => void
  onBack: () => void
}

export function CustomerDetailsForm({
  initialValues,
  onSubmit,
  onBack,
}: CustomerDetailsFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerDetailsFormValues>({
    resolver: zodResolver(customerDetailsSchema),
    defaultValues: initialValues ?? {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      address: '',
    },
  })

  // noValidate disables the browser's built-in constraint validation (e.g. the
  // HTML5 email check) so RHF + the Zod schema are the single source of field
  // errors, surfaced consistently through FormErrorMessage.
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <VStack align="stretch" spacing={4} maxW="480px">
        <Controller
          name="customerName"
          control={control}
          render={({ field }) => (
            <FormControl isInvalid={!!errors.customerName}>
              <FormLabel>Full name</FormLabel>
              <Input {...field} placeholder="Jane Doe" />
              <FormErrorMessage>
                {errors.customerName?.message}
              </FormErrorMessage>
            </FormControl>
          )}
        />
        <Controller
          name="customerEmail"
          control={control}
          render={({ field }) => (
            <FormControl isInvalid={!!errors.customerEmail}>
              <FormLabel>Email</FormLabel>
              <Input {...field} type="email" placeholder="jane@example.com" />
              <FormErrorMessage>
                {errors.customerEmail?.message}
              </FormErrorMessage>
            </FormControl>
          )}
        />
        <Controller
          name="customerPhone"
          control={control}
          render={({ field }) => (
            <FormControl isInvalid={!!errors.customerPhone}>
              <FormLabel>Phone (optional)</FormLabel>
              <Input {...field} placeholder="+1-555-0100" />
              <FormErrorMessage>
                {errors.customerPhone?.message}
              </FormErrorMessage>
            </FormControl>
          )}
        />
        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <FormControl isInvalid={!!errors.address}>
              <FormLabel>Address</FormLabel>
              <Input {...field} placeholder="123 Main St, Springfield" />
              <FormErrorMessage>{errors.address?.message}</FormErrorMessage>
            </FormControl>
          )}
        />
        <HStack spacing={3} pt={2}>
          <Button variant="ghost" onClick={onBack} leftIcon={<BackIcon />}>
            Back
          </Button>
          <Button type="submit" colorScheme="green">
            Review booking
          </Button>
        </HStack>
      </VStack>
    </form>
  )
}
