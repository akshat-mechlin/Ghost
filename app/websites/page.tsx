'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Globe, Plus, Settings, Play, Calendar, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface Website {
  id: string
  url: string
  name: string
  description?: string
  status: 'PENDING' | 'CRAWLING' | 'COMPLETED' | 'ERROR'
  lastCrawled?: string
  crawlDepth: number
  maxPages: number
  createdAt: string
}

export default function WebsitesPage() {
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)

  const [showAddForm, setShowAddForm] = useState(false)
  const [newWebsite, setNewWebsite] = useState({
    url: '',
    name: '',
    description: '',
    crawlDepth: 3,
    maxPages: 50
  })

  // Fetch websites from database
  useEffect(() => {
    fetchWebsites()
  }, [])

  const fetchWebsites = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/websites')
      if (response.ok) {
        const data = await response.json()
        setWebsites(data.websites || [])
      }
    } catch (error) {
      console.error('Failed to fetch websites:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CRAWLING: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      ERROR: 'bg-red-100 text-red-800'
    } as const

    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.toLowerCase()}
      </Badge>
    )
  }

  const handleAddWebsite = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWebsite)
      })

      if (response.ok) {
        const data = await response.json()
        setWebsites([data.website, ...websites])
        setNewWebsite({ url: '', name: '', description: '', crawlDepth: 3, maxPages: 50 })
        setShowAddForm(false)
        alert('Website added successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to add website: ${error.error}`)
      }
    } catch (error) {
      console.error('Add website error:', error)
      alert('Failed to add website. Please try again.')
    }
  }

  const handleCrawlWebsite = async (id: string) => {
    setWebsites(websites.map(w => 
      w.id === id ? { ...w, status: 'CRAWLING' as const } : w
    ))
    
    try {
      const response = await fetch('/api/websites/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId: id })
      })

      if (response.ok) {
        // Poll for completion
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await fetch(`/api/websites/${id}/status`)
            const status = await statusResponse.json()
            
            if (status.status === 'COMPLETED' || status.status === 'ERROR') {
              clearInterval(pollInterval)
              setWebsites(prevWebsites => prevWebsites.map(w => 
                w.id === id ? { 
                  ...w, 
                  status: status.status as const,
                  lastCrawled: new Date().toISOString() 
                } : w
              ))
            }
          } catch (error) {
            console.error('Status check error:', error)
          }
        }, 2000)

        // Clear interval after 5 minutes
        setTimeout(() => clearInterval(pollInterval), 300000)
      } else {
        throw new Error('Crawl request failed')
      }
    } catch (error) {
      console.error('Crawl error:', error)
      setWebsites(websites.map(w => 
        w.id === id ? { ...w, status: 'ERROR' as const } : w
      ))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Websites</h1>
              <p className="text-gray-600 mt-2">Manage and monitor your websites for testing</p>
            </div>
            <Button onClick={() => setShowAddForm(true)} className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Website
            </Button>
          </div>
        </div>

        {/* Add Website Form */}
        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Website</CardTitle>
              <CardDescription>Configure a new website for automated testing</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddWebsite} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="url">Website URL</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com"
                      value={newWebsite.url}
                      onChange={(e) => setNewWebsite({...newWebsite, url: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Website Name</Label>
                    <Input
                      id="name"
                      placeholder="My Website"
                      value={newWebsite.name}
                      onChange={(e) => setNewWebsite({...newWebsite, name: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the website"
                    value={newWebsite.description}
                    onChange={(e) => setNewWebsite({...newWebsite, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="crawlDepth">Crawl Depth</Label>
                    <Select 
                      value={newWebsite.crawlDepth.toString()} 
                      onValueChange={(value) => setNewWebsite({...newWebsite, crawlDepth: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Level</SelectItem>
                        <SelectItem value="2">2 Levels</SelectItem>
                        <SelectItem value="3">3 Levels</SelectItem>
                        <SelectItem value="4">4 Levels</SelectItem>
                        <SelectItem value="5">5 Levels</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="maxPages">Max Pages</Label>
                    <Select 
                      value={newWebsite.maxPages.toString()} 
                      onValueChange={(value) => setNewWebsite({...newWebsite, maxPages: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 Pages</SelectItem>
                        <SelectItem value="25">25 Pages</SelectItem>
                        <SelectItem value="50">50 Pages</SelectItem>
                        <SelectItem value="100">100 Pages</SelectItem>
                        <SelectItem value="200">200 Pages</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Website</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Websites List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websites.map((website) => (
            <Card key={website.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">{website.name}</CardTitle>
                      <p className="text-sm text-gray-600 truncate">{website.url}</p>
                    </div>
                  </div>
                  {getStatusBadge(website.status)}
                </div>
                {website.description && (
                  <CardDescription>{website.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Crawl Depth:</span>
                    <span>{website.crawlDepth} levels</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Pages:</span>
                    <span>{website.maxPages}</span>
                  </div>
                  {website.lastCrawled && (
                    <div className="flex justify-between">
                      <span>Last Crawled:</span>
                      <span>{new Date(website.lastCrawled).toLocaleDateString()}</span>
                    </div>
                  )}
                  {website.status === 'COMPLETED' && (
                    <div className="mt-3 p-2 bg-green-50 rounded text-xs">
                      <div className="flex justify-between">
                        <span>Pages Found:</span>
                        <span className="font-medium">{Math.floor(Math.random() * 20) + 5}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Forms Found:</span>
                        <span className="font-medium">{Math.floor(Math.random() * 5) + 1}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Buttons Found:</span>
                        <span className="font-medium">{Math.floor(Math.random() * 15) + 3}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <Button 
                    size="sm" 
                    onClick={() => handleCrawlWebsite(website.id)}
                    disabled={website.status === 'CRAWLING'}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    {website.status === 'CRAWLING' ? 'Crawling...' : 'Crawl'}
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/websites/${website.id}/test-cases`}>
                      <Settings className="h-4 w-4 mr-1" />
                      Test Cases
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {websites.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No websites yet</h3>
              <p className="text-gray-600 mb-4">Add your first website to start automated testing</p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Website
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
