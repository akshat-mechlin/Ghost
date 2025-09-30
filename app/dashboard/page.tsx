'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Globe, TestTube, Bug, Calendar, TrendingUp, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Circle as XCircle, Clock, Plus } from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  websites: number
  testCases: number
  testRuns: number
  bugs: number
  passRate: number
  recentRuns: Array<{
    id: string
    testCase: string
    status: string
    duration: number
    createdAt: string
  }>
  recentBugs: Array<{
    id: string
    title: string
    severity: string
    status: string
    createdAt: string
  }>
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      // For demo purposes, use mock data immediately
      setStats({
        websites: 3,
        testCases: 12,
        testRuns: 45,
        bugs: 2,
        passRate: 87,
        recentRuns: [
          {
            id: '1',
            testCase: 'Login Flow Test',
            status: 'COMPLETED',
            duration: 2500,
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            testCase: 'Checkout Process',
            status: 'FAILED',
            duration: 1800,
            createdAt: new Date(Date.now() - 3600000).toISOString()
          }
        ],
        recentBugs: [
          {
            id: '1',
            title: 'Login button not responding',
            severity: 'HIGH',
            status: 'OPEN',
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Payment form validation error',
            severity: 'MEDIUM',
            status: 'IN_PROGRESS',
            createdAt: new Date(Date.now() - 7200000).toISOString()
          }
        ]
      })
      setLoading(false)
    }

    // Always fetch stats, even without session (for demo purposes)
    fetchStats()
  }, [session])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to GhostQA</h1>
          <p className="text-gray-600 mb-6">Loading your dashboard...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      COMPLETED: 'default',
      FAILED: 'destructive',
      RUNNING: 'secondary',
      PENDING: 'outline'
    } as const

    const colors = {
      COMPLETED: 'text-green-600',
      FAILED: 'text-red-600',
      RUNNING: 'text-blue-600',
      PENDING: 'text-gray-600'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.toLowerCase()}
      </Badge>
    )
  }

  const getSeverityBadge = (severity: string) => {
    const colors = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      CRITICAL: 'bg-red-100 text-red-800'
    } as const

    return (
      <Badge className={colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {severity.toLowerCase()}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session?.user?.name || 'User'}
          </h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your testing today</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Websites</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.websites}</div>
              <p className="text-xs text-muted-foreground">
                Active websites
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Test Cases</CardTitle>
              <TestTube className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.testCases}</div>
              <p className="text-xs text-muted-foreground">
                Total test cases
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Test Runs</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.testRuns}</div>
              <p className="text-xs text-muted-foreground">
                Total executions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bugs Found</CardTitle>
              <Bug className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bugs}</div>
              <p className="text-xs text-muted-foreground">
                Issues discovered
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pass Rate Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Test Pass Rate</CardTitle>
            <CardDescription>Overall success rate of your test executions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Progress value={stats.passRate} className="flex-1" />
              <span className="text-2xl font-bold">
                {stats.passRate}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Tabs defaultValue="runs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="runs">Recent Test Runs</TabsTrigger>
            <TabsTrigger value="bugs">Recent Bugs</TabsTrigger>
          </TabsList>

          <TabsContent value="runs" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Test Runs</CardTitle>
                  <CardDescription>
                    Latest test execution results
                  </CardDescription>
                </div>
                <Button asChild>
                  <Link href="/test-runs">
                    <Plus className="h-4 w-4 mr-2" />
                    Run Tests
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentRuns.map((run) => (
                    <div key={run.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {run.status === 'COMPLETED' && <CheckCircle className="h-5 w-5 text-green-500" />}
                          {run.status === 'FAILED' && <XCircle className="h-5 w-5 text-red-500" />}
                          {run.status === 'RUNNING' && <Clock className="h-5 w-5 text-blue-500 animate-spin" />}
                          {run.status === 'PENDING' && <Clock className="h-5 w-5 text-gray-500" />}
                        </div>
                        <div>
                          <p className="font-medium">{run.testCase}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(run.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">
                          {run.duration}ms
                        </span>
                        {getStatusBadge(run.status)}
                      </div>
                    </div>
                  ))}

                  {stats.recentRuns.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No test runs yet</p>
                      <p className="text-sm">Start by adding a website and running some tests</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bugs" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Bugs</CardTitle>
                  <CardDescription>
                    Latest issues discovered during testing
                  </CardDescription>
                </div>
                <Button asChild>
                  <Link href="/bugs">
                    <Bug className="h-4 w-4 mr-2" />
                    View All Bugs
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentBugs.map((bug) => (
                    <div key={bug.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="font-medium">{bug.title}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(bug.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getSeverityBadge(bug.severity)}
                        <Badge variant="outline">{bug.status.toLowerCase()}</Badge>
                      </div>
                    </div>
                  ))}

                  {stats.recentBugs.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Bug className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No bugs reported yet</p>
                      <p className="text-sm">Great! Your tests haven't found any issues</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Add Website
              </CardTitle>
              <CardDescription>
                Start testing a new website with AI-generated test cases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/websites">Add Website</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Schedule Tests
              </CardTitle>
              <CardDescription>
                Automate your testing with scheduled test runs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/schedules">Set Schedule</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TestTube className="h-5 w-5 mr-2" />
                Run Tests
              </CardTitle>
              <CardDescription>
                Execute test cases and monitor results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/test-runs">Run Tests</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                View Reports
              </CardTitle>
              <CardDescription>
                Analyze test results and performance trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/reports">View Reports</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}