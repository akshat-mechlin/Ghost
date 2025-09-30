import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.organizationId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const organizationId = session.user.organizationId

    // Get basic stats
    const [websites, testCases, testRuns, bugs] = await Promise.all([
      prisma.website.count({ where: { organizationId } }),
      prisma.testCase.count({ where: { organizationId } }),
      prisma.testRun.count({ where: { organizationId } }),
      prisma.bug.count({ 
        where: { 
          organizationId,
          status: { in: ['OPEN', 'IN_PROGRESS'] }
        } 
      })
    ])

    // Calculate pass rate
    const completedRuns = await prisma.testRun.count({
      where: {
        organizationId,
        status: 'COMPLETED'
      }
    })

    const totalRuns = await prisma.testRun.count({
      where: {
        organizationId,
        status: { in: ['COMPLETED', 'FAILED'] }
      }
    })

    const passRate = totalRuns > 0 ? Math.round((completedRuns / totalRuns) * 100) : 0

    // Get recent test runs
    const recentRuns = await prisma.testRun.findMany({
      where: { organizationId },
      include: {
        testCase: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // Get recent bugs
    const recentBugs = await prisma.bug.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        severity: true,
        status: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      websites,
      testCases,
      testRuns,
      bugs,
      passRate,
      recentRuns: recentRuns.map(run => ({
        id: run.id,
        testCase: run.testCase.name,
        status: run.status,
        duration: run.duration || 0,
        createdAt: run.createdAt
      })),
      recentBugs
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}