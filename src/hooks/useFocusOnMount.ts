import { useEffect, useRef } from 'react'

/**
 * Focuses an element the first time it mounts. Used to move keyboard/Screen
 * Reader focus to error banners when they appear so the newly-rendered
 * announcement is not silently skipped by assistive tech.
 *
 * The returned ref should be attached to an element with `tabIndex={-1}`
 * (non-interactive content is not focusable by default).
 */
export function useFocusOnMount<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    ref.current?.focus()
  }, [])
  return ref
}
