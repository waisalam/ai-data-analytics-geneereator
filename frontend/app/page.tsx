'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  BarChart3,
  Check,
  Download,
  FileText,
  History,
  MessageSquare,
  Sparkles,
  Upload,
  Wand2,
} from 'lucide-react'

function AnimateOnScroll({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.65s ease-out ${delay}ms, transform 0.65s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

function scrollToHowItWorks() {
  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
}

const barHeights = [42, 68, 55, 82, 48, 72, 60, 88, 52, 76]

const features = [
  {
    icon: Wand2,
    title: 'Auto Data Cleaning',
    description:
      'Automatically fixes missing values, wrong formats, and messy data before analysis.',
  },
  {
    icon: BarChart3,
    title: 'Smart Chart Generation',
    description:
      'Detects your data types and generates the most relevant charts automatically. No configuration needed.',
  },
  {
    icon: MessageSquare,
    title: 'AI Chat Interface',
    description:
      'Ask questions about your data in plain English and get instant, accurate answers with context.',
  },
  {
    icon: Download,
    title: 'PDF Export',
    description:
      'Download a professional PDF report with all your charts and AI explanations in one click.',
  },
  {
    icon: History,
    title: 'Analysis History',
    description:
      'All your past analyses saved automatically. Come back anytime and continue where you left off.',
  },
  {
    icon: FileText,
    title: 'Multi-format Support',
    description:
      'Works with any CSV file from any source — Excel exports, database dumps, API data, anything.',
  },
]

const steps = [
  {
    num: '01',
    icon: Upload,
    title: 'Upload Your CSV',
    description:
      'Drop any CSV file — messy data, missing values, wrong formats. We handle it all automatically.',
  },
  {
    num: '02',
    icon: Sparkles,
    title: 'AI Analyzes Everything',
    description:
      'Our AI cleans your data, detects patterns, and generates relevant charts automatically. No setup needed.',
  },
  {
    num: '03',
    icon: MessageSquare,
    title: 'Chat With Your Data',
    description:
      'Ask questions in plain English. Get instant answers, trends, comparisons, and explanations about your data.',
  },
]

export default function HomePage() {
  return (
    <div className="bg-black text-white">
      <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden bg-black">
        <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
          <div className="space-y-8">
            <div
              className="animate-landing-fade-in inline-flex items-center gap-2 border border-white/15 bg-white/5 px-3 py-1.5"
              style={{ animationDelay: '0ms' }}
            >
              <span className="h-2 w-2 rounded-full bg-orange-500 animate-landing-pulse-dot" />
              <span className="text-xs font-bold tracking-widest text-white/80 uppercase">
                AI Powered Analytics
              </span>
            </div>

            <h1
              className="animate-landing-fade-in text-4xl leading-[1.05] font-black tracking-tight uppercase sm:text-5xl md:text-6xl lg:text-7xl"
              style={{ animationDelay: '100ms' }}
            >
              AI Analytics
              <br />
              That Does The
              <br />
              <span className="text-orange-500">Work For You</span>
            </h1>

            <p
              className="animate-landing-fade-in max-w-xl text-base leading-relaxed text-gray-400 sm:text-lg"
              style={{ animationDelay: '200ms' }}
            >
              Upload any CSV file and get instant AI-powered insights. Auto-clean messy data,
              generate beautiful charts, and chat with your data in plain English. No analyst
              needed.
            </p>

            <div
              className="animate-landing-fade-in flex flex-col gap-4 sm:flex-row sm:items-center"
              style={{ animationDelay: '300ms' }}
            >
              <Link
                href="/analyze"
                className="inline-flex items-center justify-center gap-2 bg-orange-500 px-8 py-4 text-sm font-black tracking-wide text-black uppercase transition-colors hover:bg-orange-400"
              >
                Get Started Free →
              </Link>
              <button
                type="button"
                onClick={scrollToHowItWorks}
                className="inline-flex items-center justify-center border border-white px-8 py-4 text-sm font-bold tracking-wide text-white uppercase transition-colors hover:bg-white/5"
              >
                See How It Works
              </button>
            </div>

            <div
              className="animate-landing-fade-in flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 sm:text-sm"
              style={{ animationDelay: '400ms' }}
            >
              {['Free forever', 'No credit card', 'Setup in 30 seconds'].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-orange-500" strokeWidth={3} />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div
            className="animate-landing-fade-in relative"
            style={{ animationDelay: '250ms' }}
          >
            <div
              className="absolute -inset-4 bg-orange-500/20 blur-3xl"
              aria-hidden
            />
            <div className="relative border border-white/10 bg-white/5 p-6 shadow-[0_0_80px_-12px_rgba(249,115,22,0.45)] sm:p-8">
              <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-xs font-bold tracking-widest text-white/50 uppercase">
                  Dashboard Preview
                </span>
                <span className="h-2 w-2 bg-orange-500 animate-landing-pulse-dot" />
              </div>

              <div className="mb-6 flex h-36 items-end justify-between gap-1.5 sm:h-44">
                {barHeights.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-orange-500/90 transition-all duration-300 hover:bg-orange-400"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>

              <div className="space-y-3">
                <div className="max-w-[85%] border border-white/10 bg-white/5 p-3 text-sm">
                  <p className="mb-1 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                    You
                  </p>
                  <p className="text-white/90">Why did revenue drop in March?</p>
                </div>
                <div className="ml-auto max-w-[90%] border border-orange-500/30 bg-orange-500/10 p-3 text-sm">
                  <p className="mb-1 text-[10px] font-bold tracking-wider text-orange-500 uppercase">
                    AI
                  </p>
                  <p className="text-white/90">
                    Revenue dropped 23% in March due to seasonal slowdown and reduced enterprise
                    renewals in the APAC region.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="landing-grid-pattern relative border-t border-white/10 bg-black py-24 sm:py-32"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll className="mb-16 text-center">
            <h2 className="text-3xl font-black tracking-tight uppercase sm:text-4xl md:text-5xl">
              How It Works
            </h2>
            <p className="mt-4 text-gray-400">Three steps to instant insights</p>
          </AnimateOnScroll>

          <div className="relative grid gap-12 md:grid-cols-3 md:gap-8">
            <div
              className="pointer-events-none absolute top-16 right-[16.67%] left-[16.67%] hidden h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent md:block"
              aria-hidden
            />

            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <AnimateOnScroll key={step.num} delay={index * 200} className="relative">
                  <div className="relative z-10 flex flex-col items-center text-center md:items-start md:text-left">
                    <span className="text-5xl font-black text-orange-500 sm:text-6xl">
                      {step.num}
                    </span>
                    <div className="mt-6 mb-4 flex h-14 w-14 items-center justify-center border border-orange-500/30 bg-orange-500/10">
                      <Icon className="h-7 w-7 text-orange-500" strokeWidth={1.75} />
                    </div>
                    <h3 className="text-xl font-black tracking-wide uppercase">{step.title}</h3>
                    <p className="mt-3 max-w-sm text-sm leading-relaxed text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </AnimateOnScroll>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-white/10 bg-white/[0.03] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll className="mb-16 text-center">
            <h2 className="text-3xl font-black tracking-tight uppercase sm:text-4xl md:text-5xl">
              Everything You Need
            </h2>
            <p className="mt-4 text-gray-400">Built for analysts who hate wasting time</p>
          </AnimateOnScroll>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <AnimateOnScroll key={feature.title} delay={(index % 3) * 100}>
                  <div className="group h-full border border-white/10 border-l-4 border-l-transparent bg-white/5 p-6 transition-all duration-300 hover:border-l-orange-500 hover:bg-white/[0.07]">
                    <Icon className="mb-4 h-8 w-8 text-orange-500" strokeWidth={1.75} />
                    <h3 className="mb-2 text-lg font-black tracking-wide uppercase">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-400">{feature.description}</p>
                  </div>
                </AnimateOnScroll>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-white/10 bg-black py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll className="mb-16 text-center">
            <h2 className="text-3xl font-black tracking-tight uppercase sm:text-4xl md:text-5xl">
              Simple Pricing
            </h2>
            <p className="mt-4 text-gray-400">Start free. Upgrade when you need more.</p>
          </AnimateOnScroll>

          <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-8 md:flex-row md:items-stretch">
            <AnimateOnScroll className="w-full md:w-auto md:flex-1" delay={0}>
              <div className="flex h-full flex-col border border-white/20 bg-white/5 p-8">
                <h3 className="text-2xl font-black uppercase">Free</h3>
                <p className="mt-2 text-3xl font-black">
                  $0 <span className="text-base font-bold text-gray-400">/ month</span>
                </p>
                <p className="mt-2 text-sm text-gray-400">Perfect for getting started</p>
                <ul className="mt-8 flex-1 space-y-3 text-sm text-gray-300">
                  {[
                    '5 CSV analyses per month',
                    'AI chat (20 messages/month)',
                    'PDF export',
                    'Analysis history',
                    'All chart types',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" strokeWidth={3} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="mt-8 block border border-white py-3 text-center text-sm font-bold tracking-wide text-white uppercase transition-colors hover:bg-white/5"
                >
                  Get Started Free
                </Link>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll className="w-full md:w-auto md:flex-1" delay={150}>
              <div className="relative flex h-full scale-100 flex-col border border-orange-500/60 bg-white/5 p-8 shadow-[0_0_60px_-8px_rgba(249,115,22,0.35)] md:scale-105">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 px-4 py-1 text-[10px] font-black tracking-widest text-black uppercase">
                  Most Popular
                </span>
                <h3 className="text-2xl font-black uppercase">Pro</h3>
                <p className="mt-2 text-3xl font-black">
                  $12 <span className="text-base font-bold text-gray-400">/ month</span>
                </p>
                <p className="mt-2 text-sm text-gray-400">For analysts who work with data daily</p>
                <ul className="mt-8 flex-1 space-y-3 text-sm text-gray-300">
                  {[
                    'Unlimited CSV analyses',
                    'Unlimited AI chat',
                    'Priority processing',
                    'Advanced charts',
                    'Email reports',
                    'Early access to new features',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" strokeWidth={3} />
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled
                  className="mt-8 cursor-not-allowed bg-orange-500/70 py-3 text-sm font-bold tracking-wide text-black/80 uppercase"
                >
                  Coming Soon
                </button>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-orange-600/30 bg-gradient-to-r from-orange-600 to-orange-400 py-24 sm:py-32">
        <div
          className="landing-cta-pattern pointer-events-none absolute inset-0 opacity-60 animate-landing-cta-drift"
          aria-hidden
        />
        <AnimateOnScroll className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-black tracking-tight text-black uppercase sm:text-4xl md:text-5xl lg:text-6xl">
            Start Analyzing Your Data Today
          </h2>
          <p className="mt-6 text-base font-medium text-black/70 sm:text-lg">
            Join analysts who save hours every week with AI-powered insights.
          </p>
          <Link
            href="/signup"
            className="mt-10 inline-block bg-black px-10 py-5 text-sm font-black tracking-wide text-white uppercase transition-colors hover:bg-black/90 sm:text-base"
          >
            Get Started Free →
          </Link>
          <p className="mt-6 text-sm text-black/60">
            Free forever · No credit card required
          </p>
        </AnimateOnScroll>
      </section>
    </div>
  )
}
