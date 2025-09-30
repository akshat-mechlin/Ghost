import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const testCases = await prisma.testCase.findMany({
      where: { websiteId: params.id },
      include: {
        page: {
          select: {
            id: true,
            url: true,
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ testCases })
  } catch (error) {
    console.error('Test cases fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
