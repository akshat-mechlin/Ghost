import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface TestStep {
  type: 'navigate' | 'click' | 'type' | 'wait' | 'assert'
  selector?: string
  value?: string
  description: string
}

export async function generateTestCases(pageContent: string, pageUrl: string): Promise<TestStep[][]> {
  const prompt = `
    Analyze the following webpage content and generate comprehensive test cases.
    
    Page URL: ${pageUrl}
    Page Content: ${pageContent}
    
    Generate test cases that cover:
    1. Navigation and basic functionality
    2. Form interactions (if any)
    3. User flows and critical paths
    4. Edge cases and error conditions
    
    Return the test cases as a JSON array where each test case is an array of steps.
    Each step should have: type, selector (if needed), value (if needed), and description.
    
    Types available: navigate, click, type, wait, assert
  `

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert QA engineer. Generate detailed, practical test cases for web applications.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content generated')
    }

    return JSON.parse(content)
  } catch (error) {
    console.error('AI test generation failed:', error)
    return generateFallbackTestCases(pageUrl)
  }
}

export async function analyzeBug(error: string, logs: any, screenshot?: string): Promise<{
  summary: string
  rootCause: string
  reproductionSteps: string[]
}> {
  const prompt = `
    Analyze this test failure and provide insights:
    
    Error: ${error}
    Logs: ${JSON.stringify(logs)}
    
    Please provide:
    1. A concise summary of what went wrong
    2. The most likely root cause
    3. Step-by-step reproduction instructions
    
    Return as JSON with keys: summary, rootCause, reproductionSteps
  `

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert QA analyst. Analyze test failures and provide actionable insights.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1000
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content generated')
    }

    return JSON.parse(content)
  } catch (error) {
    console.error('AI bug analysis failed:', error)
    return {
      summary: 'Test failed with an unexpected error',
      rootCause: 'Unable to determine root cause automatically',
      reproductionSteps: ['Run the test case again to reproduce the issue']
    }
  }
}

function generateFallbackTestCases(pageUrl: string): TestStep[][] {
  return [
    [
      { type: 'navigate', value: pageUrl, description: 'Navigate to the page' },
      { type: 'wait', value: '2000', description: 'Wait for page to load' },
      { type: 'assert', selector: 'title', description: 'Verify page title exists' }
    ]
  ]
}