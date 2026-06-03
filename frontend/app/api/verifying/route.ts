import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";

export async function POST(req: Request){
    const {email, otp} = await req.json()

    if(!email || !otp){
        return NextResponse.json({message: "Please provide all required fields"})
    }
    const user = await prisma.user.findUnique({where: {email}})
    if(!user){
        return NextResponse.json({message: "User not found"})
    }
    if(user.otp !== otp){
        return NextResponse.json({message: "Invalid OTP"})
    }
    await prisma.user.update({
        where: {email},
        data: {verified: true,otp: null}
    
    })

    return NextResponse.json({message: "Email verified successfully"})
}