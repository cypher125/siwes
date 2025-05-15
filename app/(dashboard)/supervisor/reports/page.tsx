"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BarChart, Calendar, Download, LineChart, PieChart, Printer, Share2, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supervisor } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function ReportsPage() {
  const [periodFilter, setPeriodFilter] = useState("month")
  const [reportType, setReportType] = useState("summary")
  const [isLoading, setIsLoading] = useState(true)
  const [reportData, setReportData] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchReportData() {
      setIsLoading(true)
      try {
        const response = await supervisor.getReports(periodFilter)
        if (response.data) {
          setReportData(response.data)
        } else if (response.error) {
          toast({
            variant: "destructive",
            title: "Failed to load reports",
            description: response.error,
          })
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch report data. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchReportData()
  }, [periodFilter, toast])

  const handlePeriodChange = (value: string) => {
    setPeriodFilter(value)
  }

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[#004C54]" />
          <p className="text-muted-foreground">Loading reports data...</p>
        </div>
      </div>
    )
  }

  // Extract data from API response or use defaults
  const stats = reportData?.stats || {
    total_students: 0,
    total_entries: 0,
    approval_rate: 0,
    average_rating: "N/A"
  }
  
  const activities = reportData?.activities || []
  const studentsData = reportData?.students || []
  const entriesOverTime = reportData?.entries_over_time || []
  const entryStatusDistribution = reportData?.entry_status_distribution || {
    approved: 0,
    pending: 0,
    rejected: 0
  }

  // Calculate percentages for the pie chart
  const total = entryStatusDistribution.approved + entryStatusDistribution.pending + entryStatusDistribution.rejected
  const approvedPercentage = total > 0 ? Math.round((entryStatusDistribution.approved / total) * 100) : 0
  const pendingPercentage = total > 0 ? Math.round((entryStatusDistribution.pending / total) * 100) : 0
  const rejectedPercentage = total > 0 ? Math.round((entryStatusDistribution.rejected / total) * 100) : 0

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        {/* Header with title and actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Report filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Tabs value={reportType} onValueChange={setReportType} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="activities">Activities</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex justify-end">
            <Select value={periodFilter} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Select period" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Report content */}
        <Tabs value={reportType} className="space-y-6">
          <TabsContent value="summary" className="space-y-6">
            {/* Summary stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_students}</div>
                  <p className="text-xs text-muted-foreground">Assigned to you</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_entries}</div>
                  <p className="text-xs text-muted-foreground">Across all students</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.approval_rate}%</div>
                  <p className="text-xs text-muted-foreground">{entryStatusDistribution.approved} of {stats.total_entries} entries</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.average_rating}</div>
                  <p className="text-xs text-muted-foreground">Student performance</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Entries by Status</CardTitle>
                  <CardDescription>Distribution of logbook entry statuses</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <PieChart className="h-8 w-8 text-muted-foreground absolute" />
                    <div className="w-40 h-40 rounded-full border-8 border-[#004C54] relative">
                      <div
                        className="absolute inset-0 border-8 border-[#FFC300] rounded-full"
                        style={{ clipPath: `polygon(0 0, 100% 0, 100% ${pendingPercentage}%, 0% ${pendingPercentage}%)` }}
                      ></div>
                      <div
                        className="absolute inset-0 border-8 border-red-500 rounded-full"
                        style={{ clipPath: `polygon(0 0, ${rejectedPercentage}% 0, ${rejectedPercentage}% 100%, 0% 100%)` }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-2xl font-bold">{approvedPercentage}%</span>
                        <span className="text-xs text-muted-foreground">Approved</span>
                      </div>
                    </div>
                    <div className="absolute bottom-4 w-full flex justify-center gap-4">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-[#004C54] rounded-full"></div>
                        <span className="text-xs">Approved</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-[#FFC300] rounded-full"></div>
                        <span className="text-xs">Pending</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-xs">Rejected</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Entries Over Time</CardTitle>
                  <CardDescription>Number of entries reviewed per week</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <LineChart className="h-8 w-8 text-muted-foreground absolute" />
                    <div className="w-full h-[200px] mt-8 relative">
                      {/* Simplified chart visualization */}
                      <div className="absolute bottom-0 left-0 w-full h-px bg-border"></div>
                      <div className="absolute left-0 top-0 h-full w-px bg-border"></div>

                      <div className="relative h-full w-full flex items-end justify-between px-4">
                        {entriesOverTime.length > 0 ? 
                          entriesOverTime.map((data, i) => (
                            <div
                              key={i}
                              className="w-8 bg-primary/80 rounded-t-sm"
                              style={{ height: `${data.percentage || 0}%` }}
                            ></div>
                          )) :
                          [40, 65, 45, 80, 60, 90, 75].map((height, i) => (
                          <div
                            key={i}
                            className="w-8 bg-primary/80 rounded-t-sm"
                            style={{ height: `${height}%` }}
                          ></div>
                          ))
                        }
                      </div>

                      <div className="absolute bottom-[-20px] w-full flex justify-between px-4">
                        {entriesOverTime.length > 0 ?
                          entriesOverTime.map((data, i) => (
                            <div key={i} className="text-xs text-muted-foreground">
                              {data.label || "Day"}
                            </div>
                          )) :
                          ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                          <div key={i} className="text-xs text-muted-foreground">
                            {day}
                          </div>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest evaluations and reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.length > 0 ? (
                    activities.map((activity, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {activity.student_name ? 
                                activity.student_name.split(" ").map((n) => n[0]).join("") : 
                                "ST"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">
                              {activity.student_name} • {new Date(activity.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${
                          activity.status === "approved"
                              ? "bg-green-50 text-green-700"
                              : activity.status === "pending"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700"
                          }`}
                        >
                          {activity.status === "approved"
                            ? "Approved"
                            : activity.status === "pending"
                              ? "Pending"
                              : "Rejected"}
                      </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No recent activity to display
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {studentsData.length > 0 ? (
                studentsData.map((student, i) => (
                  <Card key={i}>
              <CardHeader>
                      <CardTitle>{student.name}</CardTitle>
                      <CardDescription>{student.matric_number}</CardDescription>
              </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                          <p className="text-muted-foreground">Entries</p>
                          <p className="font-medium">{student.entries_count}</p>
                            </div>
                        <div>
                          <p className="text-muted-foreground">Rating</p>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {student.rating}/5
                            </Badge>
                          </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Progress</span>
                          <span className="text-sm">{student.progress}%</span>
                        </div>
                        <Progress value={student.progress} className="h-2" />
                          </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-green-50 p-2 rounded">
                          <p className="font-medium text-green-700">{student.approved_count}</p>
                          <p className="text-muted-foreground">Approved</p>
                        </div>
                        <div className="bg-amber-50 p-2 rounded">
                          <p className="font-medium text-amber-700">{student.pending_count}</p>
                          <p className="text-muted-foreground">Pending</p>
                          </div>
                        <div className="bg-red-50 p-2 rounded">
                          <p className="font-medium text-red-700">{student.rejected_count}</p>
                          <p className="text-muted-foreground">Rejected</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <h3 className="font-medium text-lg">No Student Data Available</h3>
                  <p className="text-muted-foreground">
                    There is no student performance data for the selected period
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Activities Timeline</CardTitle>
                <CardDescription>Chronological timeline of evaluation activities</CardDescription>
              </CardHeader>
              <CardContent>
                {activities.length > 0 ? (
                <div className="space-y-8">
                    {activities.map((activity, i) => (
                      <div key={i} className="relative pl-6 pb-8 last:pb-0">
                        <div className="absolute left-0 top-0 h-full w-[2px] bg-border">
                          <div className="absolute top-0 left-[-4px] h-2 w-2 rounded-full bg-primary"></div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{activity.title}</p>
                            <Badge
                              variant="outline"
                              className={`${
                                activity.status === "approved"
                                  ? "bg-green-50 text-green-700"
                                  : activity.status === "pending"
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-red-50 text-red-700"
                              }`}
                            >
                              {activity.status === "approved"
                                ? "Approved"
                                : activity.status === "pending"
                                  ? "Pending"
                                  : "Rejected"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {activity.student_name} • {new Date(activity.date).toLocaleDateString()}
                          </p>
                          {activity.feedback && (
                            <div className="mt-2 p-3 bg-muted/20 rounded-md">
                              <p className="text-sm">{activity.feedback}</p>
                              </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <h3 className="font-medium text-lg">No Activities Available</h3>
                    <p className="text-muted-foreground">
                      There are no activities to display for the selected period
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

