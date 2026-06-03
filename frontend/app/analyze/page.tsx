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
      const response = await fetch('https://waisalam-ai-data-analytics-analyzer.hf.space/analyze', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      
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
