'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { TestTube, Play, CheckCircle, XCircle, Clock, AlertTriangle, Globe, Settings, Eye } from 'lucide-react'

interface TestCase {
  id: string
  name: string
  description: string
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  tags: string[]
  steps: TestStep[]
  aiGenerated: boolean
  createdAt: string
}

interface TestStep {
  id: string
  action: string
  selector: string
  value?: string
  expected: string
  type: 'click' | 'type' | 'wait' | 'assert' | 'navigate'
}

interface TestRun {
  id: string
  testCaseId: string
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  duration: number
  createdAt: string
  results?: TestResult
}

interface TestResult {
  passed: boolean
  steps: Array<{
    stepId: string
    passed: boolean
    duration: number
    error?: string
    screenshot?: string
  }>
  screenshots: string[]
  logs: string[]
}

export default function TestCasesPage() {
  const params = useParams()
  const websiteId = params.id as string
  
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [testRuns, setTestRuns] = useState<TestRun[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRunning, setIsRunning] = useState(false)

  // Mock data for demonstration
  useEffect(() => {
    const mockTestCases: TestCase[] = [
      {
        id: '1',
        name: 'Login Flow Test',
        description: 'Test user login functionality with valid credentials',
        status: 'ACTIVE',
        priority: 'HIGH',
        tags: ['auth', 'login'],
        aiGenerated: true,
        createdAt: new Date().toISOString(),
        steps: [
          {
            id: '1',
            action: 'Navigate to login page',
            selector: '',
            expected: 'Login page loads successfully',
            type: 'navigate'
          },
          {
            id: '2',
            action: 'Enter email address',
            selector: 'input[type="email"]',
            value: 'test@example.com',
            expected: 'Email field accepts input',
            type: 'type'
          },
          {
            id: '3',
            action: 'Enter password',
            selector: 'input[type="password"]',
            value: 'password123',
            expected: 'Password field accepts input',
            type: 'type'
          },
          {
            id: '4',
            action: 'Click login button',
            selector: 'button[type="submit"]',
            expected: 'User is logged in successfully',
            type: 'click'
          }
        ]
      },
      {
        id: '2',
        name: 'Checkout Process',
        description: 'Test complete checkout flow from cart to payment',
        status: 'ACTIVE',
        priority: 'CRITICAL',
        tags: ['ecommerce', 'checkout'],
        aiGenerated: true,
        createdAt: new Date().toISOString(),
        steps: [
          {
            id: '1',
            action: 'Add item to cart',
            selector: 'button[data-testid="add-to-cart"]',
            expected: 'Item added to cart',
            type: 'click'
          },
          {
            id: '2',
            action: 'Navigate to cart',
            selector: '',
            expected: 'Cart page loads with items',
            type: 'navigate'
          },
          {
            id: '3',
            action: 'Click checkout button',
            selector: 'button[data-testid="checkout"]',
            expected: 'Checkout page loads',
            type: 'click'
          }
        ]
      }
    ]

    setTestCases(mockTestCases)
  }, [websiteId])

  const getStatusBadge = (status: string) => {
    const variants = {
      DRAFT: 'bg-gray-100 text-gray-800',
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      RUNNING: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800'
    } as const

    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.toLowerCase()}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const variants = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      CRITICAL: 'bg-red-100 text-red-800'
    } as const

    return (
      <Badge className={variants[priority as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {priority.toLowerCase()}
      </Badge>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'RUNNING':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const generateTestCases = async () => {
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/websites/generate-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId })
      })

      if (response.ok) {
        const result = await response.json()
        
        // Refresh test cases
        await fetchTestCases()
        
        alert(`Generated ${result.count} test cases successfully!`)
      } else {
        throw new Error('Test generation failed')
      }
    } catch (error) {
      console.error('Test generation error:', error)
      alert('Failed to generate test cases. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const fetchTestCases = async () => {
    try {
      const response = await fetch(`/api/websites/${websiteId}/test-cases`)
      if (response.ok) {
        const data = await response.json()
        setTestCases(data.testCases || [])
      }
    } catch (error) {
      console.error('Failed to fetch test cases:', error)
    }
  }

  const runTestCase = async (testCaseId: string) => {
    setIsRunning(true)
    
    try {
      const response = await fetch('/api/test-runs/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          testCaseIds: [testCaseId],
          websiteId 
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        // Refresh test runs
        await fetchTestRuns()
        
        alert(`Test executed successfully!`)
      } else {
        throw new Error('Test execution failed')
      }
    } catch (error) {
      console.error('Test execution error:', error)
      alert('Failed to execute test. Please try again.')
    } finally {
      setIsRunning(false)
    }
  }

  const fetchTestRuns = async () => {
    try {
      const response = await fetch(`/api/websites/${websiteId}/test-runs`)
      if (response.ok) {
        const data = await response.json()
        setTestRuns(data.testRuns || [])
      }
    } catch (error) {
      console.error('Failed to fetch test runs:', error)
    }
  }

  const runAllTests = async () => {
    for (const testCase of testCases.filter(tc => tc.status === 'ACTIVE')) {
      await runTestCase(testCase.id)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Test Cases</h1>
              <p className="text-gray-600 mt-2">Manage and execute test cases for your website</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={generateTestCases} 
                disabled={isGenerating}
                variant="outline"
              >
                <TestTube className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate with AI'}
              </Button>
              <Button 
                onClick={runAllTests} 
                disabled={isRunning || testCases.length === 0}
              >
                <Play className="h-4 w-4 mr-2" />
                {isRunning ? 'Running...' : 'Run All Tests'}
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="test-cases" className="space-y-6">
          <TabsList>
            <TabsTrigger value="test-cases">Test Cases</TabsTrigger>
            <TabsTrigger value="runs">Test Runs</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="test-cases">
            <div className="space-y-4">
              {testCases.map((testCase) => (
                <Card key={testCase.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <TestTube className="h-5 w-5 text-blue-600" />
                        <div>
                          <CardTitle className="text-lg">{testCase.name}</CardTitle>
                          <CardDescription>{testCase.description}</CardDescription>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <div className="flex space-x-1">
                              {testCase.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            {testCase.aiGenerated && (
                              <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800">
                                AI Generated
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getPriorityBadge(testCase.priority)}
                        {getStatusBadge(testCase.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Test Steps:</h4>
                        <div className="space-y-2">
                          {testCase.steps.map((step, index) => (
                            <div key={step.id} className="flex items-center space-x-3 text-sm">
                              <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </span>
                              <span className="text-gray-600">{step.action}</span>
                              {step.selector && (
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {step.selector}
                                </code>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => runTestCase(testCase.id)}
                          disabled={isRunning}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Run Test
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="runs">
            <Card>
              <CardHeader>
                <CardTitle>Test Run History</CardTitle>
                <CardDescription>Previous test execution results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testRuns.map((run) => {
                    const testCase = testCases.find(tc => tc.id === run.testCaseId)
                    return (
                      <div key={run.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(run.status)}
                          <div>
                            <p className="font-medium">{testCase?.name || 'Unknown Test'}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(run.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              {run.duration > 0 ? `${run.duration}ms` : 'Running...'}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            {getStatusBadge(run.status)}
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  
                  {testRuns.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No test runs yet</p>
                      <p className="text-sm">Run some tests to see results here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>Detailed test execution results and analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {testRuns.filter(run => run.results).map((run) => {
                    const testCase = testCases.find(tc => tc.id === run.testCaseId)
                    return (
                      <div key={run.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-medium">{testCase?.name || 'Unknown Test'}</h3>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(run.status)}
                            <span className="text-sm text-gray-600">{run.duration}ms</span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Step Results:</h4>
                            <div className="space-y-2">
                              {run.results?.steps.map((step, index) => (
                                <div key={step.stepId} className="flex items-center space-x-3 text-sm">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                    step.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {step.passed ? '✓' : '✗'}
                                  </div>
                                  <span className="text-gray-600">
                                    Step {index + 1}: {testCase?.steps[index]?.action}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    ({step.duration}ms)
                                  </span>
                                  {step.error && (
                                    <span className="text-xs text-red-600">
                                      - {step.error}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {run.results?.screenshots && run.results.screenshots.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Screenshots:</h4>
                              <div className="flex space-x-2">
                                {run.results.screenshots.map((screenshot, index) => (
                                  <div key={index} className="w-20 h-20 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                                    {screenshot}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  
                  {testRuns.filter(run => run.results).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No test results yet</p>
                      <p className="text-sm">Run some tests to see detailed results here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
