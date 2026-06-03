'use client'
import Link from 'next/link'
import { ArrowRight, Construction, Sparkles } from 'lucide-react'
import {useSession} from "next-auth/react"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
    const router = useRouter()
    const session = useSession()

    useEffect(()=>{
        if(session.status !== 'authenticated'){
            router.push('/login')
        }
    }, [session.status, router])

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_25px_70px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl md:p-10">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-orange-500/30 bg-orange-500/10 text-orange-300">
              <Construction className="h-8 w-8" />
            </div>

            <p className="text-xs font-black uppercase tracking-[0.35em] text-orange-400">Dashboard</p>
            <h1 className="mt-3 text-3xl font-black uppercase tracking-[0.12em] text-white md:text-4xl">
              Currently in development
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-white/75 md:text-base">
              This dashboard area is being refined with the same modern black-and-orange style as the rest of the app. It will be available soon.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black uppercase tracking-[0.28em] text-black transition duration-300 hover:bg-orange-400"
              >
                Back Home
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/analyze"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black uppercase tracking-[0.28em] text-white transition duration-300 hover:border-orange-500/50 hover:bg-white/10"
              >
                <Sparkles className="h-4 w-4 text-orange-300" />
                Try Analyze
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
