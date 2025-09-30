'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Play, Clock, CheckCircle, XCircle, AlertTriangle, Settings, Eye } from 'lucide-react'

interface TestCase {
  id: string
  name: string
  description: string
  website: string
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  tags: string[]
}

interface TestRun {
  id: string
  testCase: string
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  duration: number
  createdAt: string
  website: string
  results?: any
}

export default function TestRunsPage() {
  const [selectedWebsite, setSelectedWebsite] = useState('all')
  const [selectedTestCases, setSelectedTestCases] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentRun, setCurrentRun] = useState<TestRun | null>(null)

  const websites = ['all', 'example.com', 'demo.app', 'test-site.com']

  const testCases: TestCase[] = [
    {
      id: '1',
      name: 'Login Flow Test',
      description: 'Test user login functionality',
      website: 'example.com',
      status: 'ACTIVE',
      priority: 'HIGH',
      tags: ['auth', 'login']
    },
    {
      id: '2',
      name: 'Checkout Process',
      description: 'Test complete checkout flow',
      website: 'example.com',
      status: 'ACTIVE',
      priority: 'CRITICAL',
      tags: ['ecommerce', 'checkout']
    },
    {
      id: '3',
      name: 'User Registration',
      description: 'Test new user registration',
      website: 'demo.app',
      status: 'ACTIVE',
      priority: 'MEDIUM',
      tags: ['auth', 'registration']
    },
    {
      id: '4',
      name: 'Password Reset',
      description: 'Test password reset functionality',
      website: 'demo.app',
      status: 'ACTIVE',
      priority: 'MEDIUM',
      tags: ['auth', 'password']
    },
    {
      id: '5',
      name: 'Mobile Responsive Test',
      description: 'Test mobile responsiveness',
      website: 'test-site.com',
      status: 'ACTIVE',
      priority: 'LOW',
      tags: ['ui', 'mobile']
    }
  ]

  const [testRuns, setTestRuns] = useState<TestRun[]>([
    {
      id: '1',
      testCase: 'Login Flow Test',
      status: 'COMPLETED',
      duration: 2500,
      createdAt: new Date().toISOString(),
      website: 'example.com'
    },
    {
      id: '2',
      testCase: 'Checkout Process',
      status: 'FAILED',
      duration: 1800,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      website: 'example.com'
    },
    {
      id: '3',
      testCase: 'User Registration',
      status: 'COMPLETED',
      duration: 3200,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      website: 'demo.app'
    }
  ])

  const filteredTestCases = testCases.filter(tc => 
    selectedWebsite === 'all' || tc.website === selectedWebsite
  )

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      RUNNING: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      DRAFT: 'bg-gray-100 text-gray-800',
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800'
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

  const handleSelectTestCase = (testCaseId: string, checked: boolean) => {
    if (checked) {
      setSelectedTestCases([...selectedTestCases, testCaseId])
    } else {
      setSelectedTestCases(selectedTestCases.filter(id => id !== testCaseId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTestCases(filteredTestCases.map(tc => tc.id))
    } else {
      setSelectedTestCases([])
    }
  }

  const handleRunTests = async () => {
    if (selectedTestCases.length === 0) return

    setIsRunning(true)
    
    // Create test runs for selected test cases
    const newRuns: TestRun[] = selectedTestCases.map(testCaseId => {
      const testCase = testCases.find(tc => tc.id === testCaseId)
      return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        testCase: testCase?.name || 'Unknown Test',
        status: 'RUNNING',
        duration: 0,
        createdAt: new Date().toISOString(),
        website: testCase?.website || 'unknown'
      }
    })

    setTestRuns([...newRuns, ...testRuns])
    setCurrentRun(newRuns[0])

    // Simulate test execution
    for (let i = 0; i < newRuns.length; i++) {
      const run = newRuns[i]
      
      // Update status to running
      setTestRuns(prev => prev.map(r => 
        r.id === run.id ? { ...r, status: 'RUNNING' as const } : r
      ))

      // Simulate test duration (2-5 seconds)
      const duration = Math.random() * 3000 + 2000
      await new Promise(resolve => setTimeout(resolve, duration))

      // Randomly pass or fail (80% pass rate)
      const passed = Math.random() > 0.2
      
      setTestRuns(prev => prev.map(r => 
        r.id === run.id ? { 
          ...r, 
          status: passed ? 'COMPLETED' as const : 'FAILED' as const,
          duration: Math.round(duration)
        } : r
      ))
    }

    setIsRunning(false)
    setCurrentRun(null)
    setSelectedTestCases([])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Test Runs</h1>
              <p className="text-gray-600 mt-2">Execute and monitor your test cases</p>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedWebsite} onValueChange={setSelectedWebsite}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Websites</SelectItem>
                  {websites.filter(w => w !== 'all').map(website => (
                    <SelectItem key={website} value={website}>{website}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Tabs defaultValue="run-tests" className="space-y-6">
          <TabsList>
            <TabsTrigger value="run-tests">Run Tests</TabsTrigger>
            <TabsTrigger value="test-cases">Test Cases</TabsTrigger>
            <TabsTrigger value="history">Run History</TabsTrigger>
          </TabsList>

          <TabsContent value="run-tests">
            <Card>
              <CardHeader>
                <CardTitle>Select Test Cases to Run</CardTitle>
                <CardDescription>Choose which tests to execute</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all"
                      checked={selectedTestCases.length === filteredTestCases.length && filteredTestCases.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <label htmlFor="select-all" className="text-sm font-medium">
                      Select All ({filteredTestCases.length} tests)
                    </label>
                  </div>

                  <div className="space-y-2">
                    {filteredTestCases.map((testCase) => (
                      <div key={testCase.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={testCase.id}
                          checked={selectedTestCases.includes(testCase.id)}
                          onCheckedChange={(checked) => handleSelectTestCase(testCase.id, checked as boolean)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{testCase.name}</h3>
                            <div className="flex items-center space-x-2">
                              {getPriorityBadge(testCase.priority)}
                              {getStatusBadge(testCase.status)}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{testCase.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>{testCase.website}</span>
                            <div className="flex space-x-1">
                              {testCase.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      onClick={handleRunTests}
                      disabled={selectedTestCases.length === 0 || isRunning}
                      className="flex items-center"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {isRunning ? 'Running Tests...' : `Run ${selectedTestCases.length} Tests`}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test-cases">
            <Card>
              <CardHeader>
                <CardTitle>Available Test Cases</CardTitle>
                <CardDescription>Manage your test case library</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTestCases.map((testCase) => (
                    <div key={testCase.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-medium">{testCase.name}</h3>
                          <p className="text-sm text-gray-600">{testCase.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>{testCase.website}</span>
                            <div className="flex space-x-1">
                              {testCase.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getPriorityBadge(testCase.priority)}
                        {getStatusBadge(testCase.status)}
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Test Run History</CardTitle>
                <CardDescription>Previous test execution results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testRuns.map((run) => (
                    <div key={run.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(run.status)}
                        <div>
                          <p className="font-medium">{run.testCase}</p>
                          <p className="text-sm text-gray-600">{run.website}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {run.duration > 0 ? `${run.duration}ms` : 'Running...'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(run.createdAt).toLocaleString()}
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
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
