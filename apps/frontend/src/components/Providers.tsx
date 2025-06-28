'use client'

import { SessionProvider } from 'next-auth/react'
import { SiteProvider } from '@/contexts/SiteContext'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <SiteProvider>
        {children}
      </SiteProvider>
    </SessionProvider>
  )
}
