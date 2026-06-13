import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

// Groq — OpenAI-compatible, fastest inference
const groq = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY ?? 'missing'
})

// OpenRouter — final fallback, key already in env
const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!
})

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

async function callAI(messages: ChatMessage[]): Promise<string> {
  // 1 — Groq: llama-3.3-70b-versatile (primary, fast, free tier)
  if (process.env.GROQ_API_KEY) {
    try {
      const res = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 500,
        temperature: 0.5
      })
      console.log('[AI] answered by groq/llama-3.3-70b-versatile')
      return res.choices[0]?.message?.content?.trim() ?? ''
    } catch (err) {
      console.warn('[AI] groq/llama-3.3-70b-versatile failed:', (err as Error).message)
    }

    // 2 — Groq: openai/gpt-oss-120b (fallback, ~500 tok/s)
    try {
      const res = await groq.chat.completions.create({
        model: 'openai/gpt-oss-120b',
        messages,
        max_tokens: 500,
        temperature: 0.5
      })
      console.log('[AI] answered by groq/openai/gpt-oss-120b')
      return res.choices[0]?.message?.content?.trim() ?? ''
    } catch (err) {
      console.warn('[AI] groq/openai/gpt-oss-120b failed:', (err as Error).message)
    }
  }

  // 3 — OpenRouter: llama-4-scout:free (final fallback)
  const res = await openrouter.chat.completions.create({
    model: 'meta-llama/llama-4-scout:free',
    messages,
    max_tokens: 500,
    temperature: 0.5
  })
  console.log('[AI] answered by openrouter/llama-4-scout:free')
  return res.choices[0]?.message?.content?.trim() ?? ''
}

// detect if user wants a chart
function wantsChart(question: string): boolean {
  const chartKeywords = [
    'show', 'chart', 'graph', 'plot', 'visualize',
    'bar', 'line', 'pie', 'diagram', 'display', 'draw'
  ]
  const lower = question.toLowerCase()
  return chartKeywords.some(word => lower.includes(word))
}

// build chart from existing analysis data based on question
function buildChartFromAnalysis(question: string, charts: any[]) {
  if (!charts.length) return null

  const lower = question.toLowerCase()

  // find most relevant chart based on keywords in question
  let matchedChart = charts.find((c: any) => {
    const title = c.title?.toLowerCase() || ''
    const words = lower.split(' ')
    return words.some(word => word.length > 3 && title.includes(word))
  })

  // fallback to first chart if no match
  if (!matchedChart) matchedChart = charts[0]
  if (!matchedChart) return null

  // detect chart type from question
  let type = matchedChart.type || 'bar'
  if (lower.includes('line') || lower.includes('trend') || lower.includes('over time')) type = 'line'
  if (lower.includes('pie') || lower.includes('proportion') || lower.includes('percentage')) type = 'pie'
  if (lower.includes('bar') || lower.includes('compare') || lower.includes('comparison')) type = 'bar'

  return {
    show: true,
    type,
    title: matchedChart.title,
    x: matchedChart.x?.slice(0, 10) || [],
    y: matchedChart.y?.slice(0, 10) || [],
    x_label: matchedChart.x_label || '',
    y_label: matchedChart.y_label || ''
  }
}

export async function POST(request: Request) {
  // Rate limit: 20 chat requests per IP per minute
  const ip = getClientIp(request)
  const { allowed } = checkRateLimit(ip, 'chat', 20, 60_000)
  if (!allowed) {
    return NextResponse.json({ message: 'Too many requests. Please wait a minute.' }, { status: 429 })
  }

  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email! }
  })
  if (!dbUser) return NextResponse.json({ message: 'User not found' }, { status: 404 })

  const body = await request.json()
  const { question, analysisId } = body

  if (!analysisId) {
    return NextResponse.json({ message: 'analysisId is required' }, { status: 400 })
  }
  if (!question || typeof question !== 'string' || !question.trim()) {
    return NextResponse.json({ message: 'question must be a non-empty string' }, { status: 400 })
  }
  if (question.length > 2000) {
    return NextResponse.json({ message: 'question must be 2000 characters or fewer' }, { status: 400 })
  }

  const analysis = await prisma.analysis.findFirst({
    where: { id: analysisId, userId: dbUser.id }
  })
  if (!analysis) return NextResponse.json({ message: 'Analysis not found' }, { status: 404 })

  if (dbUser.plan === 'free') {
    const chatCount = await prisma.chat.count({ where: { analysisId } })
    if (chatCount >= 10) {
      return NextResponse.json(
        { message: 'Free tier limit reached. Upgrade to continue chatting.' },
        { status: 403 }
      )
    }
  }

  const recentChats = await prisma.chat.findMany({
    where: { analysisId },
    orderBy: { createdAt: 'desc' },
    take: 10
  })
  const chatHistory = recentChats.reverse()

  const historyText = chatHistory.map(c =>
    `User: ${c.question}\nAssistant: ${c.answer}`
  ).join('\n\n')

  const charts = (analysis.charts as any[]) ?? []
  const datasetSummary = (analysis as any).datasetSummary ?? ''

  // Chart list with just titles and insights — no raw row slicing
  const chartList = charts.map((c: any, i: number) =>
    `Chart ${i + 1}: "${c.title}" (${c.type}) — ${c.explanation ?? ''}`
  ).join('\n')

  const prompt = `You are a data analyst assistant. The user uploaded a CSV file called "${analysis.fileName}".

${datasetSummary ? `FULL DATASET STATISTICS (computed from every row):\n${datasetSummary}\n\n` : ''}Available charts:
${chartList}

${historyText ? `Previous conversation:\n${historyText}\n\n` : ''}User question: ${question}

Answer clearly and concisely. Reference specific numbers from the data when relevant.`

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: 'You are a data analyst assistant. Be concise and reference specific numbers.'
    },
    { role: 'user', content: prompt }
  ]

  try {
    let answer = await callAI(messages)
    if (!answer) answer = 'Sorry, I could not generate a response.'
    answer = answer.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
    answer = answer.replace(/^(answer:|response:|assistant:)/i, '').trim()

    const chartData = wantsChart(question)
      ? buildChartFromAnalysis(question, charts)
      : null

    await prisma.chat.create({
      data: {
        analysisId,
        question,
        answer,
        chartData: chartData ? JSON.stringify(chartData) : null
      }
    })

    return NextResponse.json({ answer, chart: chartData })

  } catch (err: any) {
    console.error('[AI] all models failed:', err)
    return NextResponse.json(
      { message: 'AI request failed. Please try again.' },
      { status: 500 }
    )
  }
}