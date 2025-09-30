import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { chromium } from 'playwright'

export async function POST(request: NextRequest) {
  try {
    const { testCaseIds, websiteId } = await request.json()

    if (!testCaseIds || !Array.isArray(testCaseIds)) {
      return NextResponse.json({ error: 'Test case IDs are required' }, { status: 400 })
    }

    // Get test cases from database
    const testCases = await prisma.testCase.findMany({
      where: {
        id: { in: testCaseIds },
        websiteId: websiteId
      },
      include: {
        website: true,
        page: true
      }
    })

    if (testCases.length === 0) {
      return NextResponse.json({ error: 'No test cases found' }, { status: 404 })
    }

    // Execute tests
    const results = await executeTests(testCases)

    return NextResponse.json({ 
      message: 'Tests executed successfully',
      results
    })
  } catch (error) {
    console.error('Test execution error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function executeTests(testCases: any[]) {
  const browser = await chromium.launch({ headless: true })
  const results = []

  for (const testCase of testCases) {
    console.log(`Executing test: ${testCase.name}`)
    
    // Get demo organization and user
    const organization = await prisma.organization.findFirst({
      where: { subdomain: 'demo' }
    })
    
    const user = await prisma.user.findFirst({
      where: { email: 'demo@example.com' }
    })

    if (!organization || !user) {
      throw new Error('Demo organization or user not found')
    }

    const testRun = await prisma.testRun.create({
      data: {
        status: 'RUNNING',
        testCaseId: testCase.id,
        organizationId: organization.id,
        websiteId: testCase.websiteId,
        userId: user.id,
        startedAt: new Date()
      }
    })

    try {
      const result = await executeTestCase(browser, testCase, testRun.id)
      results.push(result)
    } catch (error) {
      console.error(`Test execution failed for ${testCase.name}:`, error)
      
      await prisma.testRun.update({
        where: { id: testRun.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          results: {
            passed: false,
            error: error.message,
            steps: []
          }
        }
      })
    }
  }

  await browser.close()
  return results
}

async function executeTestCase(browser: any, testCase: any, testRunId: string) {
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  })

  const page = await context.newPage()
  const steps = testCase.steps as any[]
  const stepResults = []
  const screenshots = []
  const logs = []

  let passed = true
  const startTime = Date.now()

  try {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      const stepStartTime = Date.now()
      
      logs.push(`Executing step ${i + 1}: ${step.action}`)

      try {
        switch (step.type) {
          case 'navigate':
            await page.goto(step.selector || testCase.website.url, { 
              waitUntil: 'networkidle',
              timeout: 30000 
            })
            break

          case 'click':
            if (step.selector) {
              await page.waitForSelector(step.selector, { timeout: 10000 })
              await page.click(step.selector)
            }
            break

          case 'type':
            if (step.selector && step.value) {
              await page.waitForSelector(step.selector, { timeout: 10000 })
              await page.fill(step.selector, step.value)
            }
            break

          case 'wait':
            await page.waitForTimeout(parseInt(step.value) || 1000)
            break

          case 'assert':
            if (step.selector) {
              await page.waitForSelector(step.selector, { timeout: 10000 })
              const element = await page.$(step.selector)
              if (!element) {
                throw new Error(`Element not found: ${step.selector}`)
              }
            }
            break
        }

        // Take screenshot after each step
        const screenshot = await page.screenshot({ 
          type: 'png',
          fullPage: true 
        })
        screenshots.push(`step-${i + 1}.png`)

        stepResults.push({
          stepId: step.id,
          passed: true,
          duration: Date.now() - stepStartTime,
          screenshot: `step-${i + 1}.png`
        })

        logs.push(`Step ${i + 1} completed successfully`)

        // Add delay between steps
        await page.waitForTimeout(500)

      } catch (stepError) {
        console.error(`Step ${i + 1} failed:`, stepError)
        
        stepResults.push({
          stepId: step.id,
          passed: false,
          duration: Date.now() - stepStartTime,
          error: stepError.message,
          screenshot: `error-step-${i + 1}.png`
        })

        logs.push(`Step ${i + 1} failed: ${stepError.message}`)
        passed = false
        break
      }
    }

    const duration = Date.now() - startTime

    // Update test run with results
    await prisma.testRun.update({
      where: { id: testRunId },
      data: {
        status: passed ? 'COMPLETED' : 'FAILED',
        completedAt: new Date(),
        duration,
        results: {
          passed,
          steps: stepResults,
          screenshots,
          logs
        }
      }
    })

    return {
      testRunId,
      testCaseId: testCase.id,
      passed,
      duration,
      steps: stepResults.length,
      passedSteps: stepResults.filter(s => s.passed).length
    }

  } catch (error) {
    console.error(`Test case execution failed:`, error)
    
    await prisma.testRun.update({
      where: { id: testRunId },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        duration: Date.now() - startTime,
        results: {
          passed: false,
          error: error.message,
          steps: stepResults,
          screenshots,
          logs
        }
      }
    })

    throw error
  } finally {
    await context.close()
  }
}
