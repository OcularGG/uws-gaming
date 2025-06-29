'use client'

import { usePathname } from 'next/navigation'
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Hide navigation and footer on auth pages
  const isAuthPage = pathname?.startsWith('/auth/')

  if (isAuthPage) {
    return (
      <main className="min-h-screen">
        {children}
      </main>
    )
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  )
}
