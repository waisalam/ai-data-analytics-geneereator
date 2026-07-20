'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useSession } from 'next-auth/react'

const navLinks = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Blog', href: '/blog' },
]

export function Navbar() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const session = useSession()

  useEffect(() => {
    setLoggedIn(session.status === 'authenticated')
  }, [session.status])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenuOpen(false)
  }

  const linkClass = (href: string) =>
    `text-sm font-bold tracking-wide uppercase transition-colors ${
      pathname === href ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
    }`

  const authLinks = loggedIn ? (
    <Link
      href="/dashboard"
      className="bg-primary px-4 py-2 text-sm font-bold tracking-wide text-primary-foreground uppercase transition-colors hover:bg-primary/90 sm:px-5"
    >
      Dashboard
    </Link>
  ) : (
    <>
      <Link
        href="/login"
        className="text-sm font-bold tracking-wide text-foreground uppercase transition-colors hover:text-primary"
      >
        Login
      </Link>
      <Link
        href="/signup"
        className="bg-primary px-4 py-2 text-sm font-bold tracking-wide text-primary-foreground uppercase transition-colors hover:bg-primary/90 sm:px-5"
      >
        Get Started
      </Link>
    </>
  )

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-border/10 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-heading text-xl tracking-tight text-primary uppercase"
        >
          DataAI
        </Link>

        <div className="hidden items-center gap-5 sm:gap-6 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
          {isHome && (
            <button
              type="button"
              onClick={scrollToHowItWorks}
              className="text-sm font-bold tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              How It Works
            </button>
          )}
          {authLinks}
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center border border-border text-foreground transition-colors hover:border-primary hover:text-primary md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border/10 bg-background/95 px-4 py-4 backdrop-blur-md md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`py-2 text-sm font-bold tracking-wide uppercase ${
                  pathname === link.href ? 'text-primary' : 'text-foreground'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isHome && (
              <button
                type="button"
                onClick={scrollToHowItWorks}
                className="py-2 text-left text-sm font-bold tracking-wide text-foreground uppercase"
              >
                How It Works
              </button>
            )}
            {loggedIn ? (
              <Link
                href="/dashboard"
                className="bg-primary px-4 py-3 text-center text-sm font-bold tracking-wide text-primary-foreground uppercase"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="py-2 text-sm font-bold tracking-wide text-foreground uppercase"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-primary px-4 py-3 text-center text-sm font-bold tracking-wide text-primary-foreground uppercase"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
