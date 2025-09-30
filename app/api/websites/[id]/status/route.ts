import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const website = await prisma.website.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        status: true,
        lastCrawled: true,
        pages: {
          select: {
            id: true,
            url: true,
            title: true
          }
        }
      }
    })

    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: website.id,
      status: website.status,
      lastCrawled: website.lastCrawled,
      pagesFound: website.pages.length
    })
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
