import Link from 'next/link'
import { Check } from 'lucide-react'
import type { ReactNode } from 'react'

type AuthMarketingPanelProps = {
  badge: string
  heading: ReactNode
  description: string
  features: string[]
  trustItems?: string[]
}

export const authInputClass =
  'w-full border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-orange-500'

export const authLabelClass = 'text-xs font-bold tracking-widest text-white/60 uppercase'

export function AuthMarketingPanel({
  badge,
  heading,
  description,
  features,
  trustItems,
}: AuthMarketingPanelProps) {
  return (
    <div className="space-y-8">
      <Link href="/" className="inline-block font-black text-xl tracking-tight text-orange-500 uppercase">
        DataAI
      </Link>

      <div className="inline-flex items-center gap-2 border border-white/15 bg-white/5 px-3 py-1.5 animate-landing-fade-in">
        <span className="h-2 w-2 rounded-full bg-orange-500 animate-landing-pulse-dot" />
        <span className="text-xs font-bold tracking-widest text-white/80 uppercase">{badge}</span>
      </div>

      <div className="animate-landing-fade-in space-y-4" style={{ animationDelay: '100ms' }}>
        <h1 className="max-w-xl text-3xl font-black leading-[1.05] tracking-tight uppercase sm:text-4xl lg:text-5xl">
          {heading}
        </h1>
        <p className="max-w-lg text-sm leading-relaxed text-gray-400 sm:text-base">{description}</p>
      </div>

      {trustItems && trustItems.length > 0 && (
        <div
          className="animate-landing-fade-in flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500 sm:text-sm"
          style={{ animationDelay: '200ms' }}
        >
          {trustItems.map((item) => (
            <span key={item} className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-orange-500" strokeWidth={3} />
              {item}
            </span>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {features.map((item, index) => (
          <div
            key={item}
            className="group border border-white/10 border-l-4 border-l-transparent bg-white/5 p-5 transition-all duration-300 hover:border-l-orange-500 hover:bg-white/[0.07] animate-landing-fade-in"
            style={{ animationDelay: `${250 + index * 80}ms` }}
          >
            <p className="text-sm font-black tracking-wide text-white uppercase">{item}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
