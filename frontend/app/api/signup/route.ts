import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";
import bcrypt from "bcryptjs"


export async function POST(request: Request){
    const {email, password, name} = await request.json()

    if(!email || !password || !name){
        return NextResponse.json({message: "Please provide all required fields"})
    }

    const hashedPassword = await bcrypt.hash(password , 10)

    const user = await prisma.user.create({
        data:{
            email,
            password: hashedPassword,
            name
        }
    })

    return NextResponse.json({message: "User created successfully", user, status: 201})


}