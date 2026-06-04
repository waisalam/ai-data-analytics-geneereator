import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'


export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const dbUser = await prisma.user.findUnique({
  where: { email: session.user.email! }
})


if (!dbUser) return NextResponse.json({ message: 'User not found' }, { status: 404 })

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) return NextResponse.json({ message: 'No file provided' }, { status: 400 })

    // 1. upload to blob
    const blob = await put(file.name, file, {
      access: 'public',
      contentType: 'text/csv',
      addRandomSuffix: true
    })
    console.log('Blob uploaded:', blob.url)

    // 2. forward to HuggingFace
    const hfForm = new FormData()
    hfForm.append('file', file)

    const response = await fetch('https://waisalam-ai-data-analytics-analyzer.hf.space/analyze', {
      method: 'POST',
      body: hfForm
    })
    console.log('HuggingFace status:', response.status)

    const result = await response.json()
    console.log('HuggingFace result received')
// console.log('Charts type:', typeof result.charts)
// console.log('Charts is array:', Array.isArray(result.charts))
// console.log('Charts length:', result.charts?.length)
    // 3. save to DB
    const analysis = await prisma.analysis.create({
      data: {
        userId: session.user.id,
        fileName: file.name,
        fileUrl: blob.url,
        charts: JSON.parse(JSON.stringify(result.charts))
      }
    })
    console.log('Analysis saved to DB:', analysis.id)

    return NextResponse.json({
      ...result,
      analysisId: analysis.id,
      fileUrl: blob.url
    })

  } catch (error) {
    // this will print the EXACT error in terminal
    console.error('Analyze route error:', error)
    return NextResponse.json({ message: 'Internal server error', error: String(error) }, { status: 500 })
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