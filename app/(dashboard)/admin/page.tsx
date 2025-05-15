"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart, Calendar, FileText, Loader2, School, Users, Bell, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { admin } from "@/lib/api"
import { AddStudentModal } from "@/components/students/add-student-modal"
import { AddDepartmentModal } from "@/components/departments/add-department-modal"
import { AddSupervisorModal } from "@/components/supervisors/add-supervisor-modal"

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSupervisors: 0,
    departments: 0,
    reports: 0
  })
  const [recentStudents, setRecentStudents] = useState([])
  const [recentSupervisors, setRecentSupervisors] = useState([])
  const [departmentStats, setDepartmentStats] = useState([])
  const [studentModalOpen, setStudentModalOpen] = useState(false)
  const [supervisorModalOpen, setSupervisorModalOpen] = useState(false)
  const [departmentModalOpen, setDepartmentModalOpen] = useState(false)
  const { toast } = useToast()

  const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        // Fetch dashboard stats
        const dashboardResponse = await admin.getDashboardStats()
        if (dashboardResponse.data) {
        const data = dashboardResponse.data;
        
          setStats({
          totalStudents: data.students?.total || 0,
          totalSupervisors: data.supervisors?.total || 0,
          departments: data.departments?.total || 0,
          reports: data.reports?.total || 0
          })
          
          // Set recent students and supervisors if available
        if (data.recent_students) {
          setRecentStudents(data.recent_students)
          }
          
        if (data.recent_supervisors) {
          setRecentSupervisors(data.recent_supervisors)
          }
        } else if (dashboardResponse.error) {
          toast({
            variant: "destructive",
            title: "Failed to load dashboard data",
            description: dashboardResponse.error,
          })
        }
      
      // Fetch department statistics
      const departmentStatsResponse = await admin.getDepartmentStats()
      if (departmentStatsResponse.data) {
        setDepartmentStats(departmentStatsResponse.data)
      }
      
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch dashboard information. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

  useEffect(() => {
    fetchDashboardData()
  }, [toast])

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[#004C54]" />
          <p className="text-muted-foreground">Loading dashboard information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Header with welcome message and date */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground">Welcome back, Admin User</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FFC300] text-[0.6rem] text-black font-medium">
              3
            </span>
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Students"
          value={stats.totalStudents.toString()}
          description="Active SIWES students"
          icon={Users}
          color="bg-blue-50"
          iconColor="text-blue-600"
          href="/admin/students"
        />
        <StatsCard
          title="Total Supervisors"
          value={stats.totalSupervisors.toString()}
          description="Assigned supervisors"
          icon={Users}
          color="bg-green-50"
          iconColor="text-green-600"
          href="/admin/supervisors"
        />
        <StatsCard
          title="Departments"
          value={stats.departments.toString()}
          description="Participating departments"
          icon={School}
          color="bg-purple-50"
          iconColor="text-purple-600"
          href="/admin/departments"
        />
        <StatsCard
          title="Reports"
          value={stats.reports.toString()}
          description="Generated this month"
          icon={FileText}
          color="bg-amber-50"
          iconColor="text-amber-600"
          href="/admin/reports"
        />
      </div>

      {/* Students and supervisors section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent students */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Students</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary" asChild>
                <Link href="/admin/students">View all</Link>
              </Button>
            </div>
            <CardDescription>Recently registered students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentStudents.length > 0 ? (
                recentStudents.map((student, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {student.name ? student.name.substring(0, 2).toUpperCase() : 'ST'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{student.name || 'Student'}</p>
                        <Badge
                          variant="outline"
                          className="bg-blue-100 text-blue-800"
                        >
                          {student.level || 'ND1'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{student.matric_number || 'N/A'}</span>
                        <span>{student.department || 'Not Assigned'}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No recent students found
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setStudentModalOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Student
            </Button>
              <AddStudentModal 
                open={studentModalOpen} 
                onOpenChange={setStudentModalOpen} 
                onSuccess={fetchDashboardData} 
              />
            </div>
          </CardFooter>
        </Card>

        {/* Recent supervisors */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Supervisors</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary" asChild>
                <Link href="/admin/supervisors">View all</Link>
              </Button>
            </div>
            <CardDescription>Recently registered supervisors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSupervisors.length > 0 ? (
                recentSupervisors.map((supervisor, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {supervisor.name ? supervisor.name.substring(0, 2).toUpperCase() : 'SV'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{supervisor.name || 'Supervisor'}</p>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          {supervisor.student_count || 0} Students
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{supervisor.staff_id || 'N/A'}</span>
                        <span>{supervisor.department || 'Not Assigned'}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No recent supervisors found
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setSupervisorModalOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Supervisor
            </Button>
              <AddSupervisorModal
                open={supervisorModalOpen}
                onOpenChange={setSupervisorModalOpen}
                onSuccess={fetchDashboardData}
              />
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Department overview */}
      <Card id="department-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Department Overview</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary" asChild>
              <Link href="/admin/departments">View all</Link>
            </Button>
          </div>
          <CardDescription>Student distribution across departments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentStats.length > 0 ? (
              departmentStats.map((dept, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{dept.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      {dept.students} Students
                    </Badge>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      {dept.supervisors} Supervisors
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{dept.progress}%</span>
                  </div>
                  <Progress
                    value={dept.progress}
                      className={`h-2 ${
                        dept.progress >= 75 ? "[&>div]:bg-green-500" : 
                        dept.progress >= 50 ? "[&>div]:bg-amber-500" : 
                        "[&>div]:bg-red-500"
                    }`}
                  />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <School className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p>No departments available yet. Add a department to see it here.</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <div className="w-full">
            <Button 
              className="w-full bg-[#004C54] hover:bg-[#004C54]/90"
              onClick={() => setDepartmentModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Department
          </Button>
            <AddDepartmentModal 
              open={departmentModalOpen} 
              onOpenChange={setDepartmentModalOpen} 
              onSuccess={fetchDashboardData} 
            />
          </div>
        </CardFooter>
      </Card>

      {/* Recent reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Reports</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary" asChild>
              <Link href="/admin/reports">View all</Link>
            </Button>
          </div>
          <CardDescription>Recently generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Reports will be fetched from API in a future update */}
            <div className="text-center py-4 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p>No reports available yet. Generate a report to see it here.</p>
              </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-[#004C54] hover:bg-[#004C54]/90" asChild>
            <Link href="/admin/reports/new">
              <Plus className="mr-2 h-4 w-4" />
              Generate New Report
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: string
  description: string
  icon: React.ElementType
  color: string
  iconColor: string
  href: string
}

function StatsCard({ title, value, description, icon: Icon, color, iconColor, href }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className={`${color} p-2 rounded-full`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" asChild>
          <Link href={href}>View details →</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

