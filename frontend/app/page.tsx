import Link from 'next/link'
import { ArrowRight, BarChart3, TrendingUp, Zap } from 'lucide-react'


export default function Home() {
  return (
    <div className="bg-black">
      {/* Hero Section */}
      <section className="border-b-2 border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 space-y-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="inline-block border-2 border-orange-500 px-4 py-1">
                <p className="text-orange-500 font-bold text-xs uppercase tracking-widest">
                  Data Intelligence Platform
                </p>
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white uppercase leading-tight tracking-tight">
                Transform Your Data Into<br />
                <span className="text-orange-500">Power</span>
              </h1>
            </div>
            <p className="text-base font-semibold text-white/80 max-w-2xl leading-relaxed">
              Unlock insights from your data with our powerful visualization and analysis tools. No coding required. Just upload, analyze, and discover.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link
              href="/analyze"
              className="px-6 py-3 bg-orange-500 border-2 border-orange-500 text-white font-bold uppercase text-sm tracking-widest transition-all duration-300 hover:bg-black hover:text-orange-500 flex items-center justify-center gap-2"
            >
              Start Analyzing
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/services"
              className="px-6 py-3 bg-black border-2 border-white text-white font-bold uppercase text-sm tracking-widest transition-all duration-300 hover:bg-white hover:text-black flex items-center justify-center gap-2"
            >
              Learn More
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t-2 border-white">
            {[
              { number: '10K+', label: 'Data Points' },
              { number: '500+', label: 'Happy Users' },
              { number: '99%', label: 'Uptime' },
            ].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="text-2xl font-bold text-orange-500">{stat.number}</p>
                <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-b-2 border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="space-y-10">
            <div className="space-y-3">
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
                Why Choose DataViz
              </h2>
              <div className="w-16 h-1 bg-orange-500"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  icon: BarChart3,
                  title: 'Multiple Visualizations',
                  description: 'Bar charts, line graphs, pie charts. Switch formats instantly.',
                },
                {
                  icon: TrendingUp,
                  title: 'Deep Analysis',
                  description: 'Data cleaning, pattern detection, and actionable insights.',
                },
                {
                  icon: Zap,
                  title: 'Lightning Fast',
                  description: 'Process thousands of data points in seconds.',
                },
              ].map((feature) => {
                const Icon = feature.icon
                return (
                  <div key={feature.title} className="border-2 border-white bg-gray-950 p-6 space-y-3">
                    <Icon className="h-10 w-10 text-orange-500" />
                    <h3 className="text-lg font-bold text-white uppercase">{feature.title}</h3>
                    <p className="text-white/80 font-medium text-sm leading-relaxed">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="border-2 border-orange-500 bg-gray-950 p-8 md:p-10 space-y-6 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
              Ready to Unlock Your Data?
            </h2>
            <p className="text-base font-semibold text-white/80 max-w-2xl mx-auto">
              Upload your CSV file in seconds and start exploring powerful visualizations.
            </p>
            <Link
              href="/analyze"
              className="inline-block px-8 py-3 bg-orange-500 border-2 border-orange-500 text-white font-bold uppercase text-sm tracking-widest transition-all duration-300 hover:bg-black hover:text-orange-500"
            >
              Analyze Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

