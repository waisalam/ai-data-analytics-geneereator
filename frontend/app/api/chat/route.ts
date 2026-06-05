import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import OpenAI from 'openai'

const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!
})

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
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email! }
  })
  if (!dbUser) return NextResponse.json({ message: 'User not found' }, { status: 404 })

  const { question, analysisId } = await request.json()

  if (!question || !analysisId) {
    return NextResponse.json({ message: 'question and analysisId are required' }, { status: 400 })
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
  const chartSummary = charts.map((c: any, i: number) => {
    const topPoints = (c.x as any[]).slice(0, 10).map((x: any, j: number) =>
      `  ${x}: ${c.y[j]}`
    ).join('\n')
    return `Chart ${i + 1}: "${c.title}" (${c.type})\nTop data points:\n${topPoints}\nInsight: ${c.explanation}`
  }).join('\n\n')

  // your original prompt — unchanged
  const prompt = `You are a data analyst assistant. The user uploaded a CSV file called "${analysis.fileName}".

Here is the analyzed chart data:
${chartSummary}

${historyText ? `Previous conversation:\n${historyText}\n\n` : ''}
User question: ${question}

Answer clearly and concisely. Reference specific numbers from the data when relevant.`

  try {
    const completion = await openrouter.chat.completions.create({
      model: 'nvidia/nemotron-3-ultra-550b-a55b:free',
      messages: [
        {
          role: 'system',
          content: 'You are a data analyst assistant. Be concise and reference specific numbers.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.5,
      stream: false
    })

    let answer = completion.choices[0]?.message?.content?.trim()
      || 'Sorry, I could not generate a response.'
    answer = answer.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
    answer = answer.replace(/^(answer:|response:|assistant:)/i, '').trim()

    // build chart if user asked for one
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

    return NextResponse.json({
      answer,
      chart: chartData
    })

  } catch (err: any) {
    console.error('OpenRouter error:', err)
    return NextResponse.json(
      { message: err?.message || 'AI request failed' },
      { status: 500 }
    )
  }
}