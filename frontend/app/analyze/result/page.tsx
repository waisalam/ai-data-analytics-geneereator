'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createRoot } from 'react-dom/client'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon,
  CheckCircle2, ChevronLeft, ChevronRight, Download, Loader2,
  Clock, FileText, Plus, ArrowUpRight,
  Home, PanelLeft, X,
} from 'lucide-react'
import { ChartComponent } from '@/components/chart-component'
import { AnimateOnScroll } from '@/components/animate-on-scroll'
import { useMobileSidebar } from '@/hooks/use-mobile-sidebar'

const CHARTS_PER_PAGE = 10

interface ChartData {
  title: string
  explanation: string
  type: string
  x: (string | number)[]
  y: number[]
  x_label: string
  y_label: string
}

interface AnalysisData {
  cleaning_report: string[]
  charts: ChartData[]
  columns: { date: string[]; number: string[]; text: string[] }
}

interface HistoryItem {
  id: string
  fileName: string
  fileUrl: string
  charts: ChartData[]
  createdAt: string
}

async function chartToImage(chart: ChartData, type: 'bar' | 'line' | 'pie', html2canvas: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const container = document.createElement('div')
    container.style.cssText = `position:fixed;left:-9999px;top:0;width:700px;height:360px;background:#000000;padding:16px;`
    document.body.appendChild(container)
    const root = createRoot(container)
    root.render(<ChartComponent type={type} data={chart} height={320} />)
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(container, { backgroundColor: '#000000', scale: 2, useCORS: true, logging: false })
        const dataUrl = canvas.toDataURL('image/png')
        root.unmount()
        document.body.removeChild(container)
        resolve(dataUrl)
      } catch (err) {
        root.unmount()
        if (document.body.contains(container)) document.body.removeChild(container)
        reject(err)
      }
    }, 950)
  })
}

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

