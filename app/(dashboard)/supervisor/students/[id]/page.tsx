"use client"

import React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { notFound, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  AlertCircle,
  ArrowLeft,
  BarChart,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Phone,
  MapPin,
  User,
  Mail,
  Loader2,
  ClipboardList
} from "lucide-react"
import { supervisor } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface StudentDetailPageProps {
  params: {
    id: string
  }
}

export default function StudentDetailPage({ params }: StudentDetailPageProps) {
  const studentId = parseInt(React.use(params).id)
  const [student, setStudent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [recentEntries, setRecentEntries] = useState<any[]>([])
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function fetchStudentData() {
      setIsLoading(true)
      try {
        const [studentRes, entriesRes] = await Promise.all([
          supervisor.getStudentDetails(studentId),
          supervisor.getStudentLogbook(studentId)
        ])

        if (studentRes.error) {
          console.error("Failed to fetch student:", studentRes.error)
          toast({
            variant: "destructive",
            title: "Failed to load student",
            description: studentRes.error,
          })
          return notFound()
        }

        setStudent(studentRes.data)
        
        if (entriesRes.data) {
          // Get the 3 most recent entries
          setRecentEntries(entriesRes.data.slice(0, 3))
        }
      } catch (error) {
        console.error("Error fetching student data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch student data. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (isNaN(studentId)) {
      router.push("/supervisor/students")
      return
    }

    fetchStudentData()
  }, [studentId, toast, router])

  const getInitials = (name: string = "") => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[#004C54]" />
          <p className="text-muted-foreground">Loading student information...</p>
        </div>
      </div>
    )
  }

  if (!student) return notFound()

  const fullName = `${student.user.first_name} ${student.user.last_name}`
  const companyName = student.company?.name || 'Not assigned'
  const progress = student.progress || 0
  const pendingEntries = student.pending_entries || 0
  const totalEntries = student.entries_count || 0
  const startDate = student.it_start_date ? new Date(student.it_start_date) : null
  const endDate = student.it_end_date ? new Date(student.it_end_date) : null

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left column - Student info */}
        <div className="md:w-1/3 space-y-4">
          <Card className="overflow-hidden">
            <div className="bg-[#004C54] p-6 text-white">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-white">
                  <AvatarImage src={student.profile_picture || "/placeholder.svg?height=64&width=64"} alt={fullName} />
                  <AvatarFallback className="bg-[#FFC300] text-[#004C54] text-lg">
                    {getInitials(fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl font-bold">{fullName}</h1>
                  <p className="text-white/80">{student.matric_number}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm font-medium">{progress}%</span>
                </div>
                <Progress 
                  value={progress} 
                  className="h-2 w-full overflow-hidden rounded-full bg-white/20" 
                />
                <style jsx global>{`
                  .h-2.bg-white\/20 .bg-primary {
                    background-color: #FFC300;
                  }
                `}</style>
              </div>
            </div>

            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{student.user.email}</span>
                </div>
                {student.phone_number && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{student.phone_number}</span>
                  </div>
                )}
                {student.address && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{student.address}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-semibold">Academic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Department</p>
                    <p>{student.department?.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Level</p>
                    <p>{student.level || "N/A"}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-semibold">Industrial Training</h3>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Company</p>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <p>{companyName}</p>
                  </div>
                </div>
                {(startDate || endDate) && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Training Period</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p>
                        {startDate ? format(startDate, 'MMM d, yyyy') : 'Not set'} - 
                        {endDate ? format(endDate, 'MMM d, yyyy') : 'Not set'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-2">
              <Button asChild className="w-full bg-[#004C54] hover:bg-[#004C54]/90">
                <Link href={`/supervisor/evaluations?student=${student.id}`}>
                  <BarChart className="mr-2 h-4 w-4" />
                  Evaluate Student
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href={`/supervisor/students/${student.id}/logbook`}>
                  <FileText className="mr-2 h-4 w-4" />
                  View Logbook
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="py-4 px-5">
                <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
              </CardHeader>
              <CardContent className="pb-4 px-5">
                <div className="text-2xl font-bold">{totalEntries}</div>
                <p className="text-xs text-muted-foreground">Logbook entries submitted</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-4 px-5">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent className="pb-4 px-5">
                <div className="text-2xl font-bold">{pendingEntries}</div>
                <p className="text-xs text-muted-foreground">Entries awaiting review</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right column - Recent activities */}
        <div className="md:w-2/3 space-y-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-4">Student Overview</h2>
            <Tabs defaultValue="logbook" className="space-y-4">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="logbook">Recent Logbook Entries</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>
              
              <TabsContent value="logbook" className="space-y-4">
                {recentEntries.length > 0 ? (
                  <>
                    {recentEntries.map((entry) => (
                      <Card key={entry.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{entry.title}</CardTitle>
                            <Badge
                              variant="outline"
                              className={
                                entry.status === 'approved'
                                  ? "bg-green-50 text-green-700"
                                  : entry.status === 'rejected'
                                  ? "bg-red-50 text-red-700" 
                                  : "bg-amber-50 text-amber-700"
                              }
                            >
                              {entry.status === 'approved' ? 'Approved' : entry.status === 'rejected' ? 'Rejected' : 'Pending'}
                            </Badge>
                          </div>
                          <CardDescription>
                            {entry.date ? format(new Date(entry.date), 'MMMM d, yyyy') : 'No date'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-4 space-y-2">
                          <div>
                            <h4 className="text-sm font-medium mb-1">Activities Performed</h4>
                            <p className="text-sm text-muted-foreground">{entry.activities}</p>
                          </div>
                          {entry.skills_learned && (
                            <div>
                              <h4 className="text-sm font-medium mb-1">Skills Learned</h4>
                              <p className="text-sm text-muted-foreground">{entry.skills_learned}</p>
                            </div>
                          )}
                          {entry.feedback && (
                            <div className="bg-muted p-3 rounded-md">
                              <h4 className="text-sm font-medium mb-1">Your Feedback</h4>
                              <p className="text-sm text-muted-foreground">{entry.feedback}</p>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter>
                          <Button
                            variant={entry.status === 'pending' ? "default" : "outline"}
                            size="sm"
                            className={entry.status === 'pending' ? "bg-[#004C54] hover:bg-[#004C54]/90" : ""}
                            asChild
                          >
                            <Link href={`/supervisor/students/${student.id}/logbook/${entry.id}`}>
                              {entry.status === 'pending' ? (
                                <Clock className="mr-2 h-4 w-4" />
                              ) : (
                                <FileText className="mr-2 h-4 w-4" />
                              )}
                              {entry.status === 'pending' ? "Review Entry" : "View Details"}
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}

                    <div className="flex justify-center mt-2">
                      <Button variant="outline" asChild>
                        <Link href={`/supervisor/students/${student.id}/logbook`}>
                          View All Logbook Entries
                        </Link>
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 bg-muted/20 rounded-lg">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <h3 className="text-lg font-medium">No Logbook Entries Yet</h3>
                    <p className="text-muted-foreground">The student hasn't submitted any logbook entries</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="reports">
                <div className="text-center py-12 bg-muted/20 rounded-lg">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <h3 className="text-lg font-medium">Report Module Coming Soon</h3>
                  <p className="text-muted-foreground">Student reports will be available in a future update</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Alert for pending entries */}
          {pendingEntries > 0 && (
            <Alert className="bg-amber-50 border-amber-200 text-amber-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Pending Reviews</AlertTitle>
              <AlertDescription>
                This student has {pendingEntries} logbook entries awaiting your review.
                <div className="mt-2">
                  <Button size="sm" asChild className="bg-amber-600 hover:bg-amber-700 text-white">
                    <Link href={`/supervisor/students/${student.id}/logbook?status=pending`}>
                      <Clock className="mr-1 h-4 w-4" />
                      Review Pending Entries
                    </Link>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {/* No IT company alert */}
          {!student.company && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Industrial Training Information Missing</AlertTitle>
              <AlertDescription>
                This student has not been assigned to a company for industrial training.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  )
} 