'use client'

import Link from 'next/link'

const footerLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Contact', href: '/contact' },
]

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-10 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <div className="text-sm text-white/40">
          <span className="font-black text-orange-500 uppercase">DataAI</span>
          <span className="mx-2">·</span>
          <span>© 2026 DataAI. All rights reserved.</span>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-white/40">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-medium uppercase tracking-wide transition-colors hover:text-white/70"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
