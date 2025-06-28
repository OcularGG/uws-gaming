import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ message: 'If an account exists, a reset email has been sent' })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpires = new Date(Date.now() + 3600000) // 1 hour

    // Save reset token to user (temporarily using in-memory store)
    // TODO: Update when Prisma schema is regenerated
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: {
    //     passwordResetToken: resetToken,
    //     passwordResetExpires: resetExpires,
    //   }
    // })

    // For now, store in a temporary solution (in production, use Redis or database)
    // This is a temporary workaround until the schema is updated
    const globalAny = global as any
    globalAny.passwordResetTokens = globalAny.passwordResetTokens || new Map()
    globalAny.passwordResetTokens.set(resetToken, {
      userId: user.id,
      expires: resetExpires,
    })

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Email template
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⚓ KrakenGaming ⚓</h1>
          <p style="color: #e2e8f0; margin: 10px 0 0 0;">Naval Command Password Reset</p>
        </div>

        <div style="padding: 30px; background: #f8fafc; border: 3px solid #1e293b;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">Reset Your Password</h2>

          <p style="color: #475569; margin-bottom: 20px;">
            You requested a password reset for your KrakenGaming account. Click the button below to set a new password:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #d97706; color: #1e293b; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Reset Password 🔑
            </a>
          </div>

          <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
            If you didn't request this reset, please ignore this email. This link will expire in 1 hour.
          </p>

          <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <span style="word-break: break-all; color: #3b82f6;">${resetUrl}</span>
          </p>
        </div>

        <div style="background: #1e293b; padding: 20px; text-align: center;">
          <p style="color: #94a3b8; margin: 0; font-size: 14px;">
            Fair winds and following seas,<br>
            The KrakenGaming Admiralty
          </p>
        </div>
      </div>
    `

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@krakengaming.org',
      to: email,
      subject: '🔑 KrakenGaming Password Reset',
      html: emailHtml,
    })

    return NextResponse.json({ message: 'If an account exists, a reset email has been sent' })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
