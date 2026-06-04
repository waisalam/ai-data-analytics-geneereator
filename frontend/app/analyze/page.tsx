'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileUpload } from '@/components/file-upload'
import {useSession} from "next-auth/react"

export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const session = useSession()

  useEffect(()=>{
    if(session.status !== 'authenticated'){
      router.push('/login')
    }
  },[session.status, router])

  const handleAnalyzeData = async () => {
    if (!file) return alert("Please select a file first")

    const formData = new FormData()
    formData.append("file", file)

    setLoading(true)
    try {
         const response = await fetch('/api/analyze-data', {
      method: 'POST',
      body: formData
    })
      // const response = await fetch('https://waisalam-ai-data-analytics-analyzer.hf.space/analyze', {
      //   method: 'POST',
      //   body: formData
      // })

      const result = await response.json()
      console.log('API result:', result)
      // Store the data and redirect to results
localStorage.setItem('analysisData', JSON.stringify(result))  
      sessionStorage.setItem('analysisData', JSON.stringify(result))
      router.push('/analyze/result')
    } catch (error) {
      console.error('Error analyzing data:', error)
      alert('Error analyzing file. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_18px_60px_-35px_rgba(249,115,22,0.45)]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-orange-400">Results</p>
            <h2 className="mt-1 text-xl font-black uppercase tracking-[0.12em] text-white">See your saved analysis</h2>
          </div>
          <button
            type="button"
            onClick={() => router.push('/analyze/result')}
            className="rounded-2xl border border-orange-500/40 bg-orange-500/10 px-4 py-2 text-sm font-black uppercase tracking-[0.28em] text-orange-200 transition hover:bg-orange-500 hover:text-black"
          >
            View old results
          </button>
        </div>

        <FileUpload
          file={file}
          loading={loading}
          onFileChangeAction={(f) => setFile(f)}
          onAnalyzeAction={handleAnalyzeData}
        />
      </div>
    </div>
  )
}
