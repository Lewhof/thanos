'use client'

import { useState, useEffect } from 'react'

/**
 * Returns true when the viewport width is less than 768px (Tailwind's `md` breakpoint).
 * SSR-safe: returns false on the server to avoid hydration mismatch.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return isMobile
}
