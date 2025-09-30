'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Calendar, Plus, Clock, Play, Pause, Settings, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface Schedule {
  id: string
  name: string
  cron: string
  testCaseIds: string[]
  isActive: boolean
  lastRun?: string
  nextRun?: string
  timezone: string
  createdAt: string
}

interface TestCase {
  id: string
  name: string
  website: string
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: '1',
      name: 'Daily Login Tests',
      cron: '0 9 * * *',
      testCaseIds: ['1', '2'],
      isActive: true,
      lastRun: new Date().toISOString(),
      nextRun: new Date(Date.now() + 86400000).toISOString(),
      timezone: 'UTC',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Weekly Full Test Suite',
      cron: '0 2 * * 0',
      testCaseIds: ['1', '2', '3', '4'],
      isActive: false,
      lastRun: new Date(Date.now() - 7 * 86400000).toISOString(),
      nextRun: new Date(Date.now() + 6 * 86400000).toISOString(),
      timezone: 'UTC',
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString()
    }
  ])

  const [testCases] = useState<TestCase[]>([
    { id: '1', name: 'Login Flow Test', website: 'example.com' },
    { id: '2', name: 'Checkout Process', website: 'example.com' },
    { id: '3', name: 'User Registration', website: 'demo.app' },
    { id: '4', name: 'Password Reset', website: 'demo.app' }
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    cron: '0 9 * * *',
    testCaseIds: [] as string[],
    timezone: 'UTC'
  })

  const cronPresets = [
    { label: 'Every Hour', value: '0 * * * *' },
    { label: 'Every Day at 9 AM', value: '0 9 * * *' },
    { label: 'Every Week on Sunday', value: '0 2 * * 0' },
    { label: 'Every Month on 1st', value: '0 9 1 * *' },
    { label: 'Every 15 Minutes', value: '*/15 * * * *' },
    { label: 'Every 6 Hours', value: '0 */6 * * *' }
  ]

  const getCronDescription = (cron: string) => {
    const preset = cronPresets.find(p => p.value === cron)
    return preset ? preset.label : cron
  }

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault()
    const schedule: Schedule = {
      id: Date.now().toString(),
      name: newSchedule.name,
      cron: newSchedule.cron,
      testCaseIds: newSchedule.testCaseIds,
      isActive: true,
      timezone: newSchedule.timezone,
      createdAt: new Date().toISOString()
    }
    
    setSchedules([...schedules, schedule])
    setNewSchedule({ name: '', cron: '0 9 * * *', testCaseIds: [], timezone: 'UTC' })
    setShowAddForm(false)
  }

  const toggleSchedule = (id: string) => {
    setSchedules(schedules.map(s => 
      s.id === id ? { ...s, isActive: !s.isActive } : s
    ))
  }

  const runScheduleNow = (id: string) => {
    setSchedules(schedules.map(s => 
      s.id === id ? { ...s, lastRun: new Date().toISOString() } : s
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Test Schedules</h1>
              <p className="text-gray-600 mt-2">Automate your testing with scheduled test runs</p>
            </div>
            <Button onClick={() => setShowAddForm(true)} className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Create Schedule
            </Button>
          </div>
        </div>

        {/* Add Schedule Form */}
        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Schedule</CardTitle>
              <CardDescription>Set up automated test runs for your websites</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddSchedule} className="space-y-4">
                <div>
                  <Label htmlFor="name">Schedule Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Daily Login Tests"
                    value={newSchedule.name}
                    onChange={(e) => setNewSchedule({...newSchedule, name: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cron">Schedule Frequency</Label>
                    <Select 
                      value={newSchedule.cron} 
                      onValueChange={(value) => setNewSchedule({...newSchedule, cron: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {cronPresets.map((preset) => (
                          <SelectItem key={preset.value} value={preset.value}>
                            {preset.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      value={newSchedule.timezone} 
                      onValueChange={(value) => setNewSchedule({...newSchedule, timezone: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Select Test Cases</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {testCases.map((testCase) => (
                      <label key={testCase.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newSchedule.testCaseIds.includes(testCase.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewSchedule({
                                ...newSchedule,
                                testCaseIds: [...newSchedule.testCaseIds, testCase.id]
                              })
                            } else {
                              setNewSchedule({
                                ...newSchedule,
                                testCaseIds: newSchedule.testCaseIds.filter(id => id !== testCase.id)
                              })
                            }
                          }}
                        />
                        <span className="text-sm">{testCase.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={newSchedule.testCaseIds.length === 0}>
                    Create Schedule
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Schedules List */}
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <Card key={schedule.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">{schedule.name}</CardTitle>
                      <CardDescription>
                        {getCronDescription(schedule.cron)} • {schedule.timezone}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={schedule.isActive ? 'default' : 'secondary'}>
                      {schedule.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Switch
                      checked={schedule.isActive}
                      onCheckedChange={() => toggleSchedule(schedule.id)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Test Cases:</span>
                    <div className="mt-1">
                      {schedule.testCaseIds.map(id => {
                        const testCase = testCases.find(tc => tc.id === id)
                        return testCase ? (
                          <Badge key={id} variant="outline" className="mr-1 mb-1">
                            {testCase.name}
                          </Badge>
                        ) : null
                      })}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Run:</span>
                    <p className="font-medium">
                      {schedule.lastRun 
                        ? new Date(schedule.lastRun).toLocaleString()
                        : 'Never'
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Next Run:</span>
                    <p className="font-medium">
                      {schedule.nextRun 
                        ? new Date(schedule.nextRun).toLocaleString()
                        : 'Not scheduled'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <Button 
                    size="sm" 
                    onClick={() => runScheduleNow(schedule.id)}
                    disabled={!schedule.isActive}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Run Now
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {schedules.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No schedules yet</h3>
              <p className="text-gray-600 mb-4">Create your first schedule to automate testing</p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Schedule
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
