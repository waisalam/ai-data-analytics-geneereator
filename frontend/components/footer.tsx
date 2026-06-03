'use client'
import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-black/95 p-10 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.95)] backdrop-blur-xl">
          <div className="grid gap-10 md:grid-cols-[1.4fr_0.9fr_0.9fr_1.1fr]">
            <div className="space-y-4">
              <h3 className="text-2xl font-black uppercase tracking-[0.22em] text-white">DataViz</h3>
              <p className="max-w-md text-sm text-slate-400 leading-relaxed">
                Turn raw data into meaningful insights with a refined analytics platform built for clarity, speed, and modern teams.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-400">Explore</h4>
              <div className="space-y-2">
                {[
                  { label: 'Home', href: '/' },
                  { label: 'Services', href: '/services' },
                  { label: 'Work', href: '/work' },
                  { label: 'About', href: '/about' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-sm text-slate-300 transition duration-300 hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-400">Services</h4>
              <div className="space-y-2 text-sm text-slate-300 leading-relaxed">
                {['Data Analysis', 'Visualization', 'Reporting', 'Consulting'].map((service) => (
                  <p key={service} className="transition duration-300 hover:text-white">
                    {service}
                  </p>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-400">Contact</h4>
              <div className="space-y-4 text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 text-orange-400" />
                  <p>waisalam9523@gmail.com</p>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-5 w-5 text-orange-400" />
                  <p>+91 9523728021</p>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-orange-400" />
                  <p>Ranchi, Jharkhand, India</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>© 2026 DataViz. All rights reserved.</p>
            <div className="flex flex-wrap gap-4">
              {['Privacy', 'Terms', 'Cookies'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="transition duration-300 hover:text-white"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
