'use client'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { useState } from 'react'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    setFormData({ name: '', email: '', message: '' })
    alert('Thank you for your message! We\'ll get back to you soon.')
  }

  return (
    <div className="bg-black">
      {/* Header */}
      <section className="border-b-4 border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 space-y-6">
          <h1 className="text-7xl md:text-8xl font-black text-white uppercase tracking-tighter">
            Contact Us
          </h1>
          <div className="w-20 h-1 bg-orange-500"></div>
          <p className="text-xl font-bold text-white/80 max-w-2xl">
            Get in touch with our team. We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="border-b-4 border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Mail,
                title: 'Email',
                value: "waisalam9523@gmail.com",
                link: 'mailto:waisalam9523@gmail.com',
              },
              {
                icon: Phone,
                title: 'Phone',
                value: '+91 9523728021',
                link: 'tel:+919523728021',
              },
              {
                icon: MapPin,
                title: 'Location',
                value: 'Ranchi, Jharkhand, India',
                link: '#',
              },
            ].map((contact) => {
              const Icon = contact.icon
              return (
                <a
                  key={contact.title}
                  href={contact.link}
                  className="border-4 border-white bg-gray-950 p-8 space-y-4 hover:border-orange-500 transition-colors duration-300 group"
                >
                  <Icon className="h-12 w-12 text-orange-500" />
                  <h3 className="text-2xl font-black text-white uppercase">{contact.title}</h3>
                  <p className="text-white/80 font-bold group-hover:text-orange-500 transition-colors">
                    {contact.value}
                  </p>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="border-b-4 border-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="space-y-4 mb-12">
            <h2 className="text-6xl md:text-7xl font-black text-white uppercase tracking-tighter">Send us a Message</h2>
            <div className="w-20 h-1 bg-orange-500"></div>
          </div>

          <form onSubmit={handleSubmit} className="border-4 border-white bg-gray-950 p-8 md:p-12 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-black text-white uppercase tracking-widest">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-black border-2 border-white text-white px-6 py-3 font-bold placeholder-white/50 focus:border-orange-500 focus:outline-none transition-colors"
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-black text-white uppercase tracking-widest">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-black border-2 border-white text-white px-6 py-3 font-bold placeholder-white/50 focus:border-orange-500 focus:outline-none transition-colors"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="block text-sm font-black text-white uppercase tracking-widest">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full bg-black border-2 border-white text-white px-6 py-3 font-bold placeholder-white/50 focus:border-orange-500 focus:outline-none transition-colors resize-none"
                placeholder="Tell us about your project..."
              />
            </div>

            <button
              type="submit"
              className="w-full px-8 py-5 bg-orange-500 border-4 border-orange-500 text-white font-black uppercase text-lg tracking-widest transition-all duration-300 hover:bg-black hover:text-orange-500 flex items-center justify-center gap-3"
            >
              Send Message
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </section>

      {/* FAQ Section */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 space-y-12">
          <div className="space-y-4">
            <h2 className="text-6xl md:text-7xl font-black text-white uppercase tracking-tighter">FAQ</h2>
            <div className="w-20 h-1 bg-orange-500"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                q: 'How long does analysis take?',
                a: 'Most datasets are analyzed in seconds. Larger datasets (100K+ rows) may take a few minutes.',
              },
              {
                q: 'Can I export my charts?',
                a: 'Yes! You can export charts as PNG, SVG, or PDF. Pro plan includes unlimited exports.',
              },
              {
                q: 'Is my data secure?',
                a: 'Absolutely. We use enterprise-grade encryption and never store your data after analysis.',
              },
              {
                q: 'Do you offer API access?',
                a: 'Yes, API access is available on our Enterprise plan for custom integrations.',
              },
            ].map((faq, i) => (
              <div key={i} className="border-4 border-white bg-gray-950 p-8 space-y-4">
                <h3 className="text-xl font-black text-white uppercase">{faq.q}</h3>
                <p className="text-white/80 font-bold leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
