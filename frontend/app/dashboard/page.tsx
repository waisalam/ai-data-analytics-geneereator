'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  BarChart3, FileText, MessageSquare, Download,
  Upload, Plus, ArrowRight, Clock, TrendingUp,
  Sparkles, History, ExternalLink, Loader2,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell
} from 'recharts'

// ── Types ────────────────────────────────────────────────────────────
interface DashboardData {
  stats: {
    totalAnalyses: number
    totalCharts: number
    totalChats: number
    memberSince: string
  }
  recentAnalyses: {
    id: string
    fileName: string
    createdAt: string
    chartCount: number
  }[]
  activityChart: { date: string; count: number }[]
}

// ── Animate on scroll ────────────────────────────────────────────────
function AnimateOnScroll({
  children, className = '', delay = 0,
}: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el) } },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function shortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ── Custom tooltip for activity chart ───────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#0a0a0a', border: '2px solid #f97316', padding: '8px 12px' }}>
        <p style={{ color: '#f97316', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</p>
        <p style={{ color: '#fff', fontSize: 14, fontWeight: 900 }}>{payload[0].value} analyses</p>
      </div>
    )
  }
  return null
}

// ── Main Dashboard ───────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [headerVisible, setHeaderVisible] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/dashboard')
        if (!res.ok) return
        const json = await res.json()
        setData(json)
      } catch (e) {
        console.error('Dashboard fetch failed:', e)
      } finally {
        setLoading(false)
        setTimeout(() => setHeaderVisible(true), 100)
      }
    }
    fetchDashboard()
  }, [status])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white font-black text-sm uppercase tracking-widest">Loading Dashboard…</p>
        </div>
      </div>
    )
  }

  const stats = data?.stats
  const recentAnalyses = data?.recentAnalyses || []
  const activityChart = (data?.activityChart || []).map(d => ({
    ...d,
    label: shortDate(d.date)
  }))
  const maxActivity = Math.max(...activityChart.map(d => d.count), 1)

  return (
    <div className="bg-black text-white min-h-screen">

      {/* ── HERO HEADER ──────────────────────────────────────────────── */}
      <section className="relative border-b-4 border-white overflow-hidden" style={{ background: '#000' }}>
        {/* Grid pattern background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        {/* Orange glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-500/10 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div style={{
              opacity: headerVisible ? 1 : 0,
              transform: headerVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
            }}>
              <div className="inline-flex items-center gap-2 border border-white/15 bg-white/5 px-3 py-1.5 mb-4">
                <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-xs font-bold tracking-widest text-white/80 uppercase">Your Dashboard</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                Welcome Back,<br />
                <span className="text-orange-500">{session?.user?.name?.split(' ')[0] || 'Analyst'}</span>
              </h1>
              <p className="mt-4 text-gray-400 text-base max-w-lg">
                Here's everything happening with your data. Upload a CSV to get started or continue where you left off.
              </p>
            </div>

            {/* Quick actions */}
            <div className="flex flex-col gap-3" style={{
              opacity: headerVisible ? 1 : 0,
              transform: headerVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.6s ease-out 200ms, transform 0.6s ease-out 200ms'
            }}>
              <Link href="/analyze/result"
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-black font-black text-sm uppercase tracking-widest px-6 py-4 transition-colors">
                <Plus className="h-4 w-4" />
                New Analysis
              </Link>
              <Link href="/analyze"
                className="flex items-center gap-2 border-2 border-white hover:bg-white hover:text-black text-white font-black text-sm uppercase tracking-widest px-6 py-4 transition-all">
                <MessageSquare className="h-4 w-4" />
                Open Chat
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ROW ────────────────────────────────────────────────── */}
      <section className="border-b-4 border-white" style={{ background: '#0a0a0a' }}>
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x-0 lg:divide-x-4 divide-y-4 lg:divide-y-0 divide-white">
            {[
              {
                label: 'Total Analyses',
                value: stats?.totalAnalyses ?? 0,
                icon: FileText,
                suffix: '',
                delay: 0,
                desc: 'CSV files processed'
              },
              {
                label: 'Charts Generated',
                value: stats?.totalCharts ?? 0,
                icon: BarChart3,
                suffix: '',
                delay: 100,
                desc: 'Visualizations created'
              },
              {
                label: 'Questions Asked',
                value: stats?.totalChats ?? 0,
                icon: MessageSquare,
                suffix: '',
                delay: 200,
                desc: 'AI conversations'
              },
              {
                label: 'Member Since',
                value: stats?.memberSince ? new Date(stats.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—',
                icon: Sparkles,
                suffix: '',
                delay: 300,
                desc: 'Joined DataAI',
                isText: true
              },
            ].map(({ label, value, icon: Icon, suffix, delay, desc, isText }) => (
              <AnimateOnScroll key={label} delay={delay}
                className="p-8 border-l-4 border-l-orange-500 group hover:bg-white/5 transition-colors cursor-default">
                <div className="flex items-start justify-between mb-4">
                  <Icon className="h-6 w-6 text-orange-500" strokeWidth={1.75} />
                  <ArrowRight className="h-4 w-4 text-gray-700 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                </div>
                <p className={`font-black tracking-tight leading-none mb-1 ${isText ? 'text-2xl' : 'text-4xl md:text-5xl'}`}>
                  {value}{suffix}
                </p>
                <p className="text-orange-500 text-xs font-black uppercase tracking-widest">{label}</p>
                <p className="text-gray-600 text-xs mt-1">{desc}</p>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-16">

        {/* ── Activity Chart + Recent ── */}
        <div className="grid lg:grid-cols-5 gap-8">

          {/* Activity chart — 3 cols */}
          <AnimateOnScroll className="lg:col-span-3" delay={0}>
            <div className="border-4 border-white h-full" style={{ background: '#0a0a0a' }}>
              <div className="border-b-4 border-white px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-orange-500 text-xs font-black uppercase tracking-widest">Activity</p>
                  <h2 className="text-xl font-black uppercase tracking-tighter">Analyses Per Day</h2>
                </div>
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </div>
              <div className="p-6">
                {activityChart.every(d => d.count === 0) ? (
                  <div className="flex flex-col items-center justify-center h-48 space-y-3">
                    <BarChart3 className="h-10 w-10 text-gray-800" />
                    <p className="text-gray-600 text-sm font-bold uppercase tracking-widest">No activity yet</p>
                    <Link href="/analyze"
                      className="text-orange-500 text-xs font-black uppercase tracking-widest underline underline-offset-4">
                      Upload your first CSV →
                    </Link>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={activityChart} margin={{ top: 8, right: 0, left: -24, bottom: 0 }}>
                      <XAxis
                        dataKey="label"
                        stroke="#333"
                        tick={{ fontSize: 10, fill: '#666', fontWeight: 700 }}
                      />
                      <YAxis
                        stroke="#333"
                        tick={{ fontSize: 10, fill: '#666', fontWeight: 700 }}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(249,115,22,0.05)' }} />
                      <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={40}>
                        {activityChart.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={entry.count === maxActivity && entry.count > 0 ? '#f97316' : '#f9731650'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {/* Legend */}
                <div className="mt-4 flex items-center gap-4 border-t border-white/10 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Peak day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500/30" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Other days</span>
                  </div>
                </div>
              </div>
            </div>
          </AnimateOnScroll>

          {/* Quick stats — 2 cols */}
          <AnimateOnScroll className="lg:col-span-2" delay={150}>
            <div className="border-4 border-white h-full flex flex-col" style={{ background: '#0a0a0a' }}>
              <div className="border-b-4 border-white px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-orange-500 text-xs font-black uppercase tracking-widest">Quick Access</p>
                  <h2 className="text-xl font-black uppercase tracking-tighter">Jump Back In</h2>
                </div>
                <History className="h-5 w-5 text-orange-500" />
              </div>
              <div className="p-6 flex flex-col gap-3 flex-1">
                {[
                  { label: 'Upload New CSV', desc: 'Analyze fresh data', href: '/analyze', icon: Upload, primary: true },
                  { label: 'AI Chat', desc: 'Talk to your data', href: '/analyze', icon: MessageSquare, primary: false },
                  { label: 'View Results', desc: 'See your charts', href: '/analyze/result', icon: BarChart3, primary: false },
                  { label: 'Download PDF', desc: 'Export latest report', href: '/analyze/result', icon: Download, primary: false },
                ].map(({ label, desc, href, icon: Icon, primary }) => (
                  <Link key={label} href={href}
                    className={`flex items-center gap-4 p-4 border-2 font-black text-xs uppercase tracking-widest transition-all group ${
                      primary
                        ? 'bg-orange-500 border-orange-500 text-black hover:bg-orange-400'
                        : 'border-white/20 text-white hover:border-orange-500 hover:bg-white/5'
                    }`}>
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <p className="font-black">{label}</p>
                      <p className={`text-xs font-bold mt-0.5 ${primary ? 'text-black/70' : 'text-gray-600'}`}>{desc}</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        </div>

        {/* ── Recent Analyses ───────────────────────────────────────── */}
        <AnimateOnScroll delay={0}>
          <div className="border-4 border-white" style={{ background: '#0a0a0a' }}>
            <div className="border-b-4 border-white px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-orange-500 text-xs font-black uppercase tracking-widest">History</p>
                <h2 className="text-2xl font-black uppercase tracking-tighter">Recent Analyses</h2>
              </div>
              <Link href="/analyze"
                className="flex items-center gap-2 border-2 border-white text-white hover:bg-white hover:text-black font-black text-xs uppercase tracking-widest px-4 py-2 transition-all">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recentAnalyses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <FileText className="h-12 w-12 text-gray-800" />
                <p className="text-gray-600 font-black text-sm uppercase tracking-widest">No analyses yet</p>
                <Link href="/analyze"
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-black font-black text-sm uppercase tracking-widest px-6 py-3 transition-colors">
                  <Plus className="h-4 w-4" />
                  Upload Your First CSV
                </Link>
              </div>
            ) : (
              <>
                {/* Table header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b-2 border-white/10 bg-orange-500/10">
                  <p className="col-span-5 text-orange-500 text-xs font-black uppercase tracking-widest">File Name</p>
                  <p className="col-span-2 text-orange-500 text-xs font-black uppercase tracking-widest">Charts</p>
                  <p className="col-span-3 text-orange-500 text-xs font-black uppercase tracking-widest">Uploaded</p>
                  <p className="col-span-2 text-orange-500 text-xs font-black uppercase tracking-widest">Action</p>
                </div>

                {/* Rows */}
                {recentAnalyses.map((analysis, i) => (
                  <div key={analysis.id}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-white/5 hover:bg-white/5 transition-colors group ${
                      i === recentAnalyses.length - 1 ? 'border-b-0' : ''
                    }`}>
                    {/* File name */}
                    <div className="col-span-5 flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 border-2 border-orange-500/40 bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-3.5 w-3.5 text-orange-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-black text-sm uppercase tracking-tight truncate">
                          {analysis.fileName}
                        </p>
                        <p className="text-gray-600 text-xs font-bold flex items-center gap-1 mt-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {timeAgo(analysis.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Charts count */}
                    <div className="col-span-2">
                      <span className="inline-flex items-center gap-1.5 border border-orange-500/40 bg-orange-500/10 px-2.5 py-1 text-xs font-black text-orange-500 uppercase tracking-widest">
                        <BarChart3 className="h-3 w-3" />
                        {analysis.chartCount}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="col-span-3">
                      <p className="text-gray-400 text-sm font-bold">{formatDate(analysis.createdAt)}</p>
                    </div>

                    {/* Action */}
                    <div className="col-span-2">
                      <Link href="/analyze"
                        className="flex items-center gap-1.5 border-2 border-white/20 group-hover:border-orange-500 text-white/60 group-hover:text-orange-500 font-black text-xs uppercase tracking-widest px-3 py-1.5 transition-all">
                        Chat
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </AnimateOnScroll>

        {/* ── CTA Banner ───────────────────────────────────────────── */}
        <AnimateOnScroll delay={0}>
          <div className="relative overflow-hidden border-4 border-orange-500 bg-gradient-to-r from-orange-600 to-orange-400 p-8 md:p-12">
            {/* Pattern overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-20" style={{
              backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)',
              backgroundSize: '8px 8px',
              backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
            }} />

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-black/60 text-xs font-black uppercase tracking-widest mb-2">Ready to analyze?</p>
                <h2 className="text-3xl md:text-4xl font-black text-black uppercase tracking-tighter leading-tight">
                  Upload a New CSV<br />Get Instant Insights
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <Link href="/analyze/result"
                  className="flex items-center gap-2 bg-black hover:bg-black/80 text-white font-black text-sm uppercase tracking-widest px-8 py-4 transition-colors">
                  <Upload className="h-4 w-4" />
                  Upload CSV
                </Link>
                <Link href="/analyze"
                  className="flex items-center gap-2 border-4 border-black bg-transparent hover:bg-black hover:text-white text-black font-black text-sm uppercase tracking-widest px-8 py-4 transition-all">
                  <MessageSquare className="h-4 w-4" />
                  Open Chat
                </Link>
              </div>
            </div>
          </div>
        </AnimateOnScroll>

      </div>
    </div>
  )
}