import { chromium, Browser, Page } from 'playwright'

export interface CrawlResult {
  pages: PageData[]
  errors: string[]
}

export interface PageData {
  url: string
  title: string
  content: string
  metadata: {
    forms: FormData[]
    buttons: ButtonData[]
    links: LinkData[]
    inputs: InputData[]
  }
}

interface FormData {
  selector: string
  action: string
  method: string
  inputs: InputData[]
}

interface ButtonData {
  selector: string
  text: string
  type: string
}

interface LinkData {
  selector: string
  text: string
  href: string
}

interface InputData {
  selector: string
  type: string
  name: string
  placeholder?: string
  required: boolean
}

export class WebsiteCrawler {
  private browser: Browser | null = null

  async initialize() {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
  }

  async crawl(startUrl: string, options: {
    maxDepth?: number
    maxPages?: number
    respectRobots?: boolean
  } = {}): Promise<CrawlResult> {
    if (!this.browser) {
      await this.initialize()
    }

    const {
      maxDepth = 3,
      maxPages = 50,
      respectRobots = true
    } = options

    const visited = new Set<string>()
    const queue: { url: string; depth: number }[] = [{ url: startUrl, depth: 0 }]
    const pages: PageData[] = []
    const errors: string[] = []

    while (queue.length > 0 && pages.length < maxPages) {
      const { url, depth } = queue.shift()!

      if (visited.has(url) || depth > maxDepth) {
        continue
      }

      visited.add(url)

      try {
        const pageData = await this.crawlPage(url)
        pages.push(pageData)

        // Extract links for next level crawling
        if (depth < maxDepth) {
          for (const link of pageData.metadata.links) {
            const absoluteUrl = new URL(link.href, url).toString()
            if (this.isSameDomain(absoluteUrl, startUrl) && !visited.has(absoluteUrl)) {
              queue.push({ url: absoluteUrl, depth: depth + 1 })
            }
          }
        }
      } catch (error) {
        errors.push(`Failed to crawl ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return { pages, errors }
  }

  private async crawlPage(url: string): Promise<PageData> {
    const page = await this.browser!.newPage()
    
    try {
      await page.goto(url, { waitUntil: 'networkidle' })
      
      const title = await page.title()
      const content = await page.evaluate(() => document.body.innerText)
      
      // Extract forms
      const forms = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('form')).map((form, index) => ({
          selector: `form:nth-of-type(${index + 1})`,
          action: form.action || '',
          method: form.method || 'GET',
          inputs: Array.from(form.querySelectorAll('input, select, textarea')).map((input, inputIndex) => ({
            selector: `form:nth-of-type(${index + 1}) ${input.tagName.toLowerCase()}:nth-of-type(${inputIndex + 1})`,
            type: input.getAttribute('type') || input.tagName.toLowerCase(),
            name: input.getAttribute('name') || '',
            placeholder: input.getAttribute('placeholder') || '',
            required: input.hasAttribute('required')
          }))
        }))
      })

      // Extract buttons
      const buttons = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"]')).map((btn, index) => ({
          selector: `${btn.tagName.toLowerCase()}:nth-of-type(${index + 1})`,
          text: btn.textContent?.trim() || btn.getAttribute('value') || '',
          type: btn.getAttribute('type') || 'button'
        }))
      })

      // Extract links
      const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]')).map((link, index) => ({
          selector: `a:nth-of-type(${index + 1})`,
          text: link.textContent?.trim() || '',
          href: link.getAttribute('href') || ''
        }))
      })

      // Extract inputs
      const inputs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('input:not([type="submit"]):not([type="button"]), select, textarea')).map((input, index) => ({
          selector: `${input.tagName.toLowerCase()}:nth-of-type(${index + 1})`,
          type: input.getAttribute('type') || input.tagName.toLowerCase(),
          name: input.getAttribute('name') || '',
          placeholder: input.getAttribute('placeholder') || '',
          required: input.hasAttribute('required')
        }))
      })

      return {
        url,
        title,
        content,
        metadata: {
          forms,
          buttons,
          links,
          inputs
        }
      }
    } finally {
      await page.close()
    }
  }

  private isSameDomain(url1: string, url2: string): boolean {
    try {
      const domain1 = new URL(url1).hostname
      const domain2 = new URL(url2).hostname
      return domain1 === domain2
    } catch {
      return false
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }
}