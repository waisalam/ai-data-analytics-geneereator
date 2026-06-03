'use client'
import { Upload } from 'lucide-react'

interface FileUploadProps {
  file: File | null
  loading: boolean
  onFileChangeAction: (file: File | null) => void
  onAnalyzeAction: () => void
}

export function FileUpload({
  file,
  loading,
  onFileChangeAction,
  onAnalyzeAction,
}: FileUploadProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-black px-3 py-3 sm:min-h-screen sm:px-4 sm:py-8">
      <div className="w-full max-w-xl space-y-4 rounded-[1.25rem] border border-white/10 bg-white/5 p-3 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl animate-in fade-in duration-500 sm:max-w-2xl sm:space-y-6 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="space-y-2 border-b border-white/10 pb-3 text-center sm:space-y-3 sm:pb-5">
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-3xl font-black uppercase tracking-[0.16em] text-white sm:text-4xl md:text-5xl lg:text-6xl">
              DATA<br />ANALYSIS
            </h1>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80 sm:text-sm">
              Upload your CSV file to visualize insights
            </p>
          </div>
        </div>

        {/* Upload Area */}
        <div className="space-y-3 sm:space-y-4">
          <label className="group relative block cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => onFileChangeAction(e.target.files?.[0] ?? null)}
              className="hidden"
              disabled={loading}
            />
            <div className="border border-dashed border-white/20 bg-black/60 p-4 text-center transition-all duration-300 hover:border-orange-500/60 hover:bg-black/80 group-hover:border-orange-500 sm:p-5 lg:p-6">
              <div className="space-y-3 sm:space-y-4">
                <Upload className="mx-auto h-8 w-8 text-white transition-colors group-hover:text-orange-500 sm:h-10 sm:w-10" />
                <div className="space-y-2">
                  <p className="text-sm font-black uppercase tracking-[0.22em] text-white sm:text-base">
                    {file ? 'File Selected' : 'Click or Drag File'}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70 sm:text-sm">
                    {file ? file.name : 'CSV Files Only'}
                  </p>
                </div>
              </div>
            </div>
          </label>

          {file && (
            <div className="border border-orange-500/40 bg-orange-500/10 p-2.5 text-left animate-in slide-in-from-bottom duration-300 sm:p-3">
              <p className="font-bold text-white tracking-wide uppercase">{file.name}</p>
            </div>
          )}

          <button
            onClick={onAnalyzeAction}
            disabled={!file || loading}
            className={`w-full rounded-2xl border py-2.5 text-xs font-black uppercase tracking-[0.28em] text-white transition-all duration-300 sm:py-3 sm:text-sm ${
              !file || loading
                ? 'cursor-not-allowed border-white/10 bg-white/5 text-white/40'
                : 'border-orange-500 bg-orange-500 text-black hover:bg-orange-400 hover:text-black'
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
        <p className="border-t border-white/10 pt-3 text-center text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/65 sm:pt-4 sm:text-xs">
          Your data is processed securely and never stored
        </p>
      </div>
    </div>
  )
}
