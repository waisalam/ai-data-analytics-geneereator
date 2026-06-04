import {put} from '@vercel/blob'
import {NextResponse} from 'next/server'
import { getServerSession } from 'next-auth'
import {authOptions} from '../auth/[...nextauth]/route'

export async function POST(req: Request){
    const session = await getServerSession(authOptions)
    if(!session){
        return NextResponse.json({message: "Unauthorized"}, {status: 401})
    }

    const formData = await req.formData()
    const file = formData.get('file')

    if(!file || typeof file === 'string'){
        return NextResponse.json({message: "No file uploaded"}, {status: 400})
    }

    const blob = await put(file.name, file,{
        access: 'public',
        contentType:'text/csv',
        addRandomSuffix: true,
        storeId: process.env.BLOB_STORE_ID!,
        token: process.env.BLOB_READ_WRITE_TOKEN!
    })

    return NextResponse.json({ url: blob.url, name: file.name })
}