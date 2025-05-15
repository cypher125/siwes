"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { BarChart, Calendar, CheckCircle2, Clock, FileText, Bell, Users, ClipboardList, Filter, Loader2 } from "lucide-react"
import { supervisor } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function SupervisorDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [pendingEntries, setPendingEntries] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingReviews: 0,
    approvedEntries: 0,
    averageRating: "N/A"
  })
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [topStudents, setTopStudents] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true)
      try {
        // Fetch profile, assigned students, pending entries, and dashboard stats in parallel
        const [profileRes, studentsRes, pendingRes, statsRes] = await Promise.all([
          supervisor.getProfile(),
          supervisor.getAssignedStudents(),
          supervisor.getPendingEntries(),
          supervisor.getDashboardStats()
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

        if (studentsRes.data) {
          setStudents(studentsRes.data)
        } else if (studentsRes.error) {
          toast({
            variant: "destructive",
            title: "Failed to load students",
            description: studentsRes.error,
          })
        }

        if (pendingRes.data) {
          setPendingEntries(pendingRes.data.slice(0, 4)) // Show only first 4 entries
        } else if (pendingRes.error) {
          toast({
            variant: "destructive",
            title: "Failed to load pending entries",
            description: pendingRes.error,
          })
        }

        if (statsRes.data) {
          setStats({
            totalStudents: statsRes.data.total_students || 0,
            pendingReviews: statsRes.data.pending_reviews || 0,
            approvedEntries: statsRes.data.approved_entries || 0,
            averageRating: statsRes.data.average_rating ? `${statsRes.data.average_rating}/5` : "N/A"
          })
          
          if (statsRes.data.recent_activities) {
            setRecentActivities(statsRes.data.recent_activities)
          }
          
          if (statsRes.data.top_students) {
            setTopStudents(statsRes.data.top_students.slice(0, 3))
          }
        } else if (statsRes.error) {
          toast({
            variant: "destructive",
            title: "Failed to load statistics",
            description: statsRes.error,
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
  }, [toast])

  // Calculate progress percentage for students
  const totalStudentCapacity = 25 // Maximum number of students a supervisor can have
  const progressPercentage = Math.min(100, Math.round((stats.totalStudents / totalStudentCapacity) * 100))
  
  // Helper function to get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

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

  return (
    <div className="flex-1">
      {/* Hero section with supervisor info */}
      <section className="bg-gradient-to-r from-[#004C54] to-[#004C54]/90 text-white">
        <div className="container py-8 md:py-12">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-center">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-white">
                <AvatarImage src={profile?.profile_picture || "/placeholder.svg?height=64&width=64"} alt="@supervisor" />
                <AvatarFallback className="bg-[#FFC300] text-[#004C54] text-xl">
                  {profile ? getInitials(`${profile.user.first_name} ${profile.user.last_name}`) : "SV"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">
                  Welcome, {profile ? `${profile.user.first_name} ${profile.user.last_name}` : 'Supervisor'}
                </h1>
                <p className="text-white/80">{profile?.department?.name || 'Department'}</p>
                <p className="text-white/80">Staff ID: {profile?.staff_id || 'Not set'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Students Supervised</span>
                <span className="text-sm font-medium">{stats.totalStudents}/{totalStudentCapacity}</span>
              </div>
              <Progress 
                value={progressPercentage} 
                className="h-2 w-full overflow-hidden rounded-full bg-white/20" 
              />
              <style jsx global>{`
                .h-2.bg-white\/20 .bg-primary {
                  background-color: #FFC300;
                }
              `}</style>
              <div className="flex justify-between text-xs text-white/80">
                <span>Pending Reviews: {stats.pendingReviews}</span>
                <span>Completed: {stats.approvedEntries}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-end">
              <Button asChild variant="secondary" className="bg-white text-[#004C54] hover:bg-white/90">
                <Link href="/supervisor/evaluations">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Review Entries
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-transparent text-white border-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/supervisor/students">
                  <Users className="mr-2 h-4 w-4" />
                  View Students
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
              <TabsTrigger value="pending">Pending Reviews</TabsTrigger>
              <TabsTrigger value="students">Student Performance</TabsTrigger>
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
                  {stats.pendingReviews}
                </span>
              </Button>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats row */}
            <div className="grid gap-4 md:grid-cols-4">
              <StatsCard
                title="Assigned Students"
                value={stats.totalStudents.toString()}
                description="Active SIWES students"
                icon={Users}
                iconColor="text-blue-500"
                bgColor="bg-blue-50"
              />
              <StatsCard
                title="Pending Reviews"
                value={stats.pendingReviews.toString()}
                description="Entries awaiting review"
                icon={Clock}
                iconColor="text-amber-500"
                bgColor="bg-amber-50"
              />
              <StatsCard
                title="Approved Entries"
                value={stats.approvedEntries.toString()}
                description="Total approved entries"
                icon={CheckCircle2}
                iconColor="text-green-500"
                bgColor="bg-green-50"
              />
              <StatsCard
                title="Average Rating"
                value={stats.averageRating}
                description="Student performance"
                icon={BarChart}
                iconColor="text-purple-500"
                bgColor="bg-purple-50"
              />
            </div>

            {/* Two column layout */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Pending reviews */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium">Pending Reviews</CardTitle>
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                      {stats.pendingReviews} Pending
                    </Badge>
                  </div>
                  <CardDescription>Logbook entries awaiting your review</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingEntries.length > 0 ? (
                      pendingEntries.map((entry, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="rounded-full p-2 bg-primary/10">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{entry.title}</p>
                            <p className="text-xs text-muted-foreground">
                                {entry.student.user.first_name} {entry.student.user.last_name} · 
                                {new Date(entry.date).toLocaleDateString()}
                            </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/supervisor/evaluations/${entry.id}/review`}>
                              Review
                            </Link>
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        No pending entries to review.
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full bg-[#004C54] hover:bg-[#004C54]/90">
                    <Link href="/supervisor/evaluations">View All Pending Reviews</Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Student performance */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-medium">Top Performing Students</CardTitle>
                  <CardDescription>Based on logbook quality and consistency</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topStudents.length > 0 ? (
                      topStudents.map((student, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {getInitials(`${student.user.first_name} ${student.user.last_name}`)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                              <p className="text-sm font-medium">{student.user.first_name} {student.user.last_name}</p>
                              <p className="text-xs text-muted-foreground">{student.entries_count || 0} entries</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {student.rating || "N/A"}/5
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        No student performance data available.
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/supervisor/students">
                      <Users className="mr-2 h-4 w-4" />
                      View All Students
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Recent activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest reviews and evaluations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, i) => (
                      <div key={i} className="relative pl-6 pb-8 last:pb-0">
                        <div className="absolute left-0 top-0 h-full w-[2px] bg-border">
                          <div className="absolute top-0 left-[-4px] h-2 w-2 rounded-full bg-primary"></div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.student} · {new Date(activity.date).toLocaleDateString()}
                          </p>
                          {activity.feedback && (
                            <p className="text-sm mt-2 p-2 bg-muted rounded-md">"{activity.feedback}"</p>
                          )}
                          <div className="pt-2">
                            <Badge variant="outline" className={activity.is_approved ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}>
                              {activity.is_approved ? "Approved" : "Requested Revisions"}
                            </Badge>
                        </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No recent activity to display.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <h2 className="text-2xl font-bold">Pending Reviews</h2>
            {pendingEntries.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {pendingEntries.map((entry, i) => (
                  <Card key={i}>
              <CardHeader>
                      <CardTitle>{entry.title}</CardTitle>
                      <CardDescription>{new Date(entry.date).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                      <div className="flex items-center mb-4 gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(`${entry.student.user.first_name} ${entry.student.user.last_name}`)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                          <p className="text-sm font-medium">{entry.student.user.first_name} {entry.student.user.last_name}</p>
                          <p className="text-xs text-muted-foreground">{entry.student.matric_number}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">{entry.activities}</p>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full bg-[#004C54] hover:bg-[#004C54]/90">
                        <Link href={`/supervisor/evaluations/${entry.id}/review`}>Review Entry</Link>
                      </Button>
                    </CardFooter>
                    </Card>
                  ))}
                </div>
            ) : (
              <div className="text-center py-12 bg-muted/20 rounded-lg">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <h3 className="text-lg font-medium">No Pending Reviews</h3>
                <p className="text-muted-foreground">All student entries have been reviewed.</p>
                </div>
            )}
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <h2 className="text-2xl font-bold">Student Performance</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {students.length > 0 ? (
                students.map((student, i) => (
                  <Card key={i}>
              <CardHeader>
                      <CardTitle>{student.user.first_name} {student.user.last_name}</CardTitle>
                      <CardDescription>{student.matric_number}</CardDescription>
              </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                          <p className="text-muted-foreground">Department</p>
                          <p className="font-medium">{student.department?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Entries</p>
                          <p className="font-medium">{student.entries_count || 0}</p>
                        </div>
                          </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm">Progress</p>
                          <p className="text-sm">{student.progress || 0}%</p>
                        </div>
                        <Progress value={student.progress || 0} className="h-2" />
                </div>
              </CardContent>
              <CardFooter>
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/supervisor/students/${student.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
                ))
              ) : (
                <div className="col-span-3 text-center py-12 bg-muted/20 rounded-lg">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <h3 className="text-lg font-medium">No Students Assigned</h3>
                  <p className="text-muted-foreground">You don't have any students assigned to you yet.</p>
                </div>
              )}
            </div>
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
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className={`p-2 rounded-full ${bgColor}`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

