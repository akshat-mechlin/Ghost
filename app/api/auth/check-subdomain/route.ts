import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subdomain = searchParams.get('subdomain')

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomain is required' },
        { status: 400 }
      )
    }

    // Check if subdomain is valid format
    if (!/^[a-z0-9-]+$/.test(subdomain)) {
      return NextResponse.json(
        { available: false, error: 'Invalid subdomain format' },
        { status: 400 }
      )
    }

    // Check if subdomain exists
    const existing = await prisma.organization.findUnique({
      where: { subdomain }
    })

    return NextResponse.json({
      available: !existing
    })
  } catch (error) {
    console.error('Subdomain check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}