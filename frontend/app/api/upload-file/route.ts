import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .slice(0, 100)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file')

  if (!file || typeof file === 'string') {
    return NextResponse.json({ message: 'No file uploaded' }, { status: 400 })
  }

  const ext = (file as File).name.split('.').pop()?.toLowerCase()
  if (ext !== 'csv') {
    return NextResponse.json({ message: 'Only .csv files are allowed.' }, { status: 400 })
  }

  if ((file as File).size > MAX_FILE_SIZE) {
    return NextResponse.json({ message: 'File too large. Maximum size is 10 MB.' }, { status: 400 })
  }

  const safeFilename = sanitizeFilename((file as File).name)

  const blob = await put(safeFilename, file as File, {
    access: 'public',
    contentType: 'text/csv',
    addRandomSuffix: true,
    storeId: process.env.BLOB_STORE_ID!,
    token: process.env.BLOB_READ_WRITE_TOKEN!
  })

  return NextResponse.json({ url: blob.url, name: safeFilename })
}