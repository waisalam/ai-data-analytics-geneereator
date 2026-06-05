import Link from 'next/link'
import { BarChart3, Rocket, Target, Users, Zap } from 'lucide-react'

const stats = [
  { value: '2026', label: 'Founded' },
  { value: 'Beta', label: 'Stage' },
  { value: '1', label: 'Solo Builder' },
]

const values = [
  {
    icon: Users,
    title: 'User-Centric',
    description:
      'Every feature starts with a real analyst problem — messy CSVs, slow insights, and tools that get in the way.',
  },
  {
    icon: Target,
    title: 'Excellence',
    description:
      'We obsess over accuracy in AI answers, clarity in charts, and speed from upload to insight.',
  },
  {
    icon: Zap,
    title: 'Innovation',
    description:
      'Built with modern AI, open models, and a stack designed to evolve as data workflows change.',
  },
]

const stack = ['Python', 'Next.js', 'Pandas', 'RAG', 'Open-source LLMs', 'Chroma DB']

export default function AboutPage() {
  return (
    <div className="bg-black text-white">
      {/* Hero */}
      <section className="landing-grid-pattern border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="inline-flex items-center gap-2 border border-white/15 bg-white/5 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-orange-500 animate-landing-pulse-dot" />
            <span className="text-xs font-bold tracking-widest text-white/80 uppercase">
              About DataAI
            </span>
          </div>
          <h1 className="mt-8 max-w-4xl text-4xl font-black tracking-tight uppercase sm:text-5xl md:text-6xl lg:text-7xl">
            Building The Future Of{' '}
            <span className="text-orange-500">AI Analytics</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg">
            DataAI helps anyone turn raw CSV data into clean datasets, smart charts, and
            conversational insights — no analyst team required.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-3xl font-black tracking-tight uppercase sm:text-4xl">
                Our Story
              </h2>
              <p className="mt-4 text-sm text-gray-400">Why we built DataAI</p>
              <div className="mt-8 space-y-5 text-sm leading-relaxed text-gray-400 sm:text-base">
                <p>
                  This project started with a bigger dream: an operating system for companies
                  that could manage operations, analytics, and decision-making in one place.
                </p>
                <p>
                  Building that alone would take a huge team, time, and capital — so we started
                  with the problem we could solve right now: data analysis. DataAI is the first
                  step toward that vision.
                </p>
                <p>
                  In that future platform, AI-powered insights will sit at the core. That is why
                  we are building with Python, full-stack web development, pandas, RAG,
                  scikit-learn, Chroma DB, and open-source models while pushing forward every day.
                </p>
                <p>
                  We are a solo-led project, still early and learning fast — but deeply focused on
                  turning this into something real for analysts and teams who hate wasting time on
                  spreadsheets.
                </p>
              </div>
            </div>

            <div className="border border-white/10 bg-white/5 p-8 shadow-[0_0_60px_-12px_rgba(249,115,22,0.2)]">
              <div className="mb-8 flex items-center gap-3 border-b border-white/10 pb-6">
                <BarChart3 className="h-8 w-8 text-orange-500" />
                <span className="text-sm font-bold tracking-widest text-white/60 uppercase">
                  At a glance
                </span>
              </div>
              <div className="grid gap-8 sm:grid-cols-3 lg:grid-cols-1">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-4xl font-black text-orange-500">{stat.value}</p>
                    <p className="mt-1 text-xs font-bold tracking-widest text-white/60 uppercase">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-10 border-t border-white/10 pt-8">
                <p className="mb-4 text-xs font-bold tracking-widest text-white/50 uppercase">
                  Tech stack
                </p>
                <div className="flex flex-wrap gap-2">
                  {stack.map((item) => (
                    <span
                      key={item}
                      className="border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400 uppercase"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-b border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-black tracking-tight uppercase sm:text-4xl">
              Our Values
            </h2>
            <p className="mt-4 text-gray-400">What guides every product decision</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => {
              const Icon = value.icon
              return (
                <div
                  key={value.title}
                  className="group border border-white/10 border-l-4 border-l-transparent bg-white/5 p-6 transition-all duration-300 hover:border-l-orange-500 hover:bg-white/[0.07]"
                >
                  <Icon className="h-8 w-8 text-orange-500" strokeWidth={1.75} />
                  <h3 className="mt-4 text-lg font-black tracking-wide uppercase">
                    {value.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-400">
                    {value.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="landing-grid-pattern border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Rocket className="mx-auto h-10 w-10 text-orange-500" />
            <h2 className="mt-6 text-3xl font-black tracking-tight uppercase sm:text-4xl">
              Built By A Solo Founder
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-gray-400 sm:text-base">
              DataAI is led by Wais Alam — shipping fast, learning AI/ML in public, and building
              toward a full business intelligence platform one feature at a time.
            </p>
            <div className="mt-10 border border-white/10 bg-white/5 p-8 text-left">
              <p className="text-2xl font-black uppercase">Wais Alam</p>
              <p className="mt-2 text-sm font-bold tracking-widest text-orange-500 uppercase">
                Founder & Builder
              </p>
              <p className="mt-4 text-sm leading-relaxed text-gray-400">
                Ranchi, India · Full-stack & AI enthusiast · Open to feedback, partnerships, and
                early users who want to shape the product.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-orange-600 to-orange-400 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-black tracking-tight text-black uppercase sm:text-4xl">
            Ready To Try DataAI?
          </h2>
          <p className="mt-4 text-sm font-medium text-black/70 sm:text-base">
            Upload a CSV and get AI insights in seconds — free to start.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block bg-black px-10 py-4 text-sm font-black tracking-wide text-white uppercase transition-colors hover:bg-black/90"
          >
            Get Started Free →
          </Link>
        </div>
      </section>
    </div>
  )
}
