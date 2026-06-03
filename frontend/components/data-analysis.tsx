'use client'
import { useState } from 'react'
import { ChartComponent } from './chart-component'
import { ArrowLeft, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'

interface DataAnalysisProps {
  data: {
    cleaning_report: string[]
    charts: Array<{
      title: string
      explanation: string
      type: string
      x: number[]
      y: number[]
      x_label: string
      y_label: string
    }>
  }
  onReset: () => void
}

const CHARTS_PER_PAGE = 10

export function DataAnalysis({ data, onReset }: DataAnalysisProps) {
  const [activeChart, setActiveChart] = useState(0)
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar')
  const [currentPage, setCurrentPage] = useState(0)
  
  const totalPages = Math.ceil(data.charts.length / CHARTS_PER_PAGE)
  const startIdx = currentPage * CHARTS_PER_PAGE
  const endIdx = Math.min(startIdx + CHARTS_PER_PAGE, data.charts.length)
  const chartsInPage = data.charts.slice(startIdx, endIdx)
  const localActiveChart = activeChart - startIdx

  const chart = data.charts[activeChart]

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    setActiveChart(newPage * CHARTS_PER_PAGE)
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500 bg-black">
      {/* Header */}
      <div className="border-b-4 border-white pb-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 space-y-4">
            <h1 className="text-6xl md:text-7xl font-bold tracking-tighter leading-none text-white">
              ANALYSIS<br />RESULTS
            </h1>
            <p className="text-base font-bold tracking-wide text-white/80 uppercase">
              {data.charts.length} Charts Ready • Page {currentPage + 1} of {totalPages}
            </p>
          </div>
          <button
            onClick={onReset}
            className="border-4 border-white bg-white text-black px-8 py-4 font-black tracking-widest uppercase transition-all duration-300 hover:bg-black hover:text-white"
          >
            <ArrowLeft className="h-5 w-5 inline mr-2" />
            Back
          </button>
        </div>
      </div>

      {/* Cleaning Report */}
      {data.cleaning_report.length > 0 && (
        <div className="border-4 border-white bg-gray-950 p-0 animate-in slide-in-from-bottom duration-500 overflow-hidden">
          <div className="border-b-4 border-white p-6">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">
              Data Cleaning Report
            </h2>
          </div>
          <div className="p-8">
            <div className="space-y-4 pl-6 border-l-4 border-orange-500">
              {data.cleaning_report.map((line: string, i: number) => (
                <div
                  key={i}
                  className="flex items-start gap-4 animate-in slide-in-from-left"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <CheckCircle2 className="h-6 w-6 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-white font-bold leading-relaxed text-base">{line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {data.charts.length > 0 && (
        <div className="space-y-10">
          {/* Chart Tabs with Pagination */}
          {chartsInPage.length > 0 && (
            <div className="space-y-4">
              <div className="flex gap-2 border-b-4 border-white pb-4 overflow-x-auto flex-wrap">
                {chartsInPage.map((_, i) => {
                  const actualIdx = startIdx + i
                  return (
                    <button
                      key={actualIdx}
                      onClick={() => setActiveChart(actualIdx)}
                      className={`whitespace-nowrap px-6 py-3 font-black transition-all duration-300 border-2 text-sm uppercase tracking-wide ${
                        activeChart === actualIdx
                          ? 'bg-orange-500 border-orange-600 text-white'
                          : 'bg-black border-white text-white hover:bg-white hover:text-black'
                      }`}
                    >
                      Chart {actualIdx + 1}
                    </button>
                  )
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-4 border-white bg-gray-950 p-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className={`flex items-center gap-2 px-6 py-3 font-black border-2 transition-all duration-300 uppercase tracking-wide ${
                      currentPage === 0
                        ? 'border-gray-600 text-gray-600 cursor-not-allowed'
                        : 'border-white text-white hover:bg-white hover:text-black'
                    }`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                    Previous
                  </button>
                  <span className="font-black text-white uppercase tracking-widest">
                    {currentPage + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    className={`flex items-center gap-2 px-6 py-3 font-black border-2 transition-all duration-300 uppercase tracking-wide ${
                      currentPage === totalPages - 1
                        ? 'border-gray-600 text-gray-600 cursor-not-allowed'
                        : 'border-white text-white hover:bg-white hover:text-black'
                    }`}
                  >
                    Next
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Chart Display */}
          <div className="border-4 border-white bg-black p-0 animate-in fade-in duration-500 overflow-hidden">
            {/* Card Header */}
            <div className="bg-black p-8 border-b-4 border-orange-500">
              <div className="space-y-4">
                <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">
                  {chart.title}
                </h2>
                <p className="text-gray-300 leading-relaxed text-base pl-4 border-l-4 border-orange-500 font-bold">
                  {chart.explanation}
                </p>
              </div>
            </div>

            <div className="bg-gray-950 p-10 space-y-8">
              {/* Chart Type Selector */}
              <div className="flex gap-2 overflow-x-auto pb-2 border-b-4 border-orange-500">
                {[
                  { type: 'bar' as const, label: 'Bar Chart', icon: BarChart3 },
                  { type: 'line' as const, label: 'Line Chart', icon: LineChartIcon },
                  { type: 'pie' as const, label: 'Pie Chart', icon: PieChartIcon }
                ].map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    className={`flex items-center gap-2 px-6 py-3 font-black text-sm transition-all duration-300 border-2 whitespace-nowrap uppercase tracking-wide ${
                      chartType === type
                        ? 'bg-orange-500 border-orange-600 text-white'
                        : 'bg-gray-950 border-white text-white hover:bg-white hover:text-black'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Chart Rendering */}
              <div className="min-h-96 flex items-center justify-center bg-black rounded-lg border-4 border-orange-500 p-8 relative overflow-hidden">
                <ChartComponent
                  type={chartType}
                  data={chart}
                  key={`${activeChart}-${chartType}`}
                />
              </div>

              {/* Chart Info */}
              <div className="grid grid-cols-2 gap-6 border-t-4 border-white pt-8">
                <div className="space-y-3 pl-6 border-l-4 border-orange-500 bg-gray-900 p-5">
                  <p className="text-xs uppercase tracking-widest font-black text-orange-500">
                    X-Axis
                  </p>
                  <p className="text-2xl font-black text-white">
                    {chart.x_label}
                  </p>
                  <p className="text-sm text-gray-400 font-bold">
                    {chart.x.length} data points
                  </p>
                </div>
                <div className="space-y-3 pl-6 border-l-4 border-orange-500 bg-gray-900 p-5">
                  <p className="text-xs uppercase tracking-widest font-black text-orange-500">
                    Y-Axis
                  </p>
                  <p className="text-2xl font-black text-white">
                    {chart.y_label}
                  </p>
                  <p className="text-sm text-gray-400 font-bold">
                    {chart.y.length} data points
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
