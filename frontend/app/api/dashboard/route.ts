import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email! }
  })
  if (!dbUser) return NextResponse.json({ message: 'User not found' }, { status: 404 })

  // total analyses
  const totalAnalyses = await prisma.analysis.count({
    where: { userId: dbUser.id }
  })

  // total charts generated
  const analyses = await prisma.analysis.findMany({
    where: { userId: dbUser.id },
    select: { charts: true, createdAt: true, id: true, fileName: true }
  })
  const totalCharts = analyses.reduce((sum, a) => {
    return sum + (Array.isArray(a.charts) ? a.charts.length : 0)
  }, 0)

  // total questions asked
  const totalChats = await prisma.chat.count({
    where: { analysis: { userId: dbUser.id } }
  })

  // recent 5 analyses
  const recentAnalyses = await prisma.analysis.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, fileName: true, createdAt: true, charts: true }
  })

  // analyses per day for last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toISOString().split('T')[0]
  }).reverse()

  const activityMap: Record<string, number> = {}
  analyses.forEach(a => {
    const day = new Date(a.createdAt).toISOString().split('T')[0]
    activityMap[day] = (activityMap[day] || 0) + 1
  })

  const activityChart = last7Days.map(day => ({
    date: day,
    count: activityMap[day] || 0
  }))

  return NextResponse.json({
    stats: {
      totalAnalyses,
      totalCharts,
      totalChats,
      memberSince: dbUser.createdAt
    },
    recentAnalyses: recentAnalyses.map(a => ({
      id: a.id,
      fileName: a.fileName,
      createdAt: a.createdAt,
      chartCount: Array.isArray(a.charts) ? a.charts.length : 0
    })),
    activityChart
  })
}