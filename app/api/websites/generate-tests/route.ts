import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-demo-key'
})

export async function POST(request: NextRequest) {
  try {
    const { websiteId } = await request.json()

    if (!websiteId) {
      return NextResponse.json({ error: 'Website ID is required' }, { status: 400 })
    }

    // Get website and its pages
    const website = await prisma.website.findUnique({
      where: { id: websiteId },
      include: {
        pages: true
      }
    })

    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 })
    }

    // Generate test cases using AI
    const testCases = await generateTestCases(website)

    // Get demo organization and user
    const organization = await prisma.organization.findFirst({
      where: { subdomain: 'demo' }
    })
    
    const user = await prisma.user.findFirst({
      where: { email: 'demo@example.com' }
    })

    if (!organization || !user) {
      return NextResponse.json({ error: 'Demo organization or user not found' }, { status: 404 })
    }

    // Save test cases to database
    for (const testCase of testCases) {
      await prisma.testCase.create({
        data: {
          name: testCase.name,
          description: testCase.description,
          steps: testCase.steps,
          aiGenerated: true,
          status: 'ACTIVE',
          priority: testCase.priority,
          tags: testCase.tags,
          organizationId: organization.id,
          websiteId: websiteId,
          pageId: testCase.pageId
        }
      })
    }

    return NextResponse.json({ 
      message: 'Test cases generated successfully',
      count: testCases.length
    })
  } catch (error) {
    console.error('Test generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generateTestCases(website: any) {
  const pages = website.pages.slice(0, 5) // Limit to first 5 pages for AI processing
  
  const prompt = `
    Generate comprehensive test cases for a website with the following pages:
    
    Website: ${website.name} (${website.url})
    
    Pages:
    ${pages.map((page: any) => `
      - ${page.title || page.url}
        URL: ${page.url}
        Forms: ${JSON.stringify(page.metadata?.forms || [])}
        Buttons: ${JSON.stringify(page.metadata?.buttons || [])}
        Content: ${page.content?.slice(0, 500) || ''}
    `).join('\n')}
    
    Generate 5-8 test cases covering:
    1. User authentication flows (login, registration, password reset)
    2. Form submissions and validations
    3. Navigation and user flows
    4. UI interactions (buttons, links, dropdowns)
    5. Error handling and edge cases
    
    For each test case, provide:
    - name: Descriptive test case name
    - description: What the test validates
    - priority: LOW, MEDIUM, HIGH, or CRITICAL
    - tags: Array of relevant tags
    - steps: Array of test steps with action, selector, expected result
    
    Return as JSON array of test cases.
  `

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert QA engineer. Generate detailed, actionable test cases for web applications. Always return valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // Parse AI response
    const testCases = JSON.parse(response)
    
    // Add pageId to each test case
    return testCases.map((testCase: any, index: number) => ({
      ...testCase,
      pageId: pages[index % pages.length]?.id || null
    }))

  } catch (error) {
    console.error('AI generation error:', error)
    
    // Fallback: Generate basic test cases
    return generateFallbackTestCases(website, pages)
  }
}

function generateFallbackTestCases(website: any, pages: any[]) {
  const testCases = []

  // Basic navigation test
  testCases.push({
    name: 'Homepage Navigation',
    description: 'Verify homepage loads and main navigation works',
    priority: 'HIGH',
    tags: ['navigation', 'homepage'],
    steps: [
      {
        id: '1',
        action: 'Navigate to homepage',
        selector: '',
        expected: 'Homepage loads successfully',
        type: 'navigate'
      },
      {
        id: '2',
        action: 'Verify page title is present',
        selector: 'h1, h2, h3',
        expected: 'Page has visible heading',
        type: 'assert'
      }
    ],
    pageId: pages[0]?.id || null
  })

  // Form test if forms exist
  const forms = pages.flatMap(page => page.metadata?.forms || [])
  if (forms.length > 0) {
    testCases.push({
      name: 'Form Submission Test',
      description: 'Test form submission functionality',
      priority: 'MEDIUM',
      tags: ['forms', 'validation'],
      steps: [
        {
          id: '1',
          action: 'Navigate to page with form',
          selector: '',
          expected: 'Form page loads',
          type: 'navigate'
        },
        {
          id: '2',
          action: 'Fill required form fields',
          selector: 'input[required], select[required]',
          value: 'test@example.com',
          expected: 'Form accepts input',
          type: 'type'
        },
        {
          id: '3',
          action: 'Submit form',
          selector: 'button[type="submit"], input[type="submit"]',
          expected: 'Form submits successfully',
          type: 'click'
        }
      ],
      pageId: pages.find(page => page.metadata?.forms?.length > 0)?.id || pages[0]?.id
    })
  }

  // Button interaction test
  const buttons = pages.flatMap(page => page.metadata?.buttons || [])
  if (buttons.length > 0) {
    testCases.push({
      name: 'Button Interaction Test',
      description: 'Test button clicks and interactions',
      priority: 'MEDIUM',
      tags: ['buttons', 'interactions'],
      steps: [
        {
          id: '1',
          action: 'Navigate to page with buttons',
          selector: '',
          expected: 'Page with buttons loads',
          type: 'navigate'
        },
        {
          id: '2',
          action: 'Click primary button',
          selector: 'button:not([type="submit"]), input[type="button"]',
          expected: 'Button responds to click',
          type: 'click'
        }
      ],
      pageId: pages.find(page => page.metadata?.buttons?.length > 0)?.id || pages[0]?.id
    })
  }

  return testCases
}
