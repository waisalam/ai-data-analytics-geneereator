import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import nodemailer from "nodemailer"


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

export async function POST(request: Request) {
    try {
        const { email, password, name } = await request.json()

        if (!email || !password || !name) {
            return NextResponse.json(
                { message: "Please provide all required fields" },
                { status: 400 }
            )
        }

        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 400 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        // generate clean 6 digit OTP
        const otp = String(Math.floor(100000 + Math.random() * 900000))

        // try sending email BEFORE saving user
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Your verification code - DataAI",
                html: `
                    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#000;border-radius:12px;border:1px solid #333">
                        <h2 style="color:#f97316;margin:0 0 8px">Hi ${name},</h2>
                        <p style="color:#ccc;margin:0 0 24px">Your DataAI verification code:</p>
                        <div style="background:#111;border:2px solid #f97316;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px">
                            <span style="font-size:48px;font-weight:900;letter-spacing:16px;color:#f97316">${otp}</span>
                        </div>
                        <p style="color:#666;font-size:13px;margin:0">This code expires in 10 minutes. Do not share it.</p>
                    </div>
                `
            })
            console.log('Email sent successfully to:', email)
        } catch (emailError) {
            return NextResponse.json(
                { message: "Failed to send verification email. Please try again." },
                { status: 500 }
            )
        }

        // save user only after email succeeds
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                otp,
                verified: false
            }
        })

        return NextResponse.json(
            { message: "OTP sent to your email" },
            { status: 201 }
        )

    } catch (error) {
        console.error('Signup error:', error)
        return NextResponse.json(
            { message: "Something went wrong. Please try again." },
            { status: 500 }
        )
    }
}