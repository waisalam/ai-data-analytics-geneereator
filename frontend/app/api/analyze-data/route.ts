import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .slice(0, 100)
}



export async function POST(request: Request) {
  try {
    // Rate limit: 5 uploads per IP per 5 minutes
    const ip = getClientIp(request)
    const { allowed } = checkRateLimit(ip, 'analyze', 5, 5 * 60_000)
    if (!allowed) {
      return NextResponse.json({ message: 'Too many requests. Please wait a few minutes.' }, { status: 429 })
    }

    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { _count: { select: { analyses: true } } }
    })
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 })

    if (user.plan === 'free' && user._count.analyses >= 2) {
      return NextResponse.json(
        { message: 'Free tier limit reached. Upgrade to upload more files.' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ message: 'No file provided' }, { status: 400 })

    // Validate: extension must be .csv
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext !== 'csv') {
      return NextResponse.json({ message: 'Only .csv files are allowed.' }, { status: 400 })
    }

    // Validate: max 10 MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: 'File too large. Maximum size is 10 MB.' }, { status: 400 })
    }

    const safeFilename = sanitizeFilename(file.name)

    // 1. upload to blob
    const blob = await put(safeFilename, file, {
      access: 'public',
      contentType: 'text/csv',
      addRandomSuffix: true
    })

    // 2. forward to HuggingFace
    const hfForm = new FormData()
    hfForm.append('file', file)

    const response = await fetch('https://waisalam-ai-data-analytics-analyzer.hf.space/analyze', {
      method: 'POST',
      body: hfForm
    })

    if (!response.ok) {
      console.error('HuggingFace error:', response.status)
      return NextResponse.json({ message: 'Analysis service unavailable. Please try again.' }, { status: 502 })
    }

    const result = await response.json()

    // 3. save to DB
    const analysis = await prisma.analysis.create({
      data: {
        userId: session.user.id,
        fileName: safeFilename,
        fileUrl: blob.url,
        charts: JSON.parse(JSON.stringify(result.charts)),
        datasetSummary: result.dataset_summary ?? null
      }
    })

    return NextResponse.json({
      ...result,
      analysisId: analysis.id,
      fileUrl: blob.url
    })

  } catch (error) {
    console.error('Analyze route error:', error)
    return NextResponse.json({ message: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}


export async function GET(req:Request){
const session = await getServerSession(authOptions)
if(!session){
    return NextResponse.json({message:'invalid user'})
}

        const dbUser = await prisma.user.findUnique({
  where: { email: session.user.email! }
})
if(!dbUser){
    return NextResponse.json({message:'user not available'})
}

const getChart = await prisma.analysis.findMany({
    where: {userId:dbUser.id},
    orderBy: { createdAt: 'desc' }
})
console.log('Fetched charts from DB:', getChart.length)
return NextResponse.json({getChart})

}