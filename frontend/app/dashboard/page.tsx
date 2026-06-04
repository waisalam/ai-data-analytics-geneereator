'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

type HistoryItem = {
  id: string
  fileName: string
  chartCount: number
  createdAt: string
  rows?: number
  columns?: number
}

type MessageItem = {
  id: string
  role: 'assistant' | 'user'
  text: string
  time: string
}

const fallbackHistory: HistoryItem[] = [
  { id: 'a1', fileName: 'applerevenue.csv', chartCount: 3, createdAt: '2026-06-04T10:30:00Z', rows: 120, columns: 6 },
  { id: 'a2', fileName: 'sales_mix.csv', chartCount: 2, createdAt: '2026-06-03T16:05:00Z', rows: 84, columns: 5 },
  { id: 'a3', fileName: 'regional_report.csv', chartCount: 4, createdAt: '2026-06-02T09:15:00Z', rows: 210, columns: 8 },
]

const fallbackMessages: Record<string, MessageItem[]> = {
  a1: [
    { id: 'm1', role: 'assistant', text: 'I reviewed the revenue file and found a strong growth trend in Q4.', time: '10:32 AM' },
    { id: 'm2', role: 'user', text: 'Show me the top drivers for this dataset.', time: '10:35 AM' },
  ],
  a2: [
    { id: 'm3', role: 'assistant', text: 'This mix file suggests a strong upsell pattern in the premium segment.', time: '4:10 PM' },
  ],
  a3: [
    { id: 'm4', role: 'assistant', text: 'Regional report loaded. I can summarize performance by territory.', time: '9:20 AM' },
  ],
}

