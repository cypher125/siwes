"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  BookOpen, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Edit,
  Trash2,
  Loader2
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { admin } from "@/lib/api"
import Link from "next/link"

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  
  useEffect(() => {
    async function fetchStudentData() {
      try {
        const response = await admin.getStudentDetails(parseInt(params.id))
        if (response.data) {
          setStudent(response.data)
        } else {
          toast({
            variant: "destructive", 
            title: "Error", 
            description: response.error || "Failed to load student data"
          })
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch student details"
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchStudentData()
  }, [params.id, toast])
  
  const handleDeleteStudent = async () => {
    if (!confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
      return
    }
    
    setDeleteLoading(true)
    try {
      const response = await admin.deleteStudent(parseInt(params.id))
      if (!response.error) {
        toast({
          title: "Student deleted",
          description: "The student has been successfully removed from the system"
        })
        router.push("/admin/students")
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.error || "Failed to delete student"
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred"
      })
    } finally {
      setDeleteLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[#004C54]" />
          <p className="text-muted-foreground">Loading student information...</p>
        </div>
      </div>
    )
  }
  
  if (!student) {
    return (
      <div className="flex-1 p-8">
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/admin/students">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to students
          </Link>
        </Button>
        
        <div className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-muted p-4">
            <User className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">Student Not Found</h1>
          <p className="text-muted-foreground mt-2">The student you're looking for does not exist or has been deleted.</p>
          <Button className="mt-6 bg-[#004C54] hover:bg-[#004C54]/90" asChild>
            <Link href="/admin/students">Return to Students</Link>
          </Button>
        </div>
      </div>
    )
  }
  
  const fullName = `${student.user.first_name} ${student.user.last_name}`
  const initials = `${student.user.first_name[0]}${student.user.last_name[0]}`
  
  return (
    <div className="flex-1 p-8 space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/admin/students">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to students
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" asChild>
            <Link href={`/admin/students/${params.id}/edit`}>
              <Edit className="h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button 
            variant="destructive" 
            className="gap-2" 
            onClick={handleDeleteStudent}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete
          </Button>
        </div>
      </div>
      
      {/* Student Profile Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-shrink-0">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <h1 className="text-2xl font-bold">{fullName}</h1>
            <Badge className="w-fit">Student</Badge>
          </div>
          <p className="text-muted-foreground">{student.matric_number}</p>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-800">
              {student.department?.name || "No Department"}
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-800">
              Level: {student.level || "Not Set"}
            </Badge>
            <Badge variant="outline" className={student.is_active ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}>
              {student.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          
          <div className="mt-3 space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{student.user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{student.phone_number || "No phone number"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{student.address || "No address"}</span>
            </div>
          </div>
        </div>
        
        {/* Progress Section */}
        <Card className="w-full md:w-64">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">SIWES Progress</CardTitle>
            <CardDescription>Overall completion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">{student.progress || 0}%</span>
              </div>
              <Progress value={student.progress || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Separator />
      
      {/* Tabs content */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="logbooks">Logbooks</TabsTrigger>
          <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">First Name</p>
                    <p className="font-medium">{student.user.first_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Last Name</p>
                    <p className="font-medium">{student.user.last_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{student.user.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Matric Number</p>
                    <p className="font-medium">{student.matric_number}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Phone Number</p>
                    <p className="font-medium">{student.phone_number || "Not provided"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Level</p>
                    <p className="font-medium">{student.level || "Not set"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Academic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Academic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-medium">{student.department?.name || "Not assigned"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Supervisor</p>
                    {student.supervisor ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {`${student.supervisor.first_name?.[0] || ""}${student.supervisor.last_name?.[0] || ""}`}
                          </AvatarFallback>
                        </Avatar>
                        <p className="font-medium">
                          {`${student.supervisor.first_name || ""} ${student.supervisor.last_name || ""}`}
                        </p>
                      </div>
                    ) : (
                      <p className="font-medium">Not assigned</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Company</p>
                    <div className="flex items-center gap-2">
                      {student.company ? (
                        <>
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{student.company.name}</p>
                        </>
                      ) : (
                        <p className="font-medium">Not assigned</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Placeholder for other tabs */}
        <TabsContent value="logbooks">
          <Card>
            <CardHeader>
              <CardTitle>Logbook Entries</CardTitle>
              <CardDescription>View all logbook entries submitted by this student</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">No logbook entries available</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="evaluations">
          <Card>
            <CardHeader>
              <CardTitle>Evaluations</CardTitle>
              <CardDescription>View all evaluations for this student</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">No evaluations available</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>View all reports submitted by this student</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">No reports available</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 