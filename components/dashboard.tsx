"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import CardUpload from "@/components/card-upload"
import Collection from "@/components/collection"
import Leaderboard from "@/components/leaderboard"
import ProgressTracker from "@/components/progress-tracker"
import { LogOut, Trophy, Upload, Grid3X3, Target, Share2, Copy, Check } from "lucide-react"
import { useState } from "react"

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [copied, setCopied] = useState(false)

  if (!user) return null

  const profileUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/profile/${user.username}`

  const copyProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur border-b border-blue-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-blue-900">PokéCard Collector</h1>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {user.cardsCount} cards
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-blue-700 font-medium">Welcome, {user.username}!</span>
              <Button variant="outline" size="sm" onClick={logout} className="gap-2 bg-transparent">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Your Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-blue-100">
              Show off your Pokemon card collection! Share your public profile with friends and fellow trainers.
            </p>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg p-3">
              <code className="flex-1 text-sm font-mono text-blue-100 truncate">{profileUrl}</code>
              <Button
                variant="secondary"
                size="sm"
                onClick={copyProfileLink}
                className="gap-2 bg-white/20 hover:bg-white/30 text-white border-white/20"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/50">
            <TabsTrigger value="progress" className="gap-2">
              <Target className="h-4 w-4" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="collection" className="gap-2">
              <Grid3X3 className="h-4 w-4" />
              Collection
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Cards
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2">
              <Trophy className="h-4 w-4" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progress">
            <ProgressTracker />
          </TabsContent>

          <TabsContent value="collection">
            <Collection />
          </TabsContent>

          <TabsContent value="upload">
            <CardUpload />
          </TabsContent>

          <TabsContent value="leaderboard">
            <Leaderboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
