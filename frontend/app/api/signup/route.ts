import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";
import bcrypt from "bcryptjs"
import nodemailer from "nodemailer"
import crypto from "crypto"

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})
export async function POST(request: Request){
    const {email, password, name} = await request.json()

    if(!email || !password || !name){
        return NextResponse.json({message: "Please provide all required fields"})
    }
    const existingUser = await prisma.user.findUnique({where: {email}})
    if(existingUser){
        return NextResponse.json({message: "User already exists"})
    }
    const hashedPassword = await bcrypt.hash(password , 10)

   const otp = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify your email",
        html: `
            <h2>Hi ${name},</h2>
            <p>Click the link below to verify your email:</p>
            <h1  style="
                background:#f97316;
                color:white;
                padding:12px 24px;
                text-decoration:none;
                border-radius:6px;
                font-weight:bold;
            ">OTP: ${otp}</h1>
            <p>Link expires in 24 hours.</p>
        `
    }) 

        const user = await prisma.user.create({
        data:{
            email,
            password: hashedPassword,
            name,
            otp: otp,
            verified: false
        }
    })

    return NextResponse.json({message: "OTP sent to your email", user, status: 201})


}