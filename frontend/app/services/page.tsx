import { CheckCircle2 } from 'lucide-react'

export default function Services() {
  const services = [
    {
      title: 'Data Analysis',
      description: 'Transform raw data into meaningful insights with our advanced analysis algorithms.',
      features: ['Automated cleaning', 'Pattern detection', 'Trend analysis', 'Statistical summaries'],
    },
    {
      title: 'Visualization',
      description: 'Create stunning visualizations that tell your data story clearly and effectively.',
      features: ['Multiple chart types', 'Real-time updates', 'Custom styling', 'Export options'],
    },
    {
      title: 'Reporting',
      description: 'Generate professional reports automatically from your analyzed data.',
      features: ['PDF export', 'Custom branding', 'Scheduled reports', 'Team sharing'],
    },
    {
      title: 'Consulting',
      description: 'Get expert guidance on how to best utilize your data for business decisions.',
      features: ['Strategy sessions', 'Implementation support', 'Training programs', '24/7 support'],
    },
  ]

  return (
    <div className="bg-black">
      {/* Header */}
      <section className="border-b-4 border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 space-y-6">
          <h1 className="text-7xl md:text-8xl font-black text-white uppercase tracking-tighter">
            Services
          </h1>
          <div className="w-20 h-1 bg-orange-500"></div>
          <p className="text-xl font-bold text-white/80 max-w-2xl">
            Comprehensive data analysis and visualization solutions designed for your needs.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="border-b-4 border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service) => (
              <div key={service.title} className="border-4 border-white bg-gray-950 p-12 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{service.title}</h3>
                  <div className="w-12 h-1 bg-orange-500"></div>
                </div>
                <p className="text-white/80 font-bold text-lg leading-relaxed">{service.description}</p>
                <div className="space-y-3 pt-4 border-t-4 border-orange-500">
                  {service.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span className="font-bold text-white">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="border-b-4 border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 space-y-12">
          <div className="space-y-4">
            <h2 className="text-6xl md:text-7xl font-black text-white uppercase tracking-tighter">Pricing</h2>
            <div className="w-20 h-1 bg-orange-500"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Starter', price: '$29', features: ['Up to 10 charts', 'Basic analysis', 'CSV export'] },
              { name: 'Pro', price: '$99', featured: true, features: ['Unlimited charts', 'Advanced analysis', 'PDF reports', 'Priority support'] },
              { name: 'Enterprise', price: 'Custom', features: ['All features', 'API access', 'Dedicated support', 'Custom integration'] },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`border-4 p-8 space-y-6 ${
                  plan.featured
                    ? 'border-orange-500 bg-gray-950 relative'
                    : 'border-white bg-gray-950'
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-6 left-8 bg-orange-500 border-4 border-orange-500 px-6 py-2">
                    <p className="font-black text-white text-sm uppercase tracking-wider">Featured</p>
                  </div>
                )}
                <h3 className="text-3xl font-black text-white uppercase">{plan.name}</h3>
                <div className="space-y-1">
                  <p className="text-5xl font-black text-orange-500">{plan.price}</p>
                  <p className="text-white/70 font-bold text-sm">/month</p>
                </div>
                <div className="space-y-3 pt-4 border-t-4 border-orange-500">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span className="font-bold text-white text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