export default function DashboardPage() {
  const router = useRouter()
  const session = useSession()

  const [history, setHistory] = useState<HistoryItem[]>(fallbackHistory)
  const [activeAnalysis, setActiveAnalysis] = useState<HistoryItem>(fallbackHistory[0])
  const [messages, setMessages] = useState<MessageItem[]>(fallbackMessages.a1)
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session.status !== 'authenticated') {
      router.push('/login')
    }
  }, [session.status, router])

  useEffect(() => {
    if (session.status !== 'authenticated') return

    const loadHistory = async () => {
      try {
        const res = await fetch('/api/analyses')
        if (!res.ok) throw new Error('Failed to load history')
        const data = await res.json()
        const items = Array.isArray(data?.analyses) ? data.analyses : Array.isArray(data) ? data : fallbackHistory

        if (items.length > 0) {
          setHistory(items)
          setActiveAnalysis(items[0])
          setMessages(fallbackMessages[items[0].id] || [])
        }
      } catch (error) {
        console.error(error)
      }
    }

    loadHistory()
  }, [session.status])

  const groupedHistory = useMemo(() => {
    const groups: Record<string, HistoryItem[]> = { Today: [], Yesterday: [], Earlier: [] }

    history.forEach((item) => {
      const createdAt = new Date(item.createdAt)
      const today = new Date()
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      if (createdAt.toDateString() === today.toDateString()) groups.Today.push(item)
      else if (createdAt.toDateString() === yesterday.toDateString()) groups.Yesterday.push(item)
      else groups.Earlier.push(item)
    })

    return groups
  }, [history])

  const handleSelectAnalysis = (item: HistoryItem) => {
    setActiveAnalysis(item)
    setMessages(fallbackMessages[item.id] || [])
  }

  const handleSend = async () => {
    const text = question.trim()
    if (!text || !activeAnalysis?.id) return

    const userMessage: MessageItem = { id: `${Date.now()}-user`, role: 'user', text, time: 'Just now' }
    setMessages((prev) => [...prev, userMessage])
    setQuestion('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text, analysisId: activeAnalysis.id }),
      })

      const data = await res.json()
      const reply = data?.reply || data?.message || 'No response returned from the assistant.'

      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-assistant`, role: 'assistant', text: reply, time: 'Just now' },
      ])
    } catch (error) {
      console.error(error)
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-assistant`, role: 'assistant', text: 'Unable to reach the chat route right now.', time: 'Just now' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <style jsx>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #0a0a0a; }
        button, input, textarea { font: inherit; }
        .chip { border: 1px solid rgba(249,115,22,0.35); background: rgba(249,115,22,0.12); color: #fdba74; }
        .history-card:hover { background: rgba(255,255,255,0.06); }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
        <aside style={{ width: '20%', minWidth: 280, background: '#111111', borderRight: '1px solid rgba(255,255,255,0.12)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 18, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              type="button"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: '2px solid #f97316', background: '#f97316', color: '#000', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.28em', padding: '12px 14px', cursor: 'pointer' }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> New analysis
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 0' }}>
            {(['Today', 'Yesterday', 'Earlier'] as const).map((label) => (
              <div key={label} style={{ marginBottom: 16 }}>
                <p style={{ margin: '0 0 8px 4px', textTransform: 'uppercase', letterSpacing: '0.25em', fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{label}</p>
                {groupedHistory[label].length === 0 ? (
                  <p style={{ margin: '0 0 8px 6px', fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>No analyses yet.</p>
                ) : (
                  groupedHistory[label].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectAnalysis(item)}
                      className="history-card"
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        border: item.id === activeAnalysis.id ? '2px solid #fff' : '1px solid rgba(255,255,255,0.08)',
                        background: item.id === activeAnalysis.id ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                        borderRadius: 18,
                        padding: 12,
                        marginBottom: 10,
                        color: '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                        <strong style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.18em' }}>{item.fileName}</strong>
                        <span style={{ fontSize: 11, color: '#fdba74', textTransform: 'uppercase', letterSpacing: '0.18em' }}>{item.chartCount} charts</span>
                      </div>
                      <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </button>
                  ))
                )}
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 999, background: 'linear-gradient(135deg, #f97316, #fb923c)', display: 'grid', placeItems: 'center', color: '#000', fontWeight: 900, textTransform: 'uppercase' }}>
              {String(session.data?.user?.name || session.data?.user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#fff' }}>{session.data?.user?.name || 'User'}</p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.data?.user?.email || 'Signed in'}</p>
            </div>
          </div>
        </aside>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0b0b0b' }}>
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.10)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: '#111111' }}>
            <button type="button" onClick={() => router.back()} style={{ border: '1px solid rgba(255,255,255,0.14)', background: '#171717', color: '#fff', padding: '8px 12px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.18em', cursor: 'pointer', fontSize: 11 }}>← Back</button>
            <button type="button" onClick={() => router.push('/')} style={{ border: '1px solid rgba(249,115,22,0.35)', background: 'rgba(249,115,22,0.12)', color: '#fff', padding: '8px 12px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.18em', cursor: 'pointer', fontSize: 11 }}>Home</button>
          </div>

          <header style={{ borderBottom: '1px solid rgba(255,255,255,0.10)', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, background: 'linear-gradient(180deg, #141414, #0b0b0b)' }}>
            <div>
              <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.35em', fontSize: 11, color: '#f97316' }}>Active analysis</p>
              <h2 style={{ margin: '6px 0 0', textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: 20, fontWeight: 900 }}>{activeAnalysis.fileName}</h2>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <span className="chip" style={{ borderRadius: 999, padding: '8px 10px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.18em' }}>{activeAnalysis.rows || 0} rows</span>
              <span className="chip" style={{ borderRadius: 999, padding: '8px 10px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.18em' }}>{activeAnalysis.columns || 0} columns</span>
              <span className="chip" style={{ borderRadius: 999, padding: '8px 10px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.18em' }}>{activeAnalysis.chartCount} charts</span>
            </div>
          </header>

          <section style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '18px 18px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {msg.role === 'assistant' ? (
                    <div style={{ display: 'flex', gap: 10, maxWidth: '78%' }}>
                      <div style={{ width: 38, height: 38, borderRadius: 999, background: 'linear-gradient(135deg, #f97316, #fb923c)', color: '#000', display: 'grid', placeItems: 'center', fontWeight: 900, textTransform: 'uppercase' }}>AI</div>
                      <div style={{ background: '#171717', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '10px 12px', color: '#fff' }}>
                        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.45 }}>{msg.text}</p>
                        <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.45)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.18em' }}>{msg.time}</p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ maxWidth: '72%', background: '#f97316', color: '#fff', borderRadius: 18, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.45 }}>{msg.text}</p>
                      <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.8)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.18em' }}>{msg.time}</p>
                    </div>
                  )}
                </div>
              ))}
              {loading && <p style={{ color: '#fdba74', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.18em' }}>Thinking…</p>}
            </div>

            <footer style={{ borderTop: '1px solid rgba(255,255,255,0.10)', padding: 14, background: '#121212' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask about the selected analysis..."
                  rows={3}
                  style={{ flex: 1, resize: 'none', border: '1px solid rgba(255,255,255,0.12)', background: '#151515', color: '#fff', padding: '12px 14px', borderRadius: 16, minHeight: 58 }}
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={loading}
                  style={{ border: 'none', background: '#f97316', color: '#000', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.28em', padding: '12px 14px', borderRadius: 16, cursor: 'pointer', minWidth: 110 }}
                >
                  Send
                </button>
              </div>
            </footer>
          </section>
        </main>
      </div>
    </div>
  )
}
