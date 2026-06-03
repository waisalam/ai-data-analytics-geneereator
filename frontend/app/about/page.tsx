import { Users, Target, Zap } from 'lucide-react'

export default function About() {
  return (
    <div className="bg-black">
      {/* Header */}
      <section className="border-b-4 border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 space-y-6">
          <h1 className="text-7xl md:text-8xl font-black text-white uppercase tracking-tighter">
            About Us
          </h1>
          <div className="w-20 h-1 bg-orange-500"></div>
          <p className="text-xl font-bold text-white/80 max-w-2xl">
            Transforming how businesses understand and leverage their data.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="border-b-4 border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">Our Story</h2>
            <div className="w-20 h-1 bg-orange-500"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-lg font-bold text-white/80 leading-relaxed">
                I started this journey with a bigger dream: building an operating system for companies that could manage everything inside a business. I wanted to create something powerful enough to handle operations, analytics, and decision-making in one place.
              </p>
              <p className="text-lg font-bold text-white/80 leading-relaxed">
                But I quickly realized that building that kind of platform alone would require a huge team, time, and money. So instead of waiting for the perfect conditions, I started with the problem I could solve right now: data analysis. This app is my first step toward that bigger vision.
              </p>
              <p className="text-lg font-bold text-white/80 leading-relaxed">
                In that future operating system, data analysis and AI-powered insights will also play a major role. That is why I am building this project with Python, full-stack web development, pandas, NumPy, RAG, scikit-learn, Chroma DB, and open-source models while learning more about AI every day.
              </p>
              <p className="text-lg font-bold text-white/80 leading-relaxed">
                I am a solo developer, this project is the work of only 4 days so far, and I am still learning AIML, but I am deeply passionate about building my own business and turning this idea into something real.
              </p>
            </div>

            <div className="border-4 border-white bg-gray-950 p-12">
              <div className="space-y-8">
                <div className="space-y-2">
                  <p className="text-5xl font-black text-orange-500">2026</p>
                  <p className="text-white font-bold uppercase tracking-wider">Founded</p>
                </div>
                <div className="space-y-2">
                  <p className="text-5xl font-black text-orange-500">Testing</p>
                  <p className="text-white font-bold uppercase tracking-wider">Active Users</p>
                </div>
                <div className="space-y-2">
                  <p className="text-5xl font-black text-orange-500">0</p>
                  <p className="text-white font-bold uppercase tracking-wider">Team Members</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="border-b-4 border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 space-y-12">
          <div className="space-y-4">
            <h2 className="text-6xl md:text-7xl font-black text-white uppercase tracking-tighter">Our Values</h2>
            <div className="w-20 h-1 bg-orange-500"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'User-Centric',
                description: 'We design everything with our users in mind, ensuring intuitive and powerful experiences.',
              },
              {
                icon: Target,
                title: 'Excellence',
                description: 'We strive for excellence in every aspect of our product and service delivery.',
              },
              {
                icon: Zap,
                title: 'Innovation',
                description: 'We constantly innovate to stay ahead of the curve and deliver cutting-edge solutions.',
              },
            ].map((value) => {
              const Icon = value.icon
              return (
                <div key={value.title} className="border-4 border-white bg-gray-950 p-8 space-y-4">
                  <Icon className="h-12 w-12 text-orange-500" />
                  <h3 className="text-2xl font-black text-white uppercase">{value.title}</h3>
                  <p className="text-white/80 font-bold leading-relaxed">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 space-y-12">
          <div className="space-y-4">
            <h2 className="text-6xl md:text-7xl font-black text-white uppercase tracking-tighter">Our Team</h2>
            <div className="w-20 h-1 bg-orange-500"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Wais ALam', role: 'CEO & Co-Founder' },
              { name: 'NO One', role: 'CTO & Co-Founder' },
              { name: 'NO One', role: 'COO & Co-Founder' },  
            ].map((member) => (
              <div key={member.name} className="border-4 border-white bg-gray-950 p-8 space-y-4">
                <div className="w-full h-48 bg-orange-500/20 border-2 border-orange-500"></div>
                <h3 className="text-2xl font-black text-white uppercase">{member.name}</h3>
                <p className="text-orange-500 font-bold uppercase tracking-wider text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
