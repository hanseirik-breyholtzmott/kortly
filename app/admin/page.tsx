"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Users, CreditCard, TrendingUp, Eye, ArrowLeft } from "lucide-react"
import Link from "next/link"

// Mock analytics data
const userGrowthData = [
  { month: "Jan", users: 45, newUsers: 12 },
  { month: "Feb", users: 78, newUsers: 33 },
  { month: "Mar", users: 125, newUsers: 47 },
  { month: "Apr", users: 189, newUsers: 64 },
  { month: "May", users: 267, newUsers: 78 },
  { month: "Jun", users: 342, newUsers: 75 },
]

const cardUploadData = [
  { month: "Jan", cards: 234, uploads: 89 },
  { month: "Feb", cards: 456, uploads: 222 },
  { month: "Mar", cards: 789, uploads: 333 },
  { month: "Apr", cards: 1234, uploads: 445 },
  { month: "May", cards: 1678, uploads: 444 },
  { month: "Jun", cards: 2145, uploads: 467 },
]

const visitorData = [
  { day: "Mon", visitors: 1234 },
  { day: "Tue", visitors: 1456 },
  { day: "Wed", visitors: 1789 },
  { day: "Thu", visitors: 2123 },
  { day: "Fri", visitors: 2456 },
  { day: "Sat", visitors: 2789 },
  { day: "Sun", visitors: 2234 },
]

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Pokemon Card Collection Analytics</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              Back to App
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+75</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
              <CreditCard className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,145</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+467</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28.1%</div>
              <p className="text-xs text-muted-foreground">User growth rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Visitors</CardTitle>
              <Eye className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,234</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12.5%</span> from yesterday
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>Monthly user registration and total users</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  users: {
                    label: "Total Users",
                    color: "hsl(var(--chart-1))",
                  },
                  newUsers: {
                    label: "New Users",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="var(--color-users)"
                      strokeWidth={2}
                      name="Total Users"
                    />
                    <Line
                      type="monotone"
                      dataKey="newUsers"
                      stroke="var(--color-newUsers)"
                      strokeWidth={2}
                      name="New Users"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Card Upload Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Card Upload Growth</CardTitle>
              <CardDescription>Monthly card uploads and total cards</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  cards: {
                    label: "Total Cards",
                    color: "hsl(var(--chart-3))",
                  },
                  uploads: {
                    label: "Monthly Uploads",
                    color: "hsl(var(--chart-4))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cardUploadData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="cards"
                      stroke="var(--color-cards)"
                      strokeWidth={2}
                      name="Total Cards"
                    />
                    <Line
                      type="monotone"
                      dataKey="uploads"
                      stroke="var(--color-uploads)"
                      strokeWidth={2}
                      name="Monthly Uploads"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Website Visitors Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Website Visitors</CardTitle>
            <CardDescription>Daily visitor count for the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                visitors: {
                  label: "Visitors",
                  color: "hsl(var(--chart-5))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={visitorData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="visitors" fill="var(--color-visitors)" name="Daily Visitors" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest user registrations and card uploads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm">
                    New user registered: <strong>TrainerRed</strong>
                  </span>
                </div>
                <Badge variant="secondary">2 min ago</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <span className="text-sm">
                    Card uploaded: <strong>Charizard Holo</strong> by AshKetchum
                  </span>
                </div>
                <Badge variant="secondary">5 min ago</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm">
                    New user registered: <strong>BrockRock</strong>
                  </span>
                </div>
                <Badge variant="secondary">12 min ago</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                  <span className="text-sm">
                    Card uploaded: <strong>Pikachu First Edition</strong> by MistyWater
                  </span>
                </div>
                <Badge variant="secondary">18 min ago</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
