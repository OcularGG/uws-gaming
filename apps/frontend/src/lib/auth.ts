import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        emailOrUsername: { label: "Email or Captain Name", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('🔍 NextAuth authorize called with:', {
          emailOrUsername: credentials?.emailOrUsername,
          hasPassword: !!credentials?.password
        })

        if (!credentials?.emailOrUsername || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }

        try {
          // Try to find user by email first, then by username
          let user = await prisma.user.findUnique({
            where: { email: credentials.emailOrUsername as string },
            select: {
              id: true,
              email: true,
              username: true,
              password: true,
              discordId: true,
              isActive: true,
              isApproved: true,
              canCreatePortBattles: true,
              userRoles: {
                select: {
                  role: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          }) as any

          // If not found by email, try by username
          if (!user) {
            user = await prisma.user.findUnique({
              where: { username: credentials.emailOrUsername as string },
              select: {
                id: true,
                email: true,
                username: true,
                password: true,
                discordId: true,
                isActive: true,
                isApproved: true,
                canCreatePortBattles: true,
                userRoles: {
                  select: {
                    role: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            }) as any
          }

          if (!user || !user.password) {
            console.log('❌ User not found or no password')
            return null
          }

          console.log('👤 Found user:', { id: user.id, email: user.email, username: user.username })

          const isValidPassword = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          if (!isValidPassword) {
            console.log('❌ Invalid password')
            return null
          }

          // Get the primary role (first one, or admin if multiple)
          const primaryRole = user.userRoles.find((ur: any) => ur.role.name === 'admin')?.role.name ||
                             user.userRoles[0]?.role.name || 'user'

          console.log('✅ Authentication successful, role:', primaryRole)

          const authUser = {
            id: user.id,
            email: user.email,
            name: user.username,
            role: primaryRole,
          }

          console.log('🎯 Returning user object:', authUser)
          return authUser
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
  },
})
