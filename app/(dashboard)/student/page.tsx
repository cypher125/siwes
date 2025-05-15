"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  PlusCircle,
  Bell,
  BarChart,
  Loader2,
  XCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { student, logbook } from "@/lib/api"
import { Badge } from "@/components/ui/badge"

export default function StudentDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [entries, setEntries] = useState([])
  const [stats, setStats] = useState({
    totalEntries: 0,
    approvedEntries: 0,
    pendingEntries: 0,
    rejectedEntries: 0,
    rating: "N/A"
  })
  const { toast } = useToast()

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true)
      try {
        // Fetch profile and logbook entries in parallel
        const [profileRes, entriesRes] = await Promise.all([
          student.getProfile(),
          logbook.getEntries()
        ])

        if (profileRes.data) {
          setProfile(profileRes.data)
        } else if (profileRes.error) {
          toast({
            variant: "destructive",
            title: "Failed to load profile",
            description: profileRes.error,
          })
        }

        if (entriesRes.data) {
          setEntries(entriesRes.data)
          
          // Calculate statistics
          const total = entriesRes.data.length
          const approved = entriesRes.data.filter(entry => entry.is_approved).length
          const pending = entriesRes.data.filter(entry => !entry.is_approved && !entry.feedback).length
          const rejected = entriesRes.data.filter(entry => !entry.is_approved && entry.feedback).length
          
          setStats({
            totalEntries: total,
            approvedEntries: approved,
            pendingEntries: pending,
            rejectedEntries: rejected,
            rating: profile?.rating ? `${profile.rating}/5` : "N/A"
          })
        } else if (entriesRes.error) {
          toast({
            variant: "destructive",
            title: "Failed to load logbook entries",
            description: entriesRes.error,
          })
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch dashboard data. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast, profile?.rating])

  // Filter recent entries and feedback
  const recentEntries = entries.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 5)
  
  const recentFeedback = entries
    .filter(entry => entry.feedback)
    .sort((a, b) => new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime())
    .slice(0, 2)
    .map(entry => ({
      comment: entry.feedback,
      date: new Date(entry.last_updated).toLocaleDateString(),
      entryTitle: entry.title
    }))

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[#004C54]" />
          <p className="text-muted-foreground">Loading dashboard information...</p>
        </div>
      </div>
    )
  }

  // Calculate progress percentage
  const targetEntries = 40 // Total expected entries
  const progressPercentage = Math.min(100, Math.round((stats.totalEntries / targetEntries) * 100))
  
  // Format dates for display
  const formatDate = (dateString) => {
    if (!dateString) return "Not set"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  const startDate = formatDate(profile?.it_start_date)
  const endDate = formatDate(profile?.it_end_date)

  // Get user initials for avatar
  const getInitials = () => {
    if (!profile?.user) return "ST"
    return `${profile.user.first_name[0]}${profile.user.last_name[0]}`
  }

  return (
    <div className="flex-1">
      {/* Hero section with student info and progress */}
      <section className="bg-gradient-to-r from-[#004C54] to-[#004C54]/90 text-white">
        <div className="container py-8 md:py-12">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-center">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-white">
                <AvatarImage src="/placeholder.svg?height=64&width=64" alt="@student" />
                <AvatarFallback className="bg-[#FFC300] text-[#004C54] text-xl">{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">Welcome, {profile?.user ? `${profile.user.first_name} ${profile.user.last_name}` : 'Student'}</h1>
                <p className="text-white/80">{profile?.department?.name || 'Department'} • {profile?.matric_number || 'ID'}</p>
                <p className="text-white/80">{profile?.company?.name || 'Company not set'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm font-medium">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2 bg-white/20" indicatorClassName="bg-[#FFC300]" />
              <div className="flex justify-between text-xs text-white/80">
                <span>Started: {startDate}</span>
                <span>Ends: {endDate}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-end">
              <Button asChild variant="secondary" className="bg-white text-[#004C54] hover:bg-white/90">
                <Link href="/student/logbook/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Logbook Entry
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-transparent text-white border-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/student/logbook">
                  <FileText className="mr-2 h-4 w-4" />
                  View Logbook
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="container py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              <TabsTrigger value="feedback">Supervisor Feedback</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FFC300] text-[0.6rem] text-black font-medium">
                  {stats.pendingEntries}
                </span>
              </Button>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats row */}
            <div className="grid gap-4 md:grid-cols-4">
              <StatsCard
                title="Logbook Entries"
                value={`${stats.totalEntries}/${targetEntries}`}
                description={`${progressPercentage}% Complete`}
                icon={FileText}
                iconColor="text-blue-500"
                bgColor="bg-blue-50"
              />
              <StatsCard
                title="Approved Entries"
                value={stats.approvedEntries.toString()}
                description={stats.totalEntries ? `${Math.round((stats.approvedEntries / stats.totalEntries) * 100)}% Approval Rate` : "No entries yet"}
                icon={CheckCircle2}
                iconColor="text-green-500"
                bgColor="bg-green-50"
              />
              <StatsCard
                title="Pending Reviews"
                value={stats.pendingEntries.toString()}
                description="Awaiting Supervisor"
                icon={Clock}
                iconColor="text-amber-500"
                bgColor="bg-amber-50"
              />
              <StatsCard
                title="Supervisor Rating"
                value={stats.rating}
                description={stats.rating !== "N/A" ? "Supervisor Rating" : "Not rated yet"}
                icon={BarChart}
                iconColor="text-purple-500"
                bgColor="bg-purple-50"
              />
            </div>

            {/* Two column layout */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Upcoming deadlines - kept hardcoded for now as these appear to be system deadlines */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-medium">Upcoming Deadlines</CardTitle>
                  <CardDescription>Important dates to remember</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { title: "Weekly Report Submission", date: "Friday, March 29, 2025", daysLeft: 3 },
                      { title: "Mid-Term Evaluation", date: "Monday, April 15, 2025", daysLeft: 20 },
                      { title: "Final Report Draft", date: "Friday, May 30, 2025", daysLeft: 65 },
                    ].map((deadline, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`rounded-full p-2 ${
                              deadline.daysLeft <= 3
                                ? "bg-red-100"
                                : deadline.daysLeft <= 7
                                  ? "bg-amber-100"
                                  : "bg-green-100"
                            }`}
                          >
                            <Calendar
                              className={`h-4 w-4 ${
                                deadline.daysLeft <= 3
                                  ? "text-red-600"
                                  : deadline.daysLeft <= 7
                                    ? "text-amber-600"
                                    : "text-green-600"
                              }`}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{deadline.title}</p>
                            <p className="text-xs text-muted-foreground">{deadline.date}</p>
                          </div>
                        </div>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            deadline.daysLeft <= 3
                              ? "bg-red-100 text-red-800"
                              : deadline.daysLeft <= 7
                                ? "bg-amber-100 text-amber-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {deadline.daysLeft} days left
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/student/calendar">
                      <Calendar className="mr-2 h-4 w-4" />
                      View Calendar
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Supervisor feedback */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-medium">Supervisor Feedback</CardTitle>
                  <CardDescription>Latest comments from your supervisor</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentFeedback.length > 0 ? (
                      recentFeedback.map((feedback, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex items-start space-x-3">
                            <MessageSquare className="mt-0.5 h-4 w-4 text-[#004C54]" />
                            <div>
                              <p className="text-sm font-medium mb-1">{feedback.entryTitle}</p>
                              <p className="text-sm">{feedback.comment}</p>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground pl-7">{feedback.date}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        <p>No feedback yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/student/logbook">
                      <BookOpen className="mr-2 h-4 w-4" />
                      View All Feedback
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest logbook entries and actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {recentEntries.length > 0 ? (
                    recentEntries.map((entry, index) => (
                      <div key={index} className="relative pl-6 pb-8 last:pb-0">
                        <div className="absolute left-0 top-0 bottom-0 w-px bg-border">
                          <div className="absolute top-0 left-0 w-5 h-5 -ml-2 rounded-full bg-background flex items-center justify-center border">
                            {entry.is_approved ? (
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                            ) : entry.feedback ? (
                              <XCircle className="h-3 w-3 text-red-500" />
                            ) : (
                              <Clock className="h-3 w-3 text-amber-500" />
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium">{entry.title}</p>
                            <Badge 
                              variant="outline" 
                              className={entry.is_approved ? "bg-green-100 text-green-800" : 
                                        entry.feedback ? "bg-red-100 text-red-800" : 
                                        "bg-amber-100 text-amber-800"}
                            >
                              {entry.is_approved ? "Approved" : entry.feedback ? "Needs Revision" : "Pending"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {new Date(entry.date).toLocaleDateString()} • {entry.hours} hours
                          </p>
                          <p className="text-sm line-clamp-2 mb-2">{entry.activities}</p>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/student/logbook?entry=${entry.id}`}>View Details</Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-20" />
                      <h3 className="font-medium text-lg">No Entries Found</h3>
                      <p className="text-muted-foreground mb-4">
                        Start by creating your first logbook entry
                      </p>
                      <Button asChild className="bg-[#004C54] hover:bg-[#004C54]/90">
                        <Link href="/student/logbook/new">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          New Entry
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Supervisor Feedback</CardTitle>
                <CardDescription>All feedback from your supervisor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {entries.filter(entry => entry.feedback).length > 0 ? (
                    entries
                      .filter(entry => entry.feedback)
                      .sort((a, b) => new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime())
                      .map((entry, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{entry.title}</h3>
                            <span className="text-xs text-muted-foreground">
                              {new Date(entry.last_updated).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm mb-3">{entry.feedback}</p>
                          <div className="flex justify-end">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/student/logbook?entry=${entry.id}`}>View Entry</Link>
                            </Button>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-10">
                      <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-20" />
                      <h3 className="font-medium text-lg">No Feedback Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Your supervisor hasn't provided any feedback yet
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: string
  description: string
  icon: React.ElementType
  iconColor: string
  bgColor: string
}

function StatsCard({ title, value, description, icon: Icon, iconColor, bgColor }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className={`rounded-full p-2 ${bgColor}`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}

