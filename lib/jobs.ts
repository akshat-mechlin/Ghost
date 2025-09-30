import Queue from 'bull'
import Redis from 'ioredis'
import { prisma } from './prisma'
import { WebsiteCrawler } from './crawler'
import { generateTestCases } from './ai'
import { TestRunner } from './test-runner'

// Initialize Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

// Create job queues
export const crawlQueue = new Queue('website crawl', {
  redis: { port: 6379, host: 'localhost' }
})

export const testQueue = new Queue('test execution', {
  redis: { port: 6379, host: 'localhost' }
})

export const scheduleQueue = new Queue('scheduled tests', {
  redis: { port: 6379, host: 'localhost' }
})

// Website crawling job processor
crawlQueue.process(async (job) => {
  const { websiteId, organizationId } = job.data
  
  try {
    // Update website status
    await prisma.website.update({
      where: { id: websiteId },
      data: { status: 'CRAWLING' }
    })

    const website = await prisma.website.findUnique({
      where: { id: websiteId }
    })

    if (!website) {
      throw new Error('Website not found')
    }

    // Crawl the website
    const crawler = new WebsiteCrawler()
    const result = await crawler.crawl(website.url, {
      maxDepth: website.crawlDepth,
      maxPages: website.maxPages
    })

    // Save crawled pages
    for (const pageData of result.pages) {
      await prisma.websitePage.create({
        data: {
          websiteId,
          url: pageData.url,
          title: pageData.title,
          content: pageData.content,
          metadata: pageData.metadata
        }
      })

      // Generate test cases for each page
      const testCases = await generateTestCases(pageData.content, pageData.url)
      
      for (let i = 0; i < testCases.length; i++) {
        await prisma.testCase.create({
          data: {
            name: `Test Case ${i + 1} for ${pageData.title || pageData.url}`,
            description: `Auto-generated test case for ${pageData.url}`,
            steps: testCases[i],
            organizationId,
            websiteId,
            pageId: (await prisma.websitePage.findFirst({
              where: { websiteId, url: pageData.url }
            }))?.id
          }
        })
      }
    }

    // Update website status
    await prisma.website.update({
      where: { id: websiteId },
      data: { 
        status: 'COMPLETED',
        lastCrawled: new Date()
      }
    })

    await crawler.close()
  } catch (error) {
    await prisma.website.update({
      where: { id: websiteId },
      data: { status: 'ERROR' }
    })
    throw error
  }
})

// Test execution job processor
testQueue.process(async (job) => {
  const { testRunId, testCaseId, userId } = job.data
  
  try {
    // Update test run status
    await prisma.testRun.update({
      where: { id: testRunId },
      data: { 
        status: 'RUNNING',
        startedAt: new Date()
      }
    })

    // Get test case
    const testCase = await prisma.testCase.findUnique({
      where: { id: testCaseId }
    })

    if (!testCase) {
      throw new Error('Test case not found')
    }

    // Run the test
    const runner = new TestRunner()
    const result = await runner.runTest(testCase.steps as any[])

    // Update test run with results
    await prisma.testRun.update({
      where: { id: testRunId },
      data: {
        status: result.status === 'passed' ? 'COMPLETED' : 'FAILED',
        completedAt: new Date(),
        duration: result.duration,
        results: result,
        logs: result.logs,
        screenshots: result.screenshots,
        videos: result.videos
      }
    })

    // If test failed, create a bug report
    if (result.status === 'failed') {
      const aiAnalysis = await import('./ai').then(m => 
        m.analyzeBug(result.error || 'Test failed', result.logs, result.screenshots[0])
      )

      await prisma.bug.create({
        data: {
          title: `Test failure: ${testCase.name}`,
          description: result.error || 'Test failed without specific error',
          severity: 'MEDIUM',
          aiSummary: aiAnalysis.summary,
          rootCause: aiAnalysis.rootCause,
          steps: aiAnalysis.reproductionSteps,
          logs: result.logs,
          screenshots: result.screenshots,
          organizationId: testCase.organizationId,
          testRunId,
          reportedBy: userId
        }
      })
    }

    await runner.close()
  } catch (error) {
    await prisma.testRun.update({
      where: { id: testRunId },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        results: {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    })
    throw error
  }
})

// Scheduled test processor
scheduleQueue.process(async (job) => {
  const { scheduleId, organizationId } = job.data
  
  const schedule = await prisma.testSchedule.findUnique({
    where: { id: scheduleId }
  })

  if (!schedule || !schedule.isActive) {
    return
  }

  // Create test runs for all scheduled test cases
  for (const testCaseId of schedule.testCaseIds) {
    const testRun = await prisma.testRun.create({
      data: {
        organizationId,
        testCaseId,
        userId: 'system', // System user for scheduled runs
        status: 'PENDING'
      }
    })

    // Queue the test execution
    await testQueue.add('execute-test', {
      testRunId: testRun.id,
      testCaseId,
      userId: 'system'
    })
  }

  // Update last run time
  await prisma.testSchedule.update({
    where: { id: scheduleId },
    data: { lastRun: new Date() }
  })
})

export { redis }