'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideChrome =
    pathname === '/analyze' || pathname.startsWith('/analyze/result')

  return (
    <>
      {!hideChrome && <Navbar />}
      <main className={hideChrome ? 'flex-1' : 'flex-1 pt-16'}>{children}</main>
      {!hideChrome && <Footer />}
    </>
  )
}
