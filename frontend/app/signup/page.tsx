'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, UserRound, Mail, Lock, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  AuthMarketingPanel,
  authInputClass,
  authLabelClass,
} from '@/components/auth-marketing-panel'

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
      router.push('/analyze')
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
    setError('')

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Something went wrong. Please try again.')
        return
      }

      setUserEmail(formData.email)
      setSuccess('Account created. Check your email for the 6-digit OTP.')
      setStep(2)
      setFormData({ fullName: '', email: '', password: '' })
    } catch {
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
    } catch {
      setError('Something went wrong while verifying your OTP.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="landing-grid-pattern border-b border-white/10">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
          <AuthMarketingPanel
            badge="Get Started Free"
            heading={
              <>
                Start Analyzing
                <br />
                <span className="text-orange-500">Your Data Today</span>
              </>
            }
            description="Upload any CSV and get instant AI-powered insights. Auto-clean messy data, beautiful charts, and plain English answers."
            trustItems={['Free forever', 'No credit card', 'Setup in 30 seconds']}
            features={['Auto data cleaning', 'Smart charts', 'AI chat', 'Analysis history']}
          />

          <div
            className="relative animate-landing-fade-in border border-white/10 bg-white/5 p-6 shadow-[0_0_80px_-12px_rgba(249,115,22,0.35)] sm:p-8"
            style={{ animationDelay: '150ms' }}
          >
            <div className="absolute -inset-px -z-10 bg-orange-500/10 blur-2xl" aria-hidden />

            <div className="mb-6 border-b border-white/10 pb-6">
              <p className="text-xs font-black tracking-widest text-orange-500 uppercase">
                {step === 2 ? 'Verify email' : 'Create account'}
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-white uppercase">
                {step === 2 ? 'Enter OTP' : 'Sign Up'}
              </h2>
            </div>

            {step === 2 ? (
              <div className="space-y-5">
                <div className="border border-orange-500/30 bg-orange-500/10 p-4 text-sm text-gray-300">
                  We sent a 6-digit code to{' '}
                  <span className="font-bold text-white">{userEmail}</span>
                </div>

                <form className="space-y-5" onSubmit={handleOtpVerify} noValidate>
                  <label className="block space-y-2">
                    <span className={authLabelClass}>One-time password</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className={`${authInputClass} text-center text-xl tracking-[0.35em]`}
                    />
                  </label>

                  {error && (
                    <p className="border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                      {error}
                    </p>
                  )}
                  {success && (
                    <p className="border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-sm text-orange-300">
                      {success}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 bg-orange-500 px-5 py-4 text-sm font-black tracking-wide text-black uppercase transition-colors hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying…
                      </>
                    ) : (
                      <>
                        Verify OTP
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep(1)
                      setError('')
                      setSuccess('')
                      setOtp('')
                    }}
                    className="w-full text-xs font-bold tracking-widest text-white/50 uppercase transition-colors hover:text-orange-400"
                  >
                    ← Back to signup
                  </button>
                </form>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                <label className="block space-y-2">
                  <span className={`flex items-center gap-2 ${authLabelClass}`}>
                    <UserRound className="h-4 w-4 text-orange-500" />
                    Full name
                  </span>
                  <input
                    type="text"
                    placeholder="Alex Carter"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    className={authInputClass}
                    autoComplete="name"
                  />
                </label>

                <label className="block space-y-2">
                  <span className={`flex items-center gap-2 ${authLabelClass}`}>
                    <Mail className="h-4 w-4 text-orange-500" />
                    Email
                  </span>
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={authInputClass}
                    autoComplete="email"
                  />
                </label>

                <label className="block space-y-2">
                  <span className={`flex items-center gap-2 ${authLabelClass}`}>
                    <Lock className="h-4 w-4 text-orange-500" />
                    Password
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={authInputClass}
                    autoComplete="new-password"
                  />
                </label>

                {error && (
                  <p className="border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                    {error}
                  </p>
                )}
                {success && (
                  <p className="border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-sm text-orange-300">
                    {success}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 bg-orange-500 px-5 py-4 text-sm font-black tracking-wide text-black uppercase transition-colors hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    <>
                      Get Started Free
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-gray-400">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-bold text-orange-500 uppercase transition-colors hover:text-orange-400"
                  >
                    Sign in →
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
