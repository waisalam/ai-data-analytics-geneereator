'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ChartComponent } from '@/components/chart-component'
import {
    Send, Plus, FileText, BarChart3,
    Loader2, MessageSquare, Upload,
    Home, PanelLeft, X,
} from 'lucide-react'
import { useMobileSidebar } from '@/hooks/use-mobile-sidebar'

interface Message {
    role: 'user' | 'assistant'
    content: string
    chart?: {
        show: boolean
        type: 'bar' | 'line' | 'pie'
        title: string,
         explanation: '',
        x: (string | number)[]
        y: number[]
        x_label: string
        y_label: string
    }
}

interface Analysis {
    id: string
    fileName: string
    createdAt: string
    charts: any[]
}

export default function ChatPage() {
    const router = useRouter()
    const session = useSession()
    const [analyses, setAnalyses] = useState<Analysis[]>([])
    const [activeAnalysis, setActiveAnalysis] = useState<Analysis | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [uploadingFileName, setUploadingFileName] = useState<string | null>(null)
    const [loadingHistory, setLoadingHistory] = useState(true)
    const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
    const [upgradeMessage, setUpgradeMessage] = useState('')
    const [uploadError, setUploadError] = useState<string | null>(null)
    const bottomRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { sidebarOpen, openSidebar, closeSidebar, closeSidebarOnMobile } = useMobileSidebar()

    useEffect(() => {
        if (session.status !== 'authenticated') router.push('/login')
    }, [session.status, router])

    useEffect(() => {
        if (session.status === 'authenticated') fetchAnalyses()
    }, [session.status])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const fetchAnalyses = async () => {
        setLoadingHistory(true)
        try {
            const res = await fetch('/api/analyses')
            const data = await res.json()
            setAnalyses(data.analyses || [])
        } finally {
            setLoadingHistory(false)
        }
    }

    const loadAnalysis = async (analysis: Analysis) => {
        setActiveAnalysis(analysis)
        setMessages([])

        const res = await fetch(`/api/analyses/${analysis.id}/chats`)
        const data = await res.json()

        const history: Message[] = []
        data.chats?.forEach((chat: any) => {
            history.push({ role: 'user', content: chat.question })
            history.push({
                role: 'assistant',
                content: chat.answer,
                chart: chat.chartData ? JSON.parse(chat.chartData) : undefined
            })
        })

        if (history.length === 0) {
            history.push({
                role: 'assistant',
                content: `I've loaded **${analysis.fileName}**. Ask me anything about your data — trends, comparisons, anomalies, or specific numbers.`,
            })
        }

        setMessages(history)
        closeSidebarOnMobile()
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || uploading) return

        setUploading(true)
        setUploadingFileName(file.name)
        setActiveAnalysis(null)
        setMessages([])
        setUploadError(null)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const res = await fetch('/api/analyze-data', {
                method: 'POST',
                body: formData,
            })

            const data = await res.json()

            if (res.status === 403) {
                setUpgradeMessage(
                    data.message ||
                    'You have reached the free-tier limit. Upgrade to Pro for unlimited uploads and chats.'
                )
                setUpgradeDialogOpen(true)
                return
            }

            if (!res.ok) {
                setUploadError(data.message || 'Upload failed. Please try again.')
                return
            }

            await fetchAnalyses()

            if (data.analysisId) {
                const newAnalysis: Analysis = {
                    id: data.analysisId,
                    fileName: file.name,
                    createdAt: new Date().toISOString(),
                    charts: data.charts,
                }
                await loadAnalysis(newAnalysis)
            }
        } catch {
            setUploadError('Upload failed. Please check your connection and try again.')
        } finally {
            setUploading(false)
            setUploadingFileName(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleSend = async () => {
        if (!input.trim() || !activeAnalysis || loading) return

        const userMessage = input.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setLoading(true)

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    analysisId: activeAnalysis.id,
                    question: userMessage
                })
            })

            if (res.status === 403) {
                const data = await res.json()
                setUpgradeMessage(data.message || 'Free tier limit reached. Upgrade to continue chatting.')
                setUpgradeDialogOpen(true)
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.message || 'Free tier limit reached. Upgrade to continue chatting.'
                }])
                return
            }

            const data = await res.json()

            if (!res.ok) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.message || 'Something went wrong. Please try again.'
                }])
                return
            }

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.answer || 'Sorry, I could not generate a response.',
                chart: data.chart
            }])
        } catch {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Something went wrong. Please try again.'
            }])
        } finally {
            setLoading(false)
        }
    }

    const handleUpgradeClick = () => {
        const userId = (session.data?.user as any)?.id
        if (!userId) {
            router.push('/login')
            return
        }
        router.push(`/payment?userId=${userId}`)
    }

    return (
        <>
            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            <div className="flex h-[100dvh] overflow-hidden bg-black text-white">

                {/* Mobile backdrop */}
                {sidebarOpen && (
                    <button
                        type="button"
                        aria-label="Close sidebar"
                        className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
                        onClick={closeSidebar}
                    />
                )}

                {/* ── SIDEBAR ─────────────────────────────── */}
                <aside className={`fixed inset-y-0 left-0 z-50 flex w-[min(100vw,18rem)] flex-col border-r border-white/10 bg-black transition-transform duration-300 ease-out lg:static lg:z-auto lg:w-72 lg:shrink-0 lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                    <div className="flex items-start justify-between border-b border-white/10 p-4">
                        <div>
                            <Link href="/" className="font-black text-lg tracking-tight text-orange-500 uppercase">
                                DataAI
                            </Link>
                            <p className="mt-1 text-xs font-bold tracking-widest text-white/40 uppercase">
                                Chat with your data
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={closeSidebar}
                            className="border border-white/10 p-2 text-white/70 transition hover:border-orange-500/50 hover:text-orange-400 lg:hidden"
                            aria-label="Close menu"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="p-3">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="flex w-full items-center gap-2 bg-orange-500 px-4 py-3 text-xs font-black tracking-widest text-black uppercase transition hover:bg-orange-400 disabled:opacity-60"
                        >
                            {uploading ? (
                                <><Loader2 className="h-4 w-4 animate-spin" />Please wait…</>
                            ) : (
                                <><Plus className="h-4 w-4" />New Analysis</>
                            )}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </div>

                    <div className="scrollbar-hide flex-1 space-y-1 overflow-y-auto p-2">
                        {uploading && (
                            <div className="border border-orange-500/50 border-l-4 border-l-orange-500 bg-orange-500/10 p-4">
                                <div className="flex items-start gap-3">
                                    <Loader2 className="h-5 w-5 shrink-0 animate-spin text-orange-500" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-black tracking-widest text-orange-400 uppercase">Uploading file</p>
                                        <p className="mt-1 truncate text-xs font-bold text-white">{uploadingFileName}</p>
                                        <p className="mt-2 text-[11px] leading-relaxed text-white/50">Please wait while we analyze your CSV…</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {loadingHistory ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                            </div>
                        ) : analyses.length === 0 ? (
                            <div className="text-center py-8 space-y-2">
                                <Upload className="h-8 w-8 text-white/20 mx-auto" />
                                <p className="text-xs text-white/30">No analyses yet</p>
                                <p className="text-xs text-white/20">Upload a CSV to start</p>
                            </div>
                        ) : (
                            analyses.map((analysis) => (
                                <button
                                    key={analysis.id}
                                    type="button"
                                    disabled={uploading}
                                    onClick={() => void loadAnalysis(analysis)}
                                    className={`group w-full border px-3 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
                                        activeAnalysis?.id === analysis.id
                                            ? 'border-orange-500/50 border-l-4 border-l-orange-500 bg-orange-500/10'
                                            : 'border-transparent border-l-4 border-l-transparent hover:border-white/10 hover:bg-white/5'
                                    }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <FileText className={`h-4 w-4 mt-0.5 shrink-0 ${
                                            activeAnalysis?.id === analysis.id ? 'text-orange-400' : 'text-white/40'
                                        }`} />
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-white truncate">{analysis.fileName}</p>
                                            <p className="text-xs text-white/30 mt-0.5">
                                                {new Date(analysis.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    {activeAnalysis && (
                        <div className="p-3 border-t border-white/10">
                            <button
                                onClick={() => { closeSidebarOnMobile(); router.push('/analyze/result') }}
                                className="flex w-full items-center gap-2 border border-white/20 px-4 py-2.5 text-xs font-bold tracking-widest text-white/60 uppercase transition hover:border-orange-500/50 hover:bg-white/5 hover:text-white"
                            >
                                <BarChart3 className="h-4 w-4" />
                                View Full Charts
                            </button>
                        </div>
                    )}
                </aside>

                {/* ── MAIN CHAT AREA ──────────────────────── */}
                <div className="flex min-w-0 flex-1 flex-col">

                    {/* header */}
                    <div className="flex shrink-0 items-center gap-2 border-b border-white/10 bg-white/[0.02] px-3 py-3 sm:gap-3 sm:px-6 sm:py-4">
                        <button
                            type="button"
                            onClick={openSidebar}
                            className="shrink-0 border border-white/10 bg-white/5 p-2 text-white transition hover:border-orange-500/50 hover:text-orange-400 lg:hidden"
                        >
                            <PanelLeft className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/')}
                            className="shrink-0 border border-white/10 bg-white/5 p-2 text-white/80 transition hover:border-orange-500/50 hover:text-orange-400"
                        >
                            <Home className="h-4 w-4" />
                        </button>
                        <div className="min-w-0 flex-1">
                            {uploading ? (
                                <>
                                    <p className="text-[10px] font-black tracking-widest text-orange-500 uppercase sm:text-xs">Uploading</p>
                                    <h2 className="truncate text-sm font-black text-white sm:text-base">{uploadingFileName}</h2>
                                </>
                            ) : activeAnalysis ? (
                                <>
                                    <p className="text-[10px] font-black tracking-widest text-orange-500 uppercase sm:text-xs">Active file</p>
                                    <h2 className="truncate text-sm font-black text-white sm:text-base">{activeAnalysis.fileName}</h2>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-sm font-black text-white/50 uppercase sm:text-base">No file selected</h2>
                                    <p className="text-[10px] text-white/30 sm:text-xs">Tap menu to pick an analysis</p>
                                </>
                            )}
                        </div>
                        {activeAnalysis && !uploading && (
                            <button
                                type="button"
                                onClick={() => router.push('/analyze/result')}
                                className="shrink-0 border border-orange-500/50 bg-orange-500/10 px-2 py-2 text-[10px] font-black tracking-wider text-orange-400 uppercase transition hover:bg-orange-500 hover:text-black sm:px-3 sm:text-xs"
                            >
                                <BarChart3 className="h-4 w-4 sm:hidden" />
                                <span className="hidden sm:inline">Charts</span>
                            </button>
                        )}
                    </div>

                    {/* messages area */}
                    <div className="scrollbar-hide flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6">
                        {uploading ? (
                            <div className="landing-grid-pattern flex h-full min-h-[280px] flex-col items-center justify-center space-y-5 px-4 text-center">
                                <div className="flex h-20 w-20 items-center justify-center border border-orange-500/40 bg-orange-500/10">
                                    <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
                                </div>
                                <div className="max-w-sm space-y-2">
                                    <h3 className="text-xl font-black tracking-wide text-white uppercase">Uploading file, please wait</h3>
                                    <p className="truncate text-sm font-bold text-orange-400">{uploadingFileName}</p>
                                    <p className="text-sm leading-relaxed text-gray-400">
                                        We are cleaning your data, generating charts, and preparing your analysis.
                                    </p>
                                </div>
                                <div className="flex gap-1 items-center">
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-orange-500" style={{ animationDelay: '0ms' }} />
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-orange-500" style={{ animationDelay: '150ms' }} />
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-orange-500" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        ) : !activeAnalysis ? (
                            <div className="landing-grid-pattern flex h-full flex-col items-center justify-center space-y-4 px-4 text-center">
                                <div className="flex h-16 w-16 items-center justify-center border border-orange-500/40 bg-orange-500/10">
                                    <MessageSquare className="h-8 w-8 text-orange-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black tracking-wide text-white uppercase">Start a conversation</h3>
                                    <p className="mt-2 max-w-sm text-sm text-gray-400">
                                        Upload a CSV file or select a past analysis to start asking questions
                                    </p>
                                </div>
                                {uploadError && (
                                    <div className="flex w-full max-w-sm items-start gap-3 border border-red-500/40 bg-red-500/10 px-4 py-3 text-left">
                                        <span className="mt-0.5 shrink-0 text-red-400">✕</span>
                                        <p className="text-sm font-bold text-red-400">{uploadError}</p>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="flex items-center gap-2 bg-orange-500 px-6 py-3 text-sm font-black tracking-widest text-black uppercase transition hover:bg-orange-400 disabled:opacity-60"
                                >
                                    <Plus className="h-4 w-4" />
                                    Upload CSV
                                </button>
                                <button
                                    type="button"
                                    onClick={openSidebar}
                                    className="text-xs font-bold tracking-widest text-white/50 uppercase underline-offset-4 hover:text-orange-400 hover:underline lg:hidden"
                                >
                                    Or open history
                                </button>
                            </div>
                        ) : (
                            // ── MESSAGES ──────────────────────────────
                            <div className="space-y-6">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.role === 'assistant' && (
                                            <div className="w-8 h-8 bg-orange-500 flex items-center justify-center shrink-0 mt-1">
                                                <span className="text-black font-black text-xs">AI</span>
                                            </div>
                                        )}

                                        <div className={`max-w-[92%] flex flex-col gap-3 sm:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                            <div
                                                className={`px-3 py-3 sm:px-4 ${
                                                    msg.role === 'user'
                                                        ? 'border border-orange-600 bg-orange-500 font-bold text-black'
                                                        : 'border border-white/10 bg-white/5 text-white'
                                                }`}
                                            >
                                                <div className="prose prose-invert prose-sm max-w-none text-sm leading-relaxed">
                                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                </div>
                                            </div>

                                            {msg.chart?.show && (
                                                <div className="w-full border border-orange-500/30 bg-black p-4">
                                                    <p className="mb-3 text-xs font-black tracking-widest text-orange-400 uppercase">
                                                        {msg.chart.title}
                                                    </p>
                                                    <ChartComponent
                                                    
                                                        type={msg.chart.type}
                                                        data={msg.chart}
                                                        height={200}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {msg.role === 'user' && (
                                            <div className="w-8 h-8 bg-white/10 flex items-center justify-center shrink-0 mt-1">
                                                <span className="text-white font-black text-xs">U</span>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* typing indicator */}
                                {loading && (
                                    <div className="flex gap-3 justify-start">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-orange-500">
                                            <span className="text-xs font-black text-black">AI</span>
                                        </div>
                                        <div className="border border-white/10 bg-white/5 px-4 py-3">
                                            <div className="flex gap-1 items-center h-5">
                                                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={bottomRef} />
                            </div>
                        )}
                    </div>

                    {/* input bar */}
                    <div className="shrink-0 border-t border-white/10 bg-black px-3 py-3 sm:px-6 sm:py-4">
                        <div className="flex items-end gap-3">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="shrink-0 border border-white/10 p-3 text-white/40 transition hover:border-orange-500/50 hover:text-orange-500 disabled:opacity-40"
                                title="Upload new CSV"
                            >
                                {uploading
                                    ? <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                                    : <Plus className="h-5 w-5" />
                                }
                            </button>
                            <div className="relative flex-1">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault()
                                            handleSend()
                                        }
                                    }}
                                    placeholder={
                                        uploading ? 'Uploading file, please wait…'
                                        : activeAnalysis ? 'Ask anything about your data...'
                                        : 'Upload a CSV file to start...'
                                    }
                                    disabled={!activeAnalysis || loading || uploading}
                                    rows={1}
                                    className="w-full resize-none border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-orange-500 disabled:opacity-40"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleSend}
                                disabled={!input.trim() || !activeAnalysis || loading || uploading}
                                className="shrink-0 bg-orange-500 p-3 text-black transition hover:bg-orange-400 disabled:opacity-40"
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="text-xs text-white/20 mt-2 text-center">
                            Press Enter to send · Shift+Enter for new line
                        </p>
                    </div>

                    {/* upgrade dialog */}
                    {upgradeDialogOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                            <div className="w-full max-w-md border border-orange-500/40 bg-black p-6 shadow-[0_0_60px_-8px_rgba(249,115,22,0.35)]">
                                <p className="text-xs font-black tracking-[0.3em] text-orange-500 uppercase">Free tier limit reached</p>
                                <h3 className="mt-3 text-2xl font-black tracking-tight text-white uppercase">Upgrade to Pro</h3>
                                <p className="mt-3 text-sm text-gray-400">
                                    {upgradeMessage || 'You have reached your free-tier limit. Upgrade to Pro for unlimited uploads and chats for just $10/month.'}
                                </p>
                                <div className="mt-4 border border-orange-500/30 bg-orange-500/10 p-4 text-sm text-white/90">
                                    <div className="flex items-center justify-between">
                                        <span className="font-black tracking-widest text-orange-400 uppercase">Pro</span>
                                        <span className="text-2xl font-black text-white">$10</span>
                                    </div>
                                    <p className="mt-2 text-gray-400">Unlimited uploads, unlimited chat messages, and priority analysis access.</p>
                                </div>
                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={handleUpgradeClick}
                                        className="flex-1 bg-orange-500 px-4 py-3 text-sm font-black tracking-widest text-black uppercase transition hover:bg-orange-400"
                                    >
                                        Upgrade to Pro
                                    </button>
                                    <button
                                        onClick={() => setUpgradeDialogOpen(false)}
                                        className="border border-white/20 px-4 py-3 text-sm font-bold text-white/80 uppercase transition hover:border-white/40 hover:bg-white/5"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}