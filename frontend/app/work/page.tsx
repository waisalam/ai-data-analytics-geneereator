import Link from 'next/link'


export default function Work() {
  const caseStudies = [
    {
      id: 1,
      title: 'E-Commerce Analytics',
      industry: 'Retail',
      results: '45% increase in sales',
      description: 'Helped an online retailer analyze customer behavior and optimize their sales funnel.',
    },
    {
      id: 2,
      title: 'Healthcare Insights',
      industry: 'Healthcare',
      results: '30% faster diagnosis',
      description: 'Enabled a hospital network to visualize patient data and improve treatment outcomes.',
    },
    {
      id: 3,
      title: 'Marketing ROI Dashboard',
      industry: 'Marketing',
      results: '$2M additional revenue',
      description: 'Created comprehensive analytics dashboard to track marketing campaign performance.',
    },
    {
      id: 4,
      title: 'Supply Chain Optimization',
      industry: 'Logistics',
      results: '25% cost reduction',
      description: 'Visualized supply chain data to identify inefficiencies and optimize operations.',
    },
    {
      id: 5,
      title: 'Financial Reporting System',
      industry: 'Finance',
      results: '50% faster reports',
      description: 'Automated financial data analysis and reporting for a global corporation.',
    },
    {
      id: 6,
      title: 'Customer Success Analytics',
      industry: 'SaaS',
      results: '60% churn reduction',
      description: 'Built predictive models to identify at-risk customers and improve retention.',
    },
  ]

  return (
    <div className="bg-black">
      {/* Header */}
      <section className="border-b-4 border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 space-y-6">
          <h1 className="text-7xl md:text-8xl font-black text-white uppercase tracking-tighter">
            Our Work
          </h1>
          <div className="w-20 h-1 bg-orange-500"></div>
          <p className="text-xl font-bold text-white/80 max-w-2xl">
            See how we've transformed data into insights for leading companies.
          </p>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="border-b-4 border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {caseStudies.map((study) => (
              <div key={study.id} className="border-4 border-white bg-gray-950 p-8 space-y-6 hover:border-orange-500 transition-colors duration-300">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{study.title}</h3>
                    <p className="text-orange-500 font-bold uppercase tracking-wider text-sm">{study.industry}</p>
                  </div>
                </div>

                <p className="text-white/80 font-bold leading-relaxed">{study.description}</p>

                <div className="border-t-4 border-orange-500 pt-4">
                  <p className="text-sm font-bold text-white/70 uppercase tracking-wider mb-2">Result</p>
                  <p className="text-2xl font-black text-orange-500">{study.results}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Project */}
      <section className="border-b-4 border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 space-y-12">
          <div className="space-y-4">
            <h2 className="text-6xl md:text-7xl font-black text-white uppercase tracking-tighter">Featured Project</h2>
            <div className="w-20 h-1 bg-orange-500"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="border-4 border-orange-500 bg-gray-950 p-12 min-h-96 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-32 h-32 bg-orange-500/20 border-4 border-orange-500 rounded mx-auto"></div>
                <p className="text-white/70 font-bold">Project Visualization</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-4xl font-black text-white uppercase tracking-tighter">
                  E-Commerce Platform Analytics
                </h3>
                <div className="w-12 h-1 bg-orange-500"></div>
              </div>

              <p className="text-lg font-bold text-white/80 leading-relaxed">
                We partnered with a leading e-commerce platform to build a comprehensive analytics system that transformed how they understand customer behavior.
              </p>

              <div className="space-y-4">
                <div className="border-l-4 border-orange-500 pl-4">
                  <p className="text-sm font-bold text-orange-500 uppercase tracking-wider mb-1">Challenge</p>
                  <p className="text-white font-bold">Millions of transactions needed real-time analysis</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <p className="text-sm font-bold text-orange-500 uppercase tracking-wider mb-1">Solution</p>
                  <p className="text-white font-bold">Built custom dashboard with automated data processing</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <p className="text-sm font-bold text-orange-500 uppercase tracking-wider mb-1">Results</p>
                  <p className="text-white font-bold">45% increase in sales through optimized funnel</p>
                </div>
              </div>

              <Link
                href="/analyze"
                className="inline-block px-8 py-4 bg-orange-500 border-4 border-orange-500 text-white font-black uppercase tracking-widest transition-all duration-300 hover:bg-black hover:text-orange-500"
              >
                Start Your Project
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="border-4 border-orange-500 bg-gray-950 p-12 md:p-16 space-y-8 text-center">
            <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter">
              Let's Build Something Great
            </h2>
            <p className="text-xl font-bold text-white/80 max-w-2xl mx-auto">
              Ready to transform your data? Let's discuss how we can help your business.
            </p>
            <Link
              href="/contact"
              className="inline-block px-10 py-6 bg-orange-500 border-4 border-orange-500 text-white font-black uppercase text-lg tracking-widest transition-all duration-300 hover:bg-black hover:text-orange-500"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
