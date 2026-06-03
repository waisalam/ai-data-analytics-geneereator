'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, Shield, Sparkles, UserRound, Mail, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function SignupPage() {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' })
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [otp, setOtp] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const router = useRouter()
  const session = useSession()

  useEffect(() => {
    if (session.status === 'authenticated') {
      router.push('/')
    }
  }, [session.status, router])

  const handleChange = (field: 'fullName' | 'email' | 'password', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError('')
    if (success) setSuccess('')
  }

  const validateForm = () => {
    if (!formData.fullName.trim()) return 'Full name is required.'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email.trim())) return 'Please enter a valid email address.'
    if (!formData.password.trim() || formData.password.length < 6) {
      return 'Password must be at least 6 characters long.'
    }
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validateForm()

    if (validationError) {
      setError(validationError)
      setSuccess('')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Something went wrong. Please try again.')
        return
      }

      setUserEmail(formData.email)
      setSuccess('Account created successfully. Check your email for the 6-digit OTP.')
      setStep(2)
      setError('')
      setFormData({ fullName: '', email: '', password: '' })

    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!/^[0-9]{6}$/.test(otp.trim())) {
      setError('Please enter the 6-digit OTP sent to your email.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/verifying', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, otp: otp.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'OTP verification failed.')
        return
      }

      setSuccess(data.message || 'Email verified successfully.')
      setOtp('')
      setTimeout(() => router.push('/login'), 1200)
    } catch (err) {
      setError('Something went wrong while verifying your OTP.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-[0.68rem] font-black uppercase tracking-[0.35em] text-orange-300">
              <Sparkles className="h-3.5 w-3.5" />
              Account Access
            </div>

            <div className="space-y-4">
              <h1 className="max-w-xl text-3xl font-black uppercase tracking-[0.08em] text-white md:text-4xl lg:text-5xl">
                Your analytics journey starts here.
              </h1>
              <p className="max-w-lg text-sm text-white/75 md:text-base">
                Upload any CSV and get instant AI-powered insights. Clean data, beautiful charts, plain English explanations.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                'Auto data cleaning',
                'AI chart insights',
                'Secure data access',
                'Free to use',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_60px_-35px_rgba(249,115,22,0.45)] transition duration-300 hover:-translate-y-1 hover:border-orange-500/40"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/90">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_25px_70px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl md:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.35em] text-orange-400">Welcome</p>
                <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.12em] text-white">Create account</h2>
              </div>
              <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-3 text-orange-300">
                <Shield className="h-5 w-5" />
              </div>
            </div>

            {step === 2 ? (
              <div className="space-y-6">
                <div className="rounded-3xl border border-orange-500/20 bg-orange-500/10 p-4 text-sm text-orange-100">
                  We sent a 6-digit OTP to <span className="font-semibold text-white">{userEmail}</span>.
                </div>

                <form className="space-y-4" onSubmit={handleOtpVerify} noValidate>
                  <label className="block space-y-2 text-sm text-white/80">
                    <span className="text-xs font-black uppercase tracking-[0.35em] text-white/60">OTP</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      className="w-full rounded-2xl border border-white/10 bg-black/70 px-4 py-3 text-center text-xl tracking-[0.35em] text-white outline-none transition duration-300 placeholder:text-white/35 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20"
                    />
                  </label>

                  {error && <p className="text-sm text-red-400">{error}</p>}
                  {success && <p className="text-sm text-emerald-400">{success}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black uppercase tracking-[0.28em] text-black transition duration-300 hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? 'Verifying OTP...' : 'Verify OTP'}
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full text-center text-xs uppercase tracking-[0.25em] text-orange-300 transition hover:text-orange-200"
                  >
                    Back to signup
                  </button>
                </form>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                <label className="block space-y-2 text-sm text-white/80">
                  <span className="flex items-center gap-2 font-semibold uppercase tracking-[0.22em] text-white/70">
                    <UserRound className="h-4 w-4 text-orange-400" /> Full name
                  </span>
                  <input
                    type="text"
                    placeholder="Alex Carter"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/70 px-4 py-3 text-white outline-none transition duration-300 placeholder:text-white/35 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20"
                  />
                </label>

                <label className="block space-y-2 text-sm text-white/80">
                  <span className="flex items-center gap-2 font-semibold uppercase tracking-[0.22em] text-white/70">
                    <Mail className="h-4 w-4 text-orange-400" /> Email
                  </span>
                  <input
                    type="email"
                    placeholder="alex@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/70 px-4 py-3 text-white outline-none transition duration-300 placeholder:text-white/35 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20"
                  />
                </label>

                <label className="block space-y-2 text-sm text-white/80">
                  <span className="flex items-center gap-2 font-semibold uppercase tracking-[0.22em] text-white/70">
                    <Lock className="h-4 w-4 text-orange-400" /> Password
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/70 px-4 py-3 text-white outline-none transition duration-300 placeholder:text-white/35 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20"
                  />
                </label>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black uppercase tracking-[0.28em] text-black transition duration-300 hover:bg-orange-400 hover:shadow-[0_18px_40px_-18px_rgba(249,115,22,0.95)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating account...' : 'Continue'}
                  <ArrowRight className="h-4 w-4" />
                </button>

                <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-white/55">
                  <span>Already have an account?</span>
                  <Link href="/login" className="text-orange-300 transition hover:text-orange-200">
                    Log in
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}