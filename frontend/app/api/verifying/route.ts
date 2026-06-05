import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { email, otp } = await req.json()

        if (!email || !otp) {
            return NextResponse.json(
                { message: "Please provide all required fields" },
                { status: 400 }
            )
        }

        const user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 400 }
            )
        }

        if (user.verified) {
            return NextResponse.json(
                { message: "Email already verified. Please login." },
                { status: 400 }
            )
        }

        // trim both sides to avoid whitespace issues
        const storedOtp = user.otp?.trim()
        const enteredOtp = otp.toString().trim()

        console.log('Stored OTP:', storedOtp)
        console.log('Entered OTP:', enteredOtp)

        if (storedOtp !== enteredOtp) {
            return NextResponse.json(
                { message: "Invalid OTP. Please check and try again." },
                { status: 400 }
            )
        }

        await prisma.user.update({
            where: { email },
            data: {
                verified: true,
                otp: null
            }
        })

        return NextResponse.json(
            { message: "Email verified successfully" },
            { status: 200 }
        )

    } catch (error) {
        console.error('Verify error:', error)
        return NextResponse.json(
            { message: "Something went wrong. Please try again." },
            { status: 500 }
        )
    }
}