import { chromium, Browser, Page } from 'playwright'
import { TestStep } from './ai'

export interface TestResult {
  status: 'passed' | 'failed' | 'skipped'
  duration: number
  error?: string
  logs: any[]
  screenshots: string[]
  videos: string[]
}

export class TestRunner {
  private browser: Browser | null = null

  async initialize() {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
  }

  async runTest(steps: TestStep[], options: {
    timeout?: number
    screenshots?: boolean
    videos?: boolean
  } = {}): Promise<TestResult> {
    if (!this.browser) {
      await this.initialize()
    }

    const {
      timeout = 30000,
      screenshots = true,
      videos = false
    } = options

    const context = await this.browser.createContext({
      recordVideo: videos ? { dir: './test-videos' } : undefined
    })

    const page = await context.newPage()
    const logs: any[] = []
    const screenshots: string[] = []
    const videos: string[] = []

    // Capture console logs
    page.on('console', msg => {
      logs.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      })
    })

    // Capture network errors
    page.on('requestfailed', request => {
      logs.push({
        type: 'network_error',
        url: request.url(),
        error: request.failure()?.errorText,
        timestamp: new Date().toISOString()
      })
    })

    const startTime = Date.now()

    try {
      page.setDefaultTimeout(timeout)

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i]
        
        try {
          await this.executeStep(page, step)
          
          if (screenshots) {
            const screenshot = await page.screenshot({
              path: `./test-screenshots/step-${i + 1}.png`
            })
            screenshots.push(`step-${i + 1}.png`)
          }
        } catch (error) {
          // Take screenshot on failure
          if (screenshots) {
            const screenshot = await page.screenshot({
              path: `./test-screenshots/error-step-${i + 1}.png`
            })
            screenshots.push(`error-step-${i + 1}.png`)
          }
          
          throw new Error(`Step ${i + 1} failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      const duration = Date.now() - startTime

      await context.close()

      return {
        status: 'passed',
        duration,
        logs,
        screenshots,
        videos
      }
    } catch (error) {
      const duration = Date.now() - startTime

      await context.close()

      return {
        status: 'failed',
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
        logs,
        screenshots,
        videos
      }
    }
  }

  private async executeStep(page: Page, step: TestStep) {
    switch (step.type) {
      case 'navigate':
        if (!step.value) throw new Error('Navigate step requires a URL')
        await page.goto(step.value, { waitUntil: 'networkidle' })
        break

      case 'click':
        if (!step.selector) throw new Error('Click step requires a selector')
        await page.click(step.selector)
        break

      case 'type':
        if (!step.selector || !step.value) throw new Error('Type step requires selector and value')
        await page.fill(step.selector, step.value)
        break

      case 'wait':
        const waitTime = step.value ? parseInt(step.value) : 1000
        await page.waitForTimeout(waitTime)
        break

      case 'assert':
        if (!step.selector) throw new Error('Assert step requires a selector')
        const element = await page.locator(step.selector)
        await expect(element).toBeVisible()
        break

      default:
        throw new Error(`Unknown step type: ${step.type}`)
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }
}

// Simple expect implementation for assertions
const expect = (locator: any) => ({
  toBeVisible: async () => {
    await locator.waitFor({ state: 'visible' })
  }
})