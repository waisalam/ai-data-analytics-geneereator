'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import {useSession} from "next-auth/react"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const session = useSession()
  useEffect(()=>{
    if(session.status === 'authenticated'){
      setLoggedIn(true)
    }else{
      setLoggedIn(false)
    }
  }, [session.status])

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'Work', href: '/work' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-2xl shadow-[0_18px_50px_-30px_rgba(0,0,0,0.95)]">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3 sm:h-20 sm:gap-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-orange-500/20 bg-white/5 text-orange-400 shadow-[0_15px_40px_-25px_rgba(249,115,22,0.7)] sm:h-12 sm:w-12 sm:rounded-3xl">
              <span className="font-black text-lg tracking-tight">DA</span>
            </div>
            <span className="hidden text-lg font-black uppercase tracking-[0.24em] text-white sm:block sm:text-xl">
              DataViz
            </span>
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-300 transition duration-300 hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </Link>
            ))}

            {loggedIn ? (
              <Link
                  href="/dashboard"
                  className="rounded-full bg-orange-500 px-6 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-950 shadow-[0_14px_38px_-18px_rgba(249,115,22,0.9)] transition duration-300 hover:bg-orange-400"
                >
                  Dashboard
                </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-200 transition duration-300 hover:border-orange-500/50 hover:bg-white/10 hover:text-white"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full bg-orange-500 px-6 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-950 shadow-[0_14px_38px_-18px_rgba(249,115,22,0.9)] transition duration-300 hover:bg-orange-400"
                >
                  SignUp
                </Link>
              </>
            )}
            
          </div>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white transition duration-300 hover:border-orange-500 hover:text-orange-400 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="mt-3 space-y-2 rounded-[1.5rem] border border-white/10 bg-black/98 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl sm:mt-4 sm:space-y-3 sm:rounded-[2rem] sm:p-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-3xl px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-slate-200 transition duration-300 hover:bg-white/10 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
               {loggedIn ? (
              <Link
                  href="/dashboard"
                  className="rounded-full bg-orange-500 px-6 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-950 shadow-[0_14px_38px_-18px_rgba(249,115,22,0.9)] transition duration-300 hover:bg-orange-400"
                >
                  Dashboard
                </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-200 transition duration-300 hover:border-orange-500/50 hover:bg-white/10 hover:text-white"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full bg-orange-500 px-6 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-950 shadow-[0_14px_38px_-18px_rgba(249,115,22,0.9)] transition duration-300 hover:bg-orange-400"
                >
                  SignUp
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
