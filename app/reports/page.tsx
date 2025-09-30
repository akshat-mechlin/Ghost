'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, BarChart3, Download, Filter, Calendar, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react'

interface TestRun {
  id: string
  testCase: string
  status: 'COMPLETED' | 'FAILED' | 'RUNNING' | 'PENDING'
  duration: number
  createdAt: string
  website: string
}

interface Bug {
  id: string
  title: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  createdAt: string
  website: string
}

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedWebsite, setSelectedWebsite] = useState('all')

  const websites = ['all', 'example.com', 'demo.app', 'test-site.com']
  
  const testRuns: TestRun[] = [
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
    },
    {
      id: '4',
      testCase: 'Password Reset',
      status: 'RUNNING',
      duration: 0,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      website: 'demo.app'
    }
  ]

  const bugs: Bug[] = [
    {
      id: '1',
      title: 'Login button not responding',
      severity: 'HIGH',
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      website: 'example.com'
    },
    {
      id: '2',
      title: 'Payment form validation error',
      severity: 'MEDIUM',
      status: 'IN_PROGRESS',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      website: 'example.com'
    },
    {
      id: '3',
      title: 'Mobile responsive issue',
      severity: 'LOW',
      status: 'RESOLVED',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      website: 'demo.app'
    }
  ]

  const getStatusBadge = (status: string) => {
    const variants = {
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      RUNNING: 'bg-blue-100 text-blue-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      OPEN: 'bg-red-100 text-red-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      RESOLVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800'
    } as const

    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.toLowerCase().replace('_', ' ')}
      </Badge>
    )
  }

  const getSeverityBadge = (severity: string) => {
    const variants = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      CRITICAL: 'bg-red-100 text-red-800'
    } as const

    return (
      <Badge className={variants[severity as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {severity.toLowerCase()}
      </Badge>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'RESOLVED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'FAILED':
      case 'OPEN':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'RUNNING':
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const filteredTestRuns = testRuns.filter(run => 
    selectedWebsite === 'all' || run.website === selectedWebsite
  )

  const filteredBugs = bugs.filter(bug => 
    selectedWebsite === 'all' || bug.website === selectedWebsite
  )

  const stats = {
    totalRuns: filteredTestRuns.length,
    passedRuns: filteredTestRuns.filter(run => run.status === 'COMPLETED').length,
    failedRuns: filteredTestRuns.filter(run => run.status === 'FAILED').length,
    passRate: filteredTestRuns.length > 0 
      ? Math.round((filteredTestRuns.filter(run => run.status === 'COMPLETED').length / filteredTestRuns.length) * 100)
      : 0,
    totalBugs: filteredBugs.length,
    openBugs: filteredBugs.filter(bug => bug.status === 'OPEN').length,
    avgDuration: filteredTestRuns.length > 0
      ? Math.round(filteredTestRuns.reduce((sum, run) => sum + run.duration, 0) / filteredTestRuns.length)
      : 0
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600 mt-2">Analyze test results and performance trends</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">Last 24 hours</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
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
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Test Runs</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRuns}</div>
              <p className="text-xs text-muted-foreground">
                {stats.passedRuns} passed, {stats.failedRuns} failed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.passRate}%</div>
              <p className="text-xs text-muted-foreground">
                Success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Bugs</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.openBugs}</div>
              <p className="text-xs text-muted-foreground">
                Out of {stats.totalBugs} total bugs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgDuration}ms</div>
              <p className="text-xs text-muted-foreground">
                Average test duration
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="test-runs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="test-runs">Test Runs</TabsTrigger>
            <TabsTrigger value="bugs">Bugs</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="test-runs">
            <Card>
              <CardHeader>
                <CardTitle>Recent Test Runs</CardTitle>
                <CardDescription>Latest test execution results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTestRuns.map((run) => (
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
                        {getStatusBadge(run.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bugs">
            <Card>
              <CardHeader>
                <CardTitle>Bug Reports</CardTitle>
                <CardDescription>Issues found during testing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredBugs.map((bug) => (
                    <div key={bug.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <div>
                          <p className="font-medium">{bug.title}</p>
                          <p className="text-sm text-gray-600">{bug.website}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {new Date(bug.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          {getSeverityBadge(bug.severity)}
                          {getStatusBadge(bug.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Test performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Charts Coming Soon</h3>
                  <p className="text-gray-600">
                    Performance charts and trend analysis will be available in the next update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
