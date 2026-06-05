'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function PaymentContent() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId') || 'guest'

  const startCheckout = () => {
    window.location.assign(`/api/payment?userId=${encodeURIComponent(userId)}`)
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
        <div className="w-full rounded-3xl border border-orange-500/30 bg-gray-950 p-8 shadow-2xl shadow-orange-500/10">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-orange-400">Upgrade to Pro</p>
          <h1 className="mt-4 text-4xl font-black uppercase tracking-tight text-white">Unlock unlimited analysis</h1>
          <p className="mt-4 text-white/80">Secure checkout is ready to accept your Pro upgrade. Your user ID is attached to the payment flow for account linking.</p>

          <div className="mt-6 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-orange-300">Pro plan</p>
                <p className="mt-2 text-3xl font-black text-white">$10 / month</p>
              </div>
              <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.25em] text-orange-200">Unlimited</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              <li>• Unlimited uploads</li>
              <li>• Unlimited chat messages</li>
              <li>• Priority analysis access</li>
            </ul>
          </div>

          <button
            onClick={startCheckout}
            className="mt-8 w-full rounded-xl bg-orange-500 px-5 py-3 text-sm font-black uppercase tracking-[0.25em] text-black transition hover:bg-orange-400"
          >
            Continue to payment
          </button>

          <p className="mt-4 text-xs text-white/40">User ID: {userId}</p>
        </div>
      </section>
    </main>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  )
}