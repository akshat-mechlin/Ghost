import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const websites = await prisma.website.findMany({
      include: {
        pages: {
          select: {
            id: true,
            url: true,
            title: true
          }
        },
        _count: {
          select: {
            testCases: true,
            testRuns: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ websites })
  } catch (error) {
    console.error('Websites fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, name, description, crawlDepth, maxPages } = await request.json()

    if (!url || !name) {
      return NextResponse.json({ error: 'URL and name are required' }, { status: 400 })
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // Create demo organization and user if they don't exist
    let organization = await prisma.organization.findFirst({
      where: { subdomain: 'demo' }
    })
    
    if (!organization) {
      organization = await prisma.organization.create({
        data: {
          name: 'Demo Organization',
          subdomain: 'demo'
        }
      })
    }
    
    let user = await prisma.user.findFirst({
      where: { email: 'demo@example.com' }
    })
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'demo@example.com',
          passwordHash: 'demo-password',
          firstName: 'Demo',
          lastName: 'User',
          organizationId: organization.id
        }
      })
    }

    const website = await prisma.website.create({
      data: {
        url,
        name,
        description: description || '',
        crawlDepth: crawlDepth || 3,
        maxPages: maxPages || 50,
        status: 'PENDING',
        organizationId: organization.id,
        userId: user.id
      },
      include: {
        pages: true,
        _count: {
          select: {
            testCases: true,
            testRuns: true
          }
        }
      }
    })

    return NextResponse.json({ website })
  } catch (error) {
    console.error('Website creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}