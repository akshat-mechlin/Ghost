import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { testQueue } from '@/lib/jobs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.organizationId || !session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { testCaseIds } = body

    if (!testCaseIds || !Array.isArray(testCaseIds) || testCaseIds.length === 0) {
      return NextResponse.json(
        { error: 'Test case IDs are required' },
        { status: 400 }
      )
    }

    // Verify all test cases belong to the organization
    const testCases = await prisma.testCase.findMany({
      where: {
        id: { in: testCaseIds },
        organizationId: session.user.organizationId
      }
    })

    if (testCases.length !== testCaseIds.length) {
      return NextResponse.json(
        { error: 'Some test cases not found or unauthorized' },
        { status: 400 }
      )
    }

    // Create test runs
    const testRuns = await Promise.all(
      testCaseIds.map(testCaseId =>
        prisma.testRun.create({
          data: {
            organizationId: session.user.organizationId,
            testCaseId,
            userId: session.user.id,
            status: 'PENDING'
          }
        })
      )
    )

    // Queue test execution jobs
    await Promise.all(
      testRuns.map(testRun =>
        testQueue.add('execute-test', {
          testRunId: testRun.id,
          testCaseId: testRun.testCaseId,
          userId: session.user.id
        })
      )
    )

    return NextResponse.json({
      success: true,
      testRuns: testRuns.map(run => run.id)
    })
  } catch (error) {
    console.error('Test execution error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}