import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import puppeteer from 'puppeteer'

export async function POST(request: NextRequest) {
  try {
    const { websiteId } = await request.json()

    if (!websiteId) {
      return NextResponse.json({ error: 'Website ID is required' }, { status: 400 })
    }

    // Get website from database
    const website = await prisma.website.findUnique({
      where: { id: websiteId }
    })

    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 })
    }

    // Update website status to crawling
    await prisma.website.update({
      where: { id: websiteId },
      data: { status: 'CRAWLING' }
    })

    // Start crawling in background
    crawlWebsite(websiteId, website.url, website.crawlDepth, website.maxPages)

    return NextResponse.json({ message: 'Crawling started' })
  } catch (error) {
    console.error('Crawl error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function crawlWebsite(websiteId: string, url: string, crawlDepth: number, maxPages: number) {
  let browser
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()
    await page.setViewport({ width: 1920, height: 1080 })

    const visitedUrls = new Set<string>()
    const pagesToCrawl = [{ url, depth: 0 }]
    const crawledPages = []

    while (pagesToCrawl.length > 0 && crawledPages.length < maxPages) {
      const { url: currentUrl, depth } = pagesToCrawl.shift()!

      if (visitedUrls.has(currentUrl) || depth > crawlDepth) {
        continue
      }

      try {
        console.log(`Crawling: ${currentUrl} (depth: ${depth})`)
        
        await page.goto(currentUrl, { waitUntil: 'networkidle2', timeout: 30000 })
        visitedUrls.add(currentUrl)

        // Extract page data
        const pageData = await page.evaluate(() => {
          const forms = Array.from(document.querySelectorAll('form')).map(form => ({
            action: form.action,
            method: form.method,
            inputs: Array.from(form.querySelectorAll('input, select, textarea')).map(input => ({
              type: input.type || input.tagName.toLowerCase(),
              name: input.name,
              placeholder: input.placeholder,
              required: input.required
            }))
          }))

          const buttons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"]')).map(button => ({
            text: button.textContent?.trim(),
            type: button.type || 'button',
            className: button.className,
            id: button.id
          }))

          const links = Array.from(document.querySelectorAll('a[href]')).map(link => ({
            href: link.href,
            text: link.textContent?.trim(),
            className: link.className
          }))

          return {
            title: document.title,
            url: window.location.href,
            forms,
            buttons,
            links: links.slice(0, 50), // Limit links
            content: document.body.innerText.slice(0, 5000) // Limit content
          }
        })

        // Save page to database
        const savedPage = await prisma.websitePage.create({
          data: {
            url: currentUrl,
            title: pageData.title,
            content: pageData.content,
            metadata: {
              forms: pageData.forms,
              buttons: pageData.buttons,
              links: pageData.links
            },
            websiteId: websiteId
          }
        })

        crawledPages.push(savedPage)

        // Find new URLs to crawl
        if (depth < crawlDepth) {
          const newUrls = pageData.links
            .map(link => link.href)
            .filter(href => {
              try {
                const url = new URL(href)
                return url.origin === new URL(currentUrl).origin
              } catch {
                return false
              }
            })
            .slice(0, 10) // Limit new URLs per page

          for (const newUrl of newUrls) {
            if (!visitedUrls.has(newUrl)) {
              pagesToCrawl.push({ url: newUrl, depth: depth + 1 })
            }
          }
        }

        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error(`Error crawling ${currentUrl}:`, error)
      }
    }

    // Update website status to completed
    await prisma.website.update({
      where: { id: websiteId },
      data: { 
        status: 'COMPLETED',
        lastCrawled: new Date()
      }
    })

    console.log(`Crawling completed for website ${websiteId}. Found ${crawledPages.length} pages.`)

  } catch (error) {
    console.error('Crawling error:', error)
    
    // Update website status to error
    await prisma.website.update({
      where: { id: websiteId },
      data: { status: 'ERROR' }
    })
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}
