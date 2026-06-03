'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createRoot } from 'react-dom/client'
import {
  ArrowLeft, BarChart3, LineChart as LineChartIcon,
  PieChart as PieChartIcon, CheckCircle2,
  ChevronLeft, ChevronRight, Download, Loader2,
} from 'lucide-react'
import { ChartComponent } from '@/components/chart-component'
import {useSession} from "next-auth/react"

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

// ── Screenshot a Recharts chart rendered in a hidden div ─────────────
async function chartToImage(chart: ChartData, type: 'bar' | 'line' | 'pie', html2canvas: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const container = document.createElement('div')
    container.style.cssText = `
      position:fixed; left:-9999px; top:0;
      width:700px; height:360px;
      background:#000000; padding:16px;
    `
    document.body.appendChild(container)
    const root = createRoot(container)
    root.render(<ChartComponent type={type} data={chart} height={320} />)

    // wait for Recharts animation to settle (default duration ~800ms)
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(container, {
          backgroundColor: '#000000',
          scale: 2,
          useCORS: true,
          logging: false,
        })
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

export default function ResultsPage() {
  const router = useRouter()
  const session = useSession()
  const [data, setData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeChart, setActiveChart] = useState(0)
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar')
  const [currentPage, setCurrentPage] = useState(0)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfProgress, setPdfProgress] = useState('')

  useEffect(()=>{
    if(session.status !== 'authenticated'){
      router.push('/login')
    }
  }, [session.status, router])

  // we need to fix the bug here when user refresh the page the data is there but after refreshing user can't get access of the result again
useEffect(() => {
    const saved = 
        sessionStorage.getItem('analysisData') || 
        localStorage.getItem('analysisData')    // fallback to localStorage
    
    if (saved) {
        setData(JSON.parse(saved))
        setLoading(false)
    } else {
        router.push('/analyze')
    }
}, [router])

  // ── PDF generation ──────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    if (!data) return
    setPdfLoading(true)
    setPdfProgress('Loading libraries…')

    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ])

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = 210, pageH = 297, margin = 14
      const contentW = pageW - margin * 2

      // draw black page with orange left bar
      const newPage = () => {
        pdf.setFillColor(0, 0, 0)
        pdf.rect(0, 0, pageW, pageH, 'F')
        pdf.setFillColor(249, 115, 22)
        pdf.rect(0, 0, 5, pageH, 'F')
      }

      // ── COVER PAGE ──────────────────────────────────────────────────
      newPage()

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(30)
      pdf.setTextColor(255, 255, 255)
      pdf.text('AI DATA', margin + 2, 30)
      pdf.setTextColor(249, 115, 22)
      pdf.text('ANALYSIS', margin + 2, 44)
      pdf.setTextColor(255, 255, 255)
      pdf.text('REPORT', margin + 2, 58)

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(9)
      pdf.setTextColor(110, 110, 110)
      pdf.text(
        `Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
        margin + 2, 68
      )
      pdf.text(`${data.charts.length} charts  •  ${data.cleaning_report.length} cleaning steps`, margin + 2, 74)

      pdf.setDrawColor(249, 115, 22)
      pdf.setLineWidth(0.5)
      pdf.line(margin, 82, pageW - margin, 82)

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(12)
      pdf.setTextColor(249, 115, 22)
      pdf.text('DATA CLEANING REPORT', margin + 2, 94)

      let cy = 104
      data.cleaning_report.forEach((line) => {
        if (cy > pageH - 16) { pdf.addPage(); newPage(); cy = 22 }
        pdf.setFillColor(249, 115, 22)
        pdf.circle(margin + 3, cy - 1.5, 1.3, 'F')
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(9)
        pdf.setTextColor(205, 205, 205)
        const lines = pdf.splitTextToSize(line, contentW - 8)
        pdf.text(lines, margin + 7, cy)
        cy += lines.length * 5 + 3
      })

      // ── ONE PAGE PER CHART ───────────────────────────────────────────
      for (let i = 0; i < data.charts.length; i++) {
        const chart = data.charts[i]
        setPdfProgress(`Rendering chart ${i + 1} of ${data.charts.length}…`)

        pdf.addPage()
        newPage()

        // badge
        pdf.setFillColor(249, 115, 22)
        pdf.rect(margin, 14, 22, 8, 'F')
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(8)
        pdf.setTextColor(0, 0, 0)
        pdf.text(`CHART ${i + 1}`, margin + 2, 19.5)

        // title
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(14)
        pdf.setTextColor(255, 255, 255)
        const titleLines = pdf.splitTextToSize(chart.title.toUpperCase(), contentW - 28)
        pdf.text(titleLines, margin + 26, 20)
        const titleH = titleLines.length * 6

        // divider
        pdf.setDrawColor(40, 40, 40)
        pdf.setLineWidth(0.3)
        pdf.line(margin, 27 + titleH, pageW - margin, 27 + titleH)

        // explanation
        pdf.setFont('helvetica', 'italic')
        pdf.setFontSize(8.5)
        pdf.setTextColor(165, 165, 165)
        const expLines = pdf.splitTextToSize(chart.explanation, contentW)
        pdf.text(expLines, margin, 35 + titleH)
        const expH = expLines.length * 4.8

        // axis boxes
        const metaY = 35 + titleH + expH + 4
        const half = (contentW - 4) / 2
        pdf.setFillColor(18, 18, 18)
        pdf.roundedRect(margin, metaY, half, 13, 2, 2, 'F')
        pdf.roundedRect(margin + half + 4, metaY, half, 13, 2, 2, 'F')
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(7)
        pdf.setTextColor(249, 115, 22)
        pdf.text('X-AXIS', margin + 3, metaY + 5)
        pdf.text('Y-AXIS', margin + half + 7, metaY + 5)
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(9)
        pdf.setTextColor(220, 220, 220)
        pdf.text(String(chart.x_label), margin + 3, metaY + 11)
        pdf.text(String(chart.y_label), margin + half + 7, metaY + 11)

        // ── chart image ──
        const imgY = metaY + 18
        const imgH = pageH - imgY - margin

        try {
          const renderType = chart.type === 'line' ? 'line' : chart.type === 'pie' ? 'pie' : 'bar'
          const imgData = await chartToImage(chart, renderType as 'bar' | 'line' | 'pie', html2canvas)

          pdf.setDrawColor(249, 115, 22)
          pdf.setLineWidth(0.5)
          pdf.rect(margin, imgY, contentW, imgH)
          pdf.addImage(imgData, 'PNG', margin + 1, imgY + 1, contentW - 2, imgH - 2)
        } catch {
          // fallback: show data table if screenshot fails
          pdf.setFillColor(12, 12, 12)
          pdf.rect(margin, imgY, contentW, imgH, 'F')
          pdf.setDrawColor(249, 115, 22)
          pdf.rect(margin, imgY, contentW, imgH)
          pdf.setFillColor(25, 25, 25)
          pdf.rect(margin, imgY, contentW, 8, 'F')
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(7.5)
          pdf.setTextColor(249, 115, 22)
          pdf.text(String(chart.x_label).toUpperCase(), margin + 4, imgY + 5.5)
          pdf.text(String(chart.y_label).toUpperCase(), margin + contentW / 2 + 4, imgY + 5.5)
          const rows = Math.min(chart.x.length, Math.floor((imgH - 12) / 6))
          for (let r = 0; r < rows; r++) {
            const ry = imgY + 10 + r * ((imgH - 12) / rows)
            if (r % 2 === 0) { pdf.setFillColor(18, 18, 18); pdf.rect(margin, ry, contentW, (imgH - 12) / rows, 'F') }
            pdf.setFont('helvetica', 'normal')
            pdf.setFontSize(7)
            pdf.setTextColor(190, 190, 190)
            pdf.text(String(chart.x[r] ?? '').slice(0, 30), margin + 4, ry + 4)
            pdf.text(
              typeof chart.y[r] === 'number' ? chart.y[r].toLocaleString(undefined, { maximumFractionDigits: 2 }) : String(chart.y[r] ?? ''),
              margin + contentW / 2 + 4, ry + 4
            )
          }
        }
      }

      setPdfProgress('Saving file…')
      pdf.save(`analysis-report-${Date.now()}.pdf`)
    } catch (err) {
      console.error('PDF error:', err)
      alert('PDF failed. Make sure you ran: npm install jspdf html2canvas')
    } finally {
      setPdfLoading(false)
      setPdfProgress('')
    }
  }

  // ── Loading ─────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-white font-black text-lg uppercase tracking-widest">Loading…</p>
      </div>
    </div>
  )
  if (!data) return null

  // ── Pagination ──────────────────────────────────────────────────────
  const totalPages   = Math.ceil(data.charts.length / CHARTS_PER_PAGE)
  const startIdx     = currentPage * CHARTS_PER_PAGE
  const chartsInPage = data.charts.slice(startIdx, Math.min(startIdx + CHARTS_PER_PAGE, data.charts.length))
  const safeActive   = Math.min(activeChart, data.charts.length - 1)
  const chart        = data.charts[safeActive]

  const handlePageChange = (p: number) => { setCurrentPage(p); setActiveChart(p * CHARTS_PER_PAGE) }
  const handleReset = () => { sessionStorage.removeItem('analysisData'); router.push('/analyze') }

  return (
    <div className="bg-black min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12 animate-in fade-in duration-500">

        {/* Header */}
        <div className="border-b-4 border-white pb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <h1 className="text-6xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">
                Analysis<br />Results
              </h1>
              <p className="text-sm font-bold tracking-widest text-white/60 uppercase">
                {data.charts.length} Charts &bull; Page {currentPage + 1} / {totalPages}
              </p>
            </div>
            <div className="flex gap-3 flex-wrap items-start">
              <button
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                className="flex items-center gap-2 border-4 border-orange-500 bg-orange-500 text-white px-6 py-4 font-black tracking-widest uppercase transition-all duration-300 hover:bg-black hover:text-orange-500 disabled:opacity-60 disabled:cursor-not-allowed min-w-[190px] justify-center"
              >
                {pdfLoading
                  ? <><Loader2 className="h-5 w-5 animate-spin flex-shrink-0" /><span className="truncate text-xs">{pdfProgress}</span></>
                  : <><Download className="h-5 w-5" />Download PDF</>}
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 border-4 border-white bg-white text-black px-6 py-4 font-black tracking-widest uppercase transition-all duration-300 hover:bg-black hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />Back
              </button>
            </div>
          </div>
        </div>

        {/* Cleaning Report */}
        {data.cleaning_report.length > 0 && (
          <div className="border-4 border-white bg-gray-950 overflow-hidden">
            <div className="border-b-4 border-white px-6 py-4">
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Data Cleaning Report</h2>
            </div>
            <div className="p-8">
              <div className="space-y-4 pl-6 border-l-4 border-orange-500">
                {data.cleaning_report.map((line, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-white font-bold leading-relaxed text-sm">{line}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        {data.charts.length > 0 && (
          <div className="space-y-8">

            {/* Tab strip + pagination */}
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap border-b-4 border-white pb-4">
                {chartsInPage.map((_, i) => {
                  const idx = startIdx + i
                  return (
                    <button key={idx} onClick={() => setActiveChart(idx)}
                      className={`px-5 py-2.5 font-black border-2 text-xs uppercase tracking-widest transition-all duration-200 ${
                        safeActive === idx ? 'bg-orange-500 border-orange-500 text-white' : 'bg-black border-white text-white hover:bg-white hover:text-black'
                      }`}>
                      Chart {idx + 1}
                    </button>
                  )
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-4 border-white bg-gray-950 px-5 py-3">
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}
                    className={`flex items-center gap-2 px-5 py-2 font-black border-2 uppercase tracking-wide text-xs transition-all duration-200 ${
                      currentPage === 0 ? 'border-gray-700 text-gray-700 cursor-not-allowed' : 'border-white text-white hover:bg-white hover:text-black'
                    }`}>
                    <ChevronLeft className="h-4 w-4" />Prev
                  </button>
                  <div className="flex gap-1.5 flex-wrap justify-center">
                    {Array.from({ length: totalPages }, (_, p) => (
                      <button key={p} onClick={() => handlePageChange(p)}
                        className={`w-8 h-8 font-black text-xs border-2 transition-all duration-200 ${
                          p === currentPage ? 'bg-orange-500 border-orange-500 text-white' : 'border-white text-white hover:bg-white hover:text-black'
                        }`}>
                        {p + 1}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1}
                    className={`flex items-center gap-2 px-5 py-2 font-black border-2 uppercase tracking-wide text-xs transition-all duration-200 ${
                      currentPage === totalPages - 1 ? 'border-gray-700 text-gray-700 cursor-not-allowed' : 'border-white text-white hover:bg-white hover:text-black'
                    }`}>
                    Next<ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Active chart card */}
            <div className="border-4 border-white bg-black overflow-hidden">
              <div className="bg-black px-8 py-6 border-b-4 border-orange-500 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="bg-orange-500 text-black text-xs font-black px-3 py-1 uppercase tracking-widest">Chart {safeActive + 1}</span>
                  <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">{chart.type}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-tight">{chart.title}</h2>
                <p className="text-gray-300 leading-relaxed text-sm pl-4 border-l-4 border-orange-500 font-medium max-w-3xl">{chart.explanation}</p>
              </div>

              <div className="bg-gray-950 p-8 space-y-6">
                {/* Type selector */}
                <div className="flex gap-2 flex-wrap border-b-4 border-orange-500 pb-4">
                  {([
                    { type: 'bar' as const,  label: 'Bar',  icon: BarChart3 },
                    { type: 'line' as const, label: 'Line', icon: LineChartIcon },
                    { type: 'pie' as const,  label: 'Pie',  icon: PieChartIcon },
                  ] as const).map(({ type: t, label, icon: Icon }) => (
                    <button key={t} onClick={() => setChartType(t)}
                      className={`flex items-center gap-2 px-5 py-2.5 font-black text-xs border-2 uppercase tracking-widest transition-all duration-200 ${
                        chartType === t ? 'bg-orange-500 border-orange-500 text-white' : 'bg-gray-950 border-white text-white hover:bg-white hover:text-black'
                      }`}>
                      <Icon className="h-4 w-4" />{label}
                    </button>
                  ))}
                </div>

                {/* Chart render */}
                <div className="bg-black border-4 border-orange-500 p-6">
                  <ChartComponent type={chartType} data={chart} height={360} key={`${safeActive}-${chartType}`} />
                </div>

                {/* Axis info */}
                <div className="grid grid-cols-2 gap-4 border-t-4 border-white pt-6">
                  <div className="bg-gray-900 p-4 pl-5 border-l-4 border-orange-500 space-y-1">
                    <p className="text-orange-500 text-xs font-black uppercase tracking-widest">X-Axis</p>
                    <p className="text-white font-black text-lg">{chart.x_label}</p>
                    <p className="text-gray-500 text-xs font-bold">{chart.x.length} data points</p>
                  </div>
                  <div className="bg-gray-900 p-4 pl-5 border-l-4 border-orange-500 space-y-1">
                    <p className="text-orange-500 text-xs font-black uppercase tracking-widest">Y-Axis</p>
                    <p className="text-white font-black text-lg">{chart.y_label}</p>
                    <p className="text-gray-500 text-xs font-bold">{chart.y.length} data points</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}