'use client'
import { Upload } from 'lucide-react'

interface FileUploadProps {
  file: File | null
  loading: boolean
  onFileChange: (file: File | null) => void
  onAnalyze: () => void
}

export function FileUpload({
  file,
  loading,
  onFileChange,
  onAnalyze,
}: FileUploadProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
      <div className="w-full max-w-2xl space-y-12 animate-in fade-in duration-500 border-4 border-white p-12">
        {/* Header */}
        <div className="space-y-6 text-center border-b-4 border-white pb-8">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-bold tracking-tighter leading-none text-white">
              DATA<br />ANALYSIS
            </h1>
            <p className="text-lg font-bold tracking-wide text-white/80 uppercase">
              Upload your CSV file to visualize insights
            </p>
          </div>
        </div>

        {/* Upload Area */}
        <div className="space-y-6">
          <label className="group relative block cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
              className="hidden"
              disabled={loading}
            />
            <div className="border-4 border-dashed border-white bg-gray-950 p-12 text-center transition-all duration-300 hover:bg-gray-900 group-hover:border-orange-500">
              <div className="space-y-4">
                <Upload className="mx-auto h-12 w-12 text-white group-hover:text-orange-500 transition-colors" />
                <div className="space-y-2">
                  <p className="text-base font-black text-white uppercase tracking-wide">
                    {file ? 'File Selected' : 'Click or Drag File'}
                  </p>
                  <p className="text-sm font-bold text-white/70 uppercase">
                    {file ? file.name : 'CSV Files Only'}
                  </p>
                </div>
              </div>
            </div>
          </label>

          {file && (
            <div className="border-4 border-orange-500 bg-gray-950 p-4 animate-in slide-in-from-bottom duration-300">
              <p className="font-bold text-white tracking-wide uppercase">{file.name}</p>
            </div>
          )}

          <button
            onClick={onAnalyze}
            disabled={!file || loading}
            className={`w-full border-4 font-black tracking-widest uppercase py-4 transition-all duration-300 text-lg ${
              !file || loading
                ? 'border-gray-600 bg-gray-900 text-gray-600 cursor-not-allowed'
                : 'border-orange-500 bg-orange-500 text-white hover:bg-black hover:text-orange-500'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="h-5 w-5 animate-spin border-3 border-current border-t-transparent rounded-full" />
                Analyzing...
              </div>
            ) : (
              'Analyze Data'
            )}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm font-bold text-white/70 uppercase tracking-wide border-t-4 border-white pt-8">
          Your data is processed securely and never stored
        </p>
      </div>
    </div>
  )
}
