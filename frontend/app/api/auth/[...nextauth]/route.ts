import NextAuth, { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials", credentials)
            return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        console.log("User found:", user)
        if (!user) {
            console.log("User not found")
            return null
        }

        const isMatch = await bcrypt.compare(credentials.password, user.password)

        if (!isMatch) {
            console.log("Password does not match")
            return null
        }

        console.log("User authenticated:", user)

        return {
          id: String(user.id),
          name: user.name,
          email: user.email
        }
      }
    })
  ],
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }