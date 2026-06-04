'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createRoot } from 'react-dom/client'
import { useSession } from 'next-auth/react'
import {
  BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon,
  CheckCircle2, ChevronLeft, ChevronRight, Download, Loader2,
  Clock, FileText, Plus, ChevronDown, ArrowUpRight
} from 'lucide-react'
import { ChartComponent } from '@/components/chart-component'

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
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

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
      columns: { date: [], number: [], text: [] }
    })
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
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-white font-black text-lg uppercase tracking-widest">Loading…</p>
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
    <div className="bg-black min-h-screen flex" style={{ fontFamily: "'DM Mono', monospace" }}>

      {/* ── SIDEBAR ── */}
      <aside
        className="flex flex-col transition-all duration-300 rounded-r-3xl border-r border-gray-800"
        style={{ width: sidebarOpen ? '280px' : '0px', minWidth: sidebarOpen ? '280px' : '0px', overflow: 'hidden', background: '#0b0b0b' }}
      >
        {/* Sidebar header */}
        <div className="border-b border-gray-800 p-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-orange-500 font-black text-xs uppercase tracking-widest">History</p>
            <span className="text-gray-600 text-xs font-bold">{history.length} analyses</span>
          </div>
          <button
            onClick={handleNewAnalysis}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-orange-500/60 bg-orange-500/10 text-orange-400 px-4 py-2.5 font-black text-xs uppercase tracking-widest hover:bg-orange-500 hover:text-black transition-all duration-200"
          >
            <Plus className="h-3.5 w-3.5" />
            New Analysis
          </button>
        </div>

        {/* History list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {history.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 text-gray-700 mx-auto mb-2" />
              <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">No history yet</p>
            </div>
          )}
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectHistory(item)}
              className={`w-full text-left rounded-2xl p-3 border transition-all duration-200 group ${
                activeAnalysisId === item.id
                  ? 'border-orange-500/70 bg-orange-500/10'
                  : 'border-gray-800 hover:border-gray-700 hover:bg-white/5'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-black uppercase tracking-wide truncate ${
                    activeAnalysisId === item.id ? 'text-orange-500' : 'text-white'
                  }`}>
                    {item.fileName}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-600 text-xs font-bold">
                      {Array.isArray(item.charts) ? item.charts.length : 0} charts
                    </span>
                    <span className="text-gray-700">·</span>
                    <span className="text-gray-600 text-xs font-bold flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className={`h-3.5 w-3.5 flex-shrink-0 mt-0.5 transition-opacity ${
                  activeAnalysisId === item.id ? 'text-orange-500 opacity-100' : 'text-gray-600 opacity-0 group-hover:opacity-100'
                }`} />
              </div>
            </button>
          ))}
        </div>

        {/* Sidebar footer */}
        {session?.user && (
          <div className="border-t border-gray-800 p-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 flex items-center justify-center font-black text-black text-sm flex-shrink-0">
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-white font-black text-xs uppercase tracking-wide truncate">{session.user.name}</p>
                <p className="text-gray-600 text-xs truncate">{session.user.email}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Top bar */}
        <div className="border-b border-gray-800 px-6 py-4 flex items-center gap-4 flex-shrink-0 rounded-b-3xl" style={{ background: '#0b0b0b' }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-xl border border-gray-700 bg-black/80 text-white p-2 hover:bg-white hover:text-black transition-all duration-200 flex-shrink-0"
            title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${sidebarOpen ? '' : 'rotate-180'}`} />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-white font-black text-lg uppercase tracking-tighter leading-none truncate">
              {data ? (history.find(h => h.id === activeAnalysisId)?.fileName || 'Analysis Results') : 'No Analysis Selected'}
            </h1>
            {data && (
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-0.5">
                {data.charts.length} charts
                {data.cleaning_report.length > 0 && ` • ${data.cleaning_report.length} cleaning steps`}
              </p>
            )}
          </div>

          <div className="flex gap-2 flex-shrink-0">
            {data && (
              <button
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                className="flex items-center gap-2 rounded-2xl border border-orange-500/70 bg-orange-500 text-black px-4 py-2 font-black text-xs uppercase tracking-widest hover:bg-orange-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pdfLoading
                  ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /><span>{pdfProgress || 'Generating…'}</span></>
                  : <><Download className="h-3.5 w-3.5" />PDF</>}
              </button>
            )}
            <button
              onClick={handleNewAnalysis}
              className="flex items-center gap-2 rounded-2xl border border-gray-700 bg-black/70 text-white px-4 py-2 font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-200"
            >
              <Plus className="h-3.5 w-3.5" />
              New
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          {!data ? (
            // Empty state
            <div className="flex flex-col items-center justify-center h-full min-h-96 space-y-6 p-12">
              <div className="rounded-3xl border border-dashed border-gray-800 bg-black/80 p-12 text-center max-w-md shadow-[0_18px_60px_-35px_rgba(249,115,22,0.35)]">
                <BarChart3 className="h-12 w-12 text-gray-700 mx-auto mb-4" />
                <p className="text-white font-black text-xl uppercase tracking-tighter mb-2">No Analysis Selected</p>
                <p className="text-gray-600 text-sm font-bold uppercase tracking-wide mb-6">
                  {history.length > 0 ? 'Pick one from your history or start fresh' : 'Upload a CSV to get started'}
                </p>
                <button
                  onClick={handleNewAnalysis}
                  className="rounded-2xl border border-orange-500/70 bg-orange-500 text-black px-8 py-3 font-black text-sm uppercase tracking-widest hover:bg-orange-400 transition-all duration-200"
                >
                  New Analysis
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-8 max-w-7xl mx-auto">

              {/* Cleaning Report */}
              {data.cleaning_report.length > 0 && (
                <div className="rounded-3xl border border-gray-800 bg-[#111111] overflow-hidden shadow-[0_18px_60px_-35px_rgba(0,0,0,0.75)]">
                  <div className="border-b border-gray-800 px-6 py-3">
                    <h2 className="text-lg font-black text-white tracking-tighter uppercase">Data Cleaning Report</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3 pl-5 border-l-4 border-orange-500">
                      {data.cleaning_report.map((line, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                          <span className="text-white font-bold leading-relaxed text-xs uppercase tracking-wide">{line}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Charts */}
              {data.charts.length > 0 && (
                <div className="space-y-6">

                  {/* Chart tabs */}
                  <div className="space-y-3">
                    <div className="flex gap-2 flex-wrap border-b border-gray-800 pb-3">
                      {chartsInPage.map((_, i) => {
                        const idx = startIdx + i
                        return (
                          <button key={idx} onClick={() => setActiveChart(idx)}
                            className={`rounded-xl px-4 py-2 font-black border text-xs uppercase tracking-widest transition-all duration-200 ${
                              safeActive === idx ? 'bg-orange-500 border-orange-500 text-black' : 'bg-black border-gray-700 text-white hover:bg-white hover:text-black'
                            }`}>
                            {idx + 1}
                          </button>
                        )
                      })}
                      {/* page indicator */}
                      {totalPages > 1 && (
                        <span className="ml-auto text-gray-600 text-xs font-bold uppercase tracking-widest self-center">
                          Page {currentPage + 1}/{totalPages}
                        </span>
                      )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between rounded-2xl border border-gray-800 bg-black/70 px-4 py-2.5">
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}
                          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 font-black border uppercase tracking-wide text-xs transition-all duration-200 ${
                            currentPage === 0 ? 'border-gray-800 text-gray-700 cursor-not-allowed' : 'border-gray-700 text-white hover:bg-white hover:text-black'
                          }`}>
                          <ChevronLeft className="h-3.5 w-3.5" />Prev
                        </button>
                        <div className="flex gap-1.5">
                          {Array.from({ length: totalPages }, (_, p) => (
                            <button key={p} onClick={() => handlePageChange(p)}
                              className={`w-7 h-7 rounded-xl font-black text-xs border transition-all duration-200 ${
                                p === currentPage ? 'bg-orange-500 border-orange-500 text-black' : 'border-gray-700 text-white hover:bg-white hover:text-black'
                              }`}>{p + 1}</button>
                          ))}
                        </div>
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1}
                          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 font-black border uppercase tracking-wide text-xs transition-all duration-200 ${
                            currentPage === totalPages - 1 ? 'border-gray-800 text-gray-700 cursor-not-allowed' : 'border-gray-700 text-white hover:bg-white hover:text-black'
                          }`}>
                          Next<ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Active chart */}
                  {chart && (
                    <div className="rounded-3xl border border-gray-800 bg-black overflow-hidden shadow-[0_18px_60px_-35px_rgba(249,115,22,0.25)]">
                      {/* Chart header */}
                      <div className="px-6 py-5 border-b border-orange-500/30 space-y-2" style={{ background: '#111111' }}>
                        <div className="flex items-center gap-3">
                          <span className="bg-orange-500 text-black text-xs font-black px-2.5 py-1 uppercase tracking-widest">
                            #{safeActive + 1}
                          </span>
                          <span className="text-gray-400 text-xs font-black uppercase tracking-widest border border-gray-700 rounded-full px-2 py-0.5">
                            {chart.type}
                          </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-tight">
                          {chart.title}
                        </h2>
                        <p className="text-gray-300 text-sm pl-4 border-l border-orange-500/70 font-medium leading-relaxed max-w-2xl">
                          {chart.explanation}
                        </p>
                      </div>

                      <div className="p-6 space-y-5" style={{ background: '#0d0d0d' }}>
                        {/* Chart type selector */}
                        <div className="flex gap-2 border-b border-gray-800 pb-4">
                          {([
                            { type: 'bar' as const,  label: 'Bar',  icon: BarChart3 },
                            { type: 'line' as const, label: 'Line', icon: LineChartIcon },
                            { type: 'pie' as const,  label: 'Pie',  icon: PieChartIcon },
                          ] as const).map(({ type: t, label, icon: Icon }) => (
                            <button key={t} onClick={() => setChartType(t)}
                              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 font-black text-xs border uppercase tracking-widest transition-all duration-200 ${
                                chartType === t ? 'bg-orange-500 border-orange-500 text-black' : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
                              }`}>
                              <Icon className="h-3.5 w-3.5" />{label}
                            </button>
                          ))}
                        </div>

                        {/* Chart */}
                        <div className="rounded-3xl bg-black border border-gray-800 p-5">
                          <ChartComponent type={chartType} data={chart} height={360} key={`${safeActive}-${chartType}`} />
                        </div>

                        {/* Axis info */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl bg-black border border-gray-800 border-l-4 border-l-orange-500/80 p-4 space-y-1">
                            <p className="text-orange-500 text-xs font-black uppercase tracking-widest">X-Axis</p>
                            <p className="text-white font-black text-base uppercase tracking-tight">{chart.x_label}</p>
                            <p className="text-gray-600 text-xs font-bold">{chart.x.length} points</p>
                          </div>
                          <div className="rounded-2xl bg-black border border-gray-800 border-l-4 border-l-orange-500/80 p-4 space-y-1">
                            <p className="text-orange-500 text-xs font-black uppercase tracking-widest">Y-Axis</p>
                            <p className="text-white font-black text-base uppercase tracking-tight">{chart.y_label}</p>
                            <p className="text-gray-600 text-xs font-bold">{chart.y.length} points</p>
                          </div>
                        </div>
                      </div>
                    </div>
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