export default function ResultsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [data, setData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeChart, setActiveChart] = useState(0)
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar')
  const [currentPage, setCurrentPage] = useState(0)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfProgress, setPdfProgress] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [activeAnalysisId, setActiveAnalysisId] = useState<string | null>(null)
  const { sidebarOpen, openSidebar, closeSidebar, closeSidebarOnMobile } = useMobileSidebar()
  const [chartHeight, setChartHeight] = useState(360)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    const update = () => setChartHeight(window.innerWidth < 640 ? 280 : 360)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // load session storage data on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('analysisData') || localStorage.getItem('analysisData')
    if (saved) {
      setData(JSON.parse(saved))
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [])

  // fetch history
  useEffect(() => {
    if (status !== 'authenticated') return
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/analyze-data')
        if (!res.ok) return
        const result = await res.json()
        setHistory(result.getChart || [])
      } catch (e) {
        console.error('Failed to fetch history:', e)
      }
    }
    fetchHistory()
  }, [status])

  const handleSelectHistory = (item: HistoryItem) => {
    setActiveAnalysisId(item.id)
    setActiveChart(0)
    setCurrentPage(0)
    setChartType('bar')
    setData({
      charts: item.charts as ChartData[],
      cleaning_report: [],
      columns: { date: [], number: [], text: [] },
    })
    closeSidebarOnMobile()
  }

  const handleNewAnalysis = () => {
    sessionStorage.removeItem('analysisData')
    localStorage.removeItem('analysisData')
    router.push('/analyze')
  }

  const handleDownloadPDF = async () => {
    if (!data) return
    setPdfLoading(true)
    setPdfProgress('Loading libraries…')
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'), import('html2canvas'),
      ])
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = 210, pageH = 297, margin = 14
      const contentW = pageW - margin * 2
      const newPage = () => {
        pdf.setFillColor(0, 0, 0); pdf.rect(0, 0, pageW, pageH, 'F')
        pdf.setFillColor(249, 115, 22); pdf.rect(0, 0, 5, pageH, 'F')
      }
      newPage()
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(30)
      pdf.setTextColor(255, 255, 255); pdf.text('AI DATA', margin + 2, 30)
      pdf.setTextColor(249, 115, 22); pdf.text('ANALYSIS', margin + 2, 44)
      pdf.setTextColor(255, 255, 255); pdf.text('REPORT', margin + 2, 58)
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.setTextColor(110, 110, 110)
      pdf.text(`Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin + 2, 68)
      pdf.text(`${data.charts.length} charts  •  ${data.cleaning_report.length} cleaning steps`, margin + 2, 74)
      pdf.setDrawColor(249, 115, 22); pdf.setLineWidth(0.5); pdf.line(margin, 82, pageW - margin, 82)
      if (data.cleaning_report.length > 0) {
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(12); pdf.setTextColor(249, 115, 22)
        pdf.text('DATA CLEANING REPORT', margin + 2, 94)
        let cy = 104
        data.cleaning_report.forEach((line) => {
          if (cy > pageH - 16) { pdf.addPage(); newPage(); cy = 22 }
          pdf.setFillColor(249, 115, 22); pdf.circle(margin + 3, cy - 1.5, 1.3, 'F')
          pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.setTextColor(205, 205, 205)
          const lines = pdf.splitTextToSize(line, contentW - 8)
          pdf.text(lines, margin + 7, cy); cy += lines.length * 5 + 3
        })
      }
      for (let i = 0; i < data.charts.length; i++) {
        const chart = data.charts[i]
        setPdfProgress(`Rendering chart ${i + 1} of ${data.charts.length}…`)
        pdf.addPage(); newPage()
        pdf.setFillColor(249, 115, 22); pdf.rect(margin, 14, 22, 8, 'F')
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8); pdf.setTextColor(0, 0, 0)
        pdf.text(`CHART ${i + 1}`, margin + 2, 19.5)
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(14); pdf.setTextColor(255, 255, 255)
        const titleLines = pdf.splitTextToSize(chart.title.toUpperCase(), contentW - 28)
        pdf.text(titleLines, margin + 26, 20)
        const titleH = titleLines.length * 6
        pdf.setDrawColor(40, 40, 40); pdf.setLineWidth(0.3); pdf.line(margin, 27 + titleH, pageW - margin, 27 + titleH)
        pdf.setFont('helvetica', 'italic'); pdf.setFontSize(8.5); pdf.setTextColor(165, 165, 165)
        const expLines = pdf.splitTextToSize(chart.explanation, contentW)
        pdf.text(expLines, margin, 35 + titleH)
        const expH = expLines.length * 4.8
        const metaY = 35 + titleH + expH + 4
        const half = (contentW - 4) / 2
        pdf.setFillColor(18, 18, 18)
        pdf.roundedRect(margin, metaY, half, 13, 2, 2, 'F')
        pdf.roundedRect(margin + half + 4, metaY, half, 13, 2, 2, 'F')
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(7); pdf.setTextColor(249, 115, 22)
        pdf.text('X-AXIS', margin + 3, metaY + 5); pdf.text('Y-AXIS', margin + half + 7, metaY + 5)
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.setTextColor(220, 220, 220)
        pdf.text(String(chart.x_label), margin + 3, metaY + 11)
        pdf.text(String(chart.y_label), margin + half + 7, metaY + 11)
        const imgY = metaY + 18
        const imgH = pageH - imgY - margin
        try {
          const renderType = chart.type === 'line' ? 'line' : chart.type === 'pie' ? 'pie' : 'bar'
          const imgData = await chartToImage(chart, renderType as 'bar' | 'line' | 'pie', html2canvas)
          pdf.setDrawColor(249, 115, 22); pdf.setLineWidth(0.5); pdf.rect(margin, imgY, contentW, imgH)
          pdf.addImage(imgData, 'PNG', margin + 1, imgY + 1, contentW - 2, imgH - 2)
        } catch {
          pdf.setFillColor(12, 12, 12); pdf.rect(margin, imgY, contentW, imgH, 'F')
          pdf.setDrawColor(249, 115, 22); pdf.rect(margin, imgY, contentW, imgH)
        }
      }
      setPdfProgress('Saving file…')
      pdf.save(`analysis-report-${Date.now()}.pdf`)
    } catch (err) {
      console.error('PDF error:', err)
      alert('PDF failed. Make sure you ran: npm install jspdf html2canvas')
    } finally {
      setPdfLoading(false); setPdfProgress('')
    }
  }

  if (loading || status === 'loading') return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="space-y-4 text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-orange-500" />
        <p className="text-sm font-black tracking-widest text-white uppercase">Loading analysis…</p>
      </div>
    </div>
  )

  const totalPages   = data ? Math.ceil(data.charts.length / CHARTS_PER_PAGE) : 0
  const startIdx     = currentPage * CHARTS_PER_PAGE
  const chartsInPage = data ? data.charts.slice(startIdx, Math.min(startIdx + CHARTS_PER_PAGE, data.charts.length)) : []
  const safeActive   = data ? Math.min(activeChart, data.charts.length - 1) : 0
  const chart        = data?.charts[safeActive]

  const handlePageChange = (p: number) => { setCurrentPage(p); setActiveChart(p * CHARTS_PER_PAGE) }

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-black text-white">

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(100vw,18rem)] flex-col border-r border-white/10 bg-black transition-transform duration-300 ease-out lg:static lg:z-auto lg:w-72 lg:shrink-0 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="shrink-0 border-b border-white/10 p-4">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <Link href="/" className="font-black text-lg tracking-tight text-orange-500 uppercase">
                DataAI
              </Link>
              <p className="mt-1 text-xs font-black tracking-widest text-orange-500 uppercase">History</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white/40">{history.length}</span>
              <button
                type="button"
                onClick={closeSidebar}
                className="border border-white/10 p-2 text-white/70 transition hover:border-orange-500/50 hover:text-orange-400 lg:hidden"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <button
            onClick={handleNewAnalysis}
            className="flex w-full items-center justify-center gap-2 border border-orange-500/50 bg-orange-500/10 px-4 py-2.5 text-xs font-black tracking-widest text-orange-400 uppercase transition hover:bg-orange-500 hover:text-black"
          >
            <Plus className="h-3.5 w-3.5" />
            New Analysis
          </button>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto p-3">
          {history.length === 0 && (
            <div className="py-8 text-center">
              <FileText className="mx-auto mb-2 h-8 w-8 text-white/20" />
              <p className="text-xs font-bold tracking-widest text-white/40 uppercase">No history yet</p>
            </div>
          )}
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectHistory(item)}
              className={`group w-full border p-3 text-left transition ${
                activeAnalysisId === item.id
                  ? 'border-orange-500/50 border-l-4 border-l-orange-500 bg-orange-500/10'
                  : 'border-transparent border-l-4 border-l-transparent hover:border-white/10 hover:bg-white/5'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-xs font-black uppercase tracking-wide ${
                    activeAnalysisId === item.id ? 'text-orange-500' : 'text-white'
                  }`}>
                    {item.fileName}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs font-bold text-white/40">
                      {Array.isArray(item.charts) ? item.charts.length : 0} charts
                    </span>
                    <span className="text-white/20">·</span>
                    <span className="flex items-center gap-1 text-xs font-bold text-white/40">
                      <Clock className="h-2.5 w-2.5" />
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className={`mt-0.5 h-3.5 w-3.5 shrink-0 transition-opacity ${
                  activeAnalysisId === item.id ? 'text-orange-500 opacity-100' : 'text-white/30 opacity-0 group-hover:opacity-100'
                }`} />
              </div>
            </button>
          ))}
        </div>

        {session?.user && (
          <div className="shrink-0 border-t border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-orange-500 text-sm font-black text-black">
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-black tracking-wide text-white uppercase">{session.user.name}</p>
                <p className="truncate text-xs text-white/40">{session.user.email}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">

        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-white/10 bg-white/[0.02] px-3 py-3 sm:gap-3 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={openSidebar}
            className="shrink-0 border border-white/10 bg-white/5 p-2 text-white transition hover:border-orange-500/50 hover:text-orange-400 lg:hidden"
            aria-label="Open history"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => router.push('/analyze')}
            className="shrink-0 border border-white/10 bg-white/5 px-2 py-2 text-[10px] font-black tracking-widest text-white/80 uppercase transition hover:border-orange-500/50 sm:px-3 sm:text-xs"
          >
            Chat
          </button>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="shrink-0 border border-white/10 bg-white/5 p-2 text-white/80 transition hover:border-orange-500/50"
            title="Home"
          >
            <Home className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1 basis-full sm:basis-auto">
            <h1 className="truncate text-sm font-black leading-none tracking-tight text-white uppercase sm:text-lg">
              {data ? (history.find((h) => h.id === activeAnalysisId)?.fileName || 'Analysis Results') : 'Analysis Results'}
            </h1>
            {data && (
              <p className="mt-0.5 text-[10px] font-bold tracking-widest text-white/40 uppercase sm:text-xs">
                {data.charts.length} charts
                {data.cleaning_report.length > 0 && ` · ${data.cleaning_report.length} cleaning steps`}
              </p>
            )}
          </div>

          <div className="ml-auto flex shrink-0 flex-wrap items-center gap-2">
            {data && (
              <button
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                className="flex items-center gap-2 bg-orange-500 px-4 py-2 text-xs font-black tracking-widest text-black uppercase transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pdfLoading
                  ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /><span className="hidden sm:inline">{pdfProgress || 'Generating…'}</span></>
                  : <><Download className="h-3.5 w-3.5" /><span className="hidden sm:inline">PDF</span></>}
              </button>
            )}
            <button
              onClick={handleNewAnalysis}
              className="flex items-center gap-2 border border-white/20 px-3 py-2 text-xs font-black tracking-widest text-white/80 uppercase transition hover:border-orange-500/50 hover:text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New</span>
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          {!data ? (
            <div className="landing-grid-pattern flex min-h-96 flex-col items-center justify-center p-6 sm:p-12">
              <AnimateOnScroll className="max-w-md border border-white/10 bg-white/5 p-8 text-center shadow-[0_0_60px_-12px_rgba(249,115,22,0.25)] sm:p-12">
                <BarChart3 className="mx-auto mb-4 h-12 w-12 text-orange-500" />
                <p className="mb-2 text-xl font-black tracking-tight text-white uppercase">No Analysis Selected</p>
                <p className="mb-6 text-sm text-gray-400">
                  {history.length > 0 ? 'Open the menu and pick an analysis' : 'Upload a CSV to get started'}
                </p>
                <button
                  type="button"
                  onClick={history.length > 0 ? openSidebar : handleNewAnalysis}
                  className="bg-orange-500 px-8 py-3 text-sm font-black tracking-widest text-black uppercase transition hover:bg-orange-400"
                >
                  {history.length > 0 ? 'Open History' : 'New Analysis'}
                </button>
              </AnimateOnScroll>
            </div>
          ) : (
            <div className="landing-grid-pattern mx-auto max-w-7xl space-y-6 p-3 sm:space-y-8 sm:p-6">

              {data.cleaning_report.length > 0 && (
                <AnimateOnScroll>
                <div className="overflow-hidden border border-white/10 bg-white/5">
                  <div className="border-b border-white/10 px-6 py-4">
                    <h2 className="text-lg font-black tracking-tight text-white uppercase">Data Cleaning Report</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3 border-l-4 border-orange-500 pl-5">
                      {data.cleaning_report.map((line, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                          <span className="text-sm leading-relaxed text-gray-300">{line}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                </AnimateOnScroll>
              )}

              {data.charts.length > 0 && (
                <div className="space-y-6">

                  <AnimateOnScroll delay={80}>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
                      {chartsInPage.map((_, i) => {
                        const idx = startIdx + i
                        return (
                          <button key={idx} onClick={() => setActiveChart(idx)}
                            className={`border px-4 py-2 text-xs font-black tracking-widest uppercase transition ${
                              safeActive === idx
                                ? 'border-orange-500 bg-orange-500 text-black'
                                : 'border-white/20 bg-transparent text-white/70 hover:border-orange-500/50 hover:text-white'
                            }`}>
                            Chart {idx + 1}
                          </button>
                        )
                      })}
                      {totalPages > 1 && (
                        <span className="ml-auto self-center text-xs font-bold tracking-widest text-white/40 uppercase">
                          Page {currentPage + 1}/{totalPages}
                        </span>
                      )}
                    </div>

                    {totalPages > 1 && (
                      <div className="flex items-center justify-between border border-white/10 bg-white/5 px-4 py-2.5">
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}
                          className={`flex items-center gap-1.5 border px-4 py-2 text-xs font-black tracking-wide uppercase transition ${
                            currentPage === 0
                              ? 'cursor-not-allowed border-white/10 text-white/20'
                              : 'border-white/20 text-white hover:border-orange-500/50'
                          }`}>
                          <ChevronLeft className="h-3.5 w-3.5" />Prev
                        </button>
                        <div className="flex gap-1.5">
                          {Array.from({ length: totalPages }, (_, p) => (
                            <button key={p} onClick={() => handlePageChange(p)}
                              className={`h-8 w-8 border text-xs font-black transition ${
                                p === currentPage
                                  ? 'border-orange-500 bg-orange-500 text-black'
                                  : 'border-white/20 text-white hover:border-orange-500/50'
                              }`}>{p + 1}</button>
                          ))}
                        </div>
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1}
                          className={`flex items-center gap-1.5 border px-4 py-2 text-xs font-black tracking-wide uppercase transition ${
                            currentPage === totalPages - 1
                              ? 'cursor-not-allowed border-white/10 text-white/20'
                              : 'border-white/20 text-white hover:border-orange-500/50'
                          }`}>
                          Next<ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  </AnimateOnScroll>

                  {chart && (
                    <AnimateOnScroll delay={120}>
                    <div className="overflow-hidden border border-white/10 bg-white/5 shadow-[0_0_80px_-12px_rgba(249,115,22,0.2)]">
                      <div className="space-y-2 border-b border-orange-500/30 bg-black/40 px-6 py-5">
                        <div className="flex items-center gap-3">
                          <span className="bg-orange-500 px-2.5 py-1 text-xs font-black tracking-widest text-black uppercase">
                            #{safeActive + 1}
                          </span>
                          <span className="border border-white/20 px-2 py-0.5 text-xs font-black tracking-widest text-white/50 uppercase">
                            {chart.type}
                          </span>
                        </div>
                        <h2 className="text-2xl font-black leading-tight tracking-tight text-white uppercase md:text-3xl">
                          {chart.title}
                        </h2>
                        <p className="max-w-2xl border-l-2 border-orange-500/60 pl-4 text-sm leading-relaxed text-gray-400">
                          {chart.explanation}
                        </p>
                      </div>

                      <div className="space-y-5 bg-black p-4 sm:p-6">
                        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
                          {([
                            { type: 'bar' as const,  label: 'Bar',  icon: BarChart3 },
                            { type: 'line' as const, label: 'Line', icon: LineChartIcon },
                            { type: 'pie' as const,  label: 'Pie',  icon: PieChartIcon },
                          ] as const).map(({ type: t, label, icon: Icon }) => (
                            <button key={t} onClick={() => setChartType(t)}
                              className={`flex items-center gap-1.5 border px-4 py-2 text-xs font-black tracking-widest uppercase transition ${
                                chartType === t
                                  ? 'border-orange-500 bg-orange-500 text-black'
                                  : 'border-white/20 text-white/60 hover:border-orange-500/50 hover:text-white'
                              }`}>
                              <Icon className="h-3.5 w-3.5" />{label}
                            </button>
                          ))}
                        </div>

                        <div className="border border-white/10 bg-black p-2 sm:p-5">
                          <ChartComponent
                            type={chartType}
                            data={chart}
                            height={chartHeight}
                            key={`${safeActive}-${chartType}`}
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="border border-white/10 border-l-4 border-l-orange-500 bg-white/5 p-4">
                            <p className="text-xs font-black tracking-widest text-orange-500 uppercase">X-Axis</p>
                            <p className="mt-1 text-base font-black tracking-tight text-white uppercase">{chart.x_label}</p>
                            <p className="mt-1 text-xs font-bold text-white/40">{chart.x.length} data points</p>
                          </div>
                          <div className="border border-white/10 border-l-4 border-l-orange-500 bg-white/5 p-4">
                            <p className="text-xs font-black tracking-widest text-orange-500 uppercase">Y-Axis</p>
                            <p className="mt-1 text-base font-black tracking-tight text-white uppercase">{chart.y_label}</p>
                            <p className="mt-1 text-xs font-bold text-white/40">{chart.y.length} data points</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    </AnimateOnScroll>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}