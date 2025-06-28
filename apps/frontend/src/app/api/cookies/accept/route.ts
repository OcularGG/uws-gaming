import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { accepted, timestamp } = await request.json();

    // Get client IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

    // Get user agent
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Store cookie consent
    await prisma.cookieConsent.create({
      data: {
        ip,
        userAgent,
        accepted,
        timestamp: new Date(timestamp),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing cookie consent:', error);
    return NextResponse.json(
      { error: 'Failed to store cookie consent' },
      { status: 500 }
    );
  }
}
