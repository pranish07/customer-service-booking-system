import { createIcon } from '@chakra-ui/react'

export const BackIcon = createIcon({
  displayName: 'BackIcon',
  viewBox: '0 0 24 24',
  path: (
    <path
      d="M19 12H5M5 12L12 5M5 12L12 19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
})
