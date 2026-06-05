'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, Mail, Lock, Loader2 } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  AuthMarketingPanel,
  authInputClass,
  authLabelClass,
} from '@/components/auth-marketing-panel'

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const session = useSession()

  useEffect(() => {
    if (session.status === 'authenticated') {
      router.push('/analyze')
    }
  }, [session.status, router])

  const handleChange = (field: 'email' | 'password', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError('')
    if (success) setSuccess('')
  }

  const validateForm = () => {
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

    setSubmitting(true)
    setError('')
    setSuccess('')

    const result = await signIn('credentials', {
      email: formData.email,
      password: formData.password,
      redirect: false,
    })

    setSubmitting(false)

    if (result?.ok) {
      setSuccess('Login successful! Redirecting…')
      router.push('/analyze')
    } else {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="landing-grid-pattern border-b border-white/10">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
          <AuthMarketingPanel
            badge="Welcome Back"
            heading={
              <>
                Sign In To
                <br />
                <span className="text-orange-500">Your Data Workspace</span>
              </>
            }
            description="Access your analyses, chat with your CSV data, and pick up right where you left off."
            trustItems={['Secure login', 'Free tier available', 'Instant access']}
            features={['AI chat on your data', 'Saved analyses', 'Chart exports', 'PDF reports']}
          />

          <div
            className="relative animate-landing-fade-in border border-white/10 bg-white/5 p-6 shadow-[0_0_80px_-12px_rgba(249,115,22,0.35)] sm:p-8"
            style={{ animationDelay: '150ms' }}
          >
            <div className="absolute -inset-px -z-10 bg-orange-500/10 blur-2xl" aria-hidden />

            <div className="mb-6 border-b border-white/10 pb-6">
              <p className="text-xs font-black tracking-widest text-orange-500 uppercase">Account</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-white uppercase">Sign In</h2>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
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
                  autoComplete="current-password"
                />
              </label>

              {error ? (
                <p className="border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
              ) : null}
              {success ? (
                <p className="border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-sm text-orange-300">
                  {success}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 bg-orange-500 px-5 py-4 text-sm font-black tracking-wide text-black uppercase transition-colors hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-400">
              New here?{' '}
              <Link
                href="/signup"
                className="font-bold text-orange-500 uppercase transition-colors hover:text-orange-400"
              >
                Create free account →
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
