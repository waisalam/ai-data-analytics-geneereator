'use client'

import Link from 'next/link'
import { Mail, MapPin, Phone, Send } from 'lucide-react'
import { useState } from 'react'

const contactMethods = [
  {
    icon: Mail,
    title: 'Email',
    value: 'waisalam9523@gmail.com',
    href: 'mailto:waisalam9523@gmail.com',
  },
  {
    icon: Phone,
    title: 'Phone',
    value: '+91 9523728021',
    href: 'tel:+919523728021',
  },
  {
    icon: MapPin,
    title: 'Location',
    value: 'Ranchi, Jharkhand, India',
    href: 'https://maps.google.com/?q=Ranchi,Jharkhand,India',
  },
]

const faqs = [
  {
    q: 'How long does analysis take?',
    a: 'Most CSV files are analyzed in seconds. Very large datasets may take a few minutes.',
  },
  {
    q: 'Can I export my charts?',
    a: 'Yes — export professional PDF reports with charts and AI explanations in one click.',
  },
  {
    q: 'Is my data secure?',
    a: 'We treat your data with care. Analyses are tied to your account and not shared publicly.',
  },
  {
    q: 'Is there a free plan?',
    a: 'Yes. Start free with monthly analysis limits — upgrade to Pro when you need unlimited access.',
  },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setFormData({ name: '', email: '', message: '' })
  }

  const inputClass =
    'w-full border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-orange-500 focus:outline-none transition-colors'

  return (
    <div className="bg-black text-white">
      {/* Hero */}
      <section className="landing-grid-pattern border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="inline-flex items-center gap-2 border border-white/15 bg-white/5 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-orange-500 animate-landing-pulse-dot" />
            <span className="text-xs font-bold tracking-widest text-white/80 uppercase">
              Get In Touch
            </span>
          </div>
          <h1 className="mt-8 max-w-3xl text-4xl font-black tracking-tight uppercase sm:text-5xl md:text-6xl">
            Contact <span className="text-orange-500">DataAI</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg">
            Questions, feedback, or partnership ideas — we would love to hear from you. Reach out
            anytime.
          </p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-3">
            {contactMethods.map((method) => {
              const Icon = method.icon
              return (
                <a
                  key={method.title}
                  href={method.href}
                  target={method.title === 'Location' ? '_blank' : undefined}
                  rel={method.title === 'Location' ? 'noopener noreferrer' : undefined}
                  className="group border border-white/10 border-l-4 border-l-transparent bg-white/5 p-6 transition-all duration-300 hover:border-l-orange-500 hover:bg-white/[0.07]"
                >
                  <Icon className="h-8 w-8 text-orange-500" strokeWidth={1.75} />
                  <h3 className="mt-4 text-lg font-black tracking-wide uppercase">
                    {method.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-400 transition-colors group-hover:text-orange-400">
                    {method.value}
                  </p>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="border-b border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <h2 className="text-3xl font-black tracking-tight uppercase sm:text-4xl">
            Send A Message
          </h2>
          <p className="mt-4 text-gray-400">We typically respond within 24–48 hours.</p>

          {submitted ? (
            <div className="mt-10 border border-orange-500/40 bg-orange-500/10 p-8 text-center">
              <p className="text-lg font-black uppercase text-orange-400">Message Sent</p>
              <p className="mt-3 text-sm text-gray-400">
                Thanks for reaching out. We will get back to you soon.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-6 text-sm font-bold text-white uppercase underline-offset-4 hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 space-y-6 border border-white/10 bg-white/5 p-6 sm:p-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-xs font-bold tracking-widest text-white/60 uppercase"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-bold tracking-widest text-white/60 uppercase"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="you@company.com"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-xs font-bold tracking-widest text-white/60 uppercase"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className={`${inputClass} resize-none`}
                  placeholder="Tell us how we can help..."
                />
              </div>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 bg-orange-500 py-4 text-sm font-black tracking-wide text-black uppercase transition-colors hover:bg-orange-400"
              >
                Send Message
                <Send className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="landing-grid-pattern">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-black tracking-tight uppercase sm:text-4xl">FAQ</h2>
            <p className="mt-4 text-gray-400">Quick answers before you reach out</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="border border-white/10 bg-white/5 p-6 transition-colors hover:border-white/20"
              >
                <h3 className="text-sm font-black tracking-wide text-orange-500 uppercase">
                  {faq.q}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
          <p className="mt-12 text-center text-sm text-gray-500">
            Want to try it yourself?{' '}
            <Link href="/signup" className="font-bold text-orange-500 uppercase hover:text-orange-400">
              Get started free →
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
