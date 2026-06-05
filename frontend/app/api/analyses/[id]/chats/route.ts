import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params  // ← await params
  console.log('Fetching chats for analysisId:', id)

  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email! }
  })
  if (!dbUser) return NextResponse.json({ message: 'User not found' }, { status: 404 })

  const analysis = await prisma.analysis.findFirst({
    where: { id, userId: dbUser.id }  // ← use destructured id
  })
  if (!analysis) return NextResponse.json({ message: 'Analysis not found' }, { status: 404 })

  const chats = await prisma.chat.findMany({
    where: { analysisId: id },  // ← use destructured id
    orderBy: { createdAt: 'asc' }
  })
console.log('Chats found:', chats.length, chats.map(c => c.analysisId))
  return NextResponse.json({ chats })
}