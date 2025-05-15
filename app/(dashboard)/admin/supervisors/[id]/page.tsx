"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  AtSign, 
  Building, 
  Calendar, 
  Edit, 
  GraduationCap, 
  Loader2, 
  Mail, 
  MapPin, 
  Phone, 
  User, 
  Users 
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { admin } from "@/lib/api"

export default function SupervisorDetailsPage() {
  const { id } = useParams()
  const [supervisor, setSupervisor] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [students, setStudents] = useState([])
  const { toast } = useToast()

  useEffect(() => {
    async function fetchSupervisorData() {
      setIsLoading(true)
      try {
        // Fetch supervisor details
        const response = await admin.getSupervisorDetails(Number(id))
        if (response.data) {
          setSupervisor(response.data)
          
          // Fetch students assigned to this supervisor
          try {
            const studentsResponse = await admin.getStudents({ 
              params: { supervisor_id: response.data.user.id }
            })
            if (studentsResponse.data) {
              setStudents(studentsResponse.data)
            }
          } catch (error) {
            console.error("Failed to fetch assigned students:", error)
          }
        } else if (response.error) {
          toast({
            variant: "destructive",
            title: "Failed to load supervisor details",
            description: response.error,
          })
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch supervisor information. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchSupervisorData()
    }
  }, [id, toast])

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[#004C54]" />
          <p className="text-muted-foreground">Loading supervisor information...</p>
        </div>
      </div>
    )
  }

  if (!supervisor) {
    return (
      <div className="flex-1 p-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/admin/supervisors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Supervisors
            </Link>
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <User className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Supervisor Not Found</h2>
          <p className="text-muted-foreground mb-6">The requested supervisor could not be found or may have been deleted.</p>
          <Button asChild className="bg-[#004C54] hover:bg-[#004C54]/90">
            <Link href="/admin/supervisors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Supervisors List
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const fullName = `${supervisor.user.first_name} ${supervisor.user.last_name}`
  const initials = `${supervisor.user.first_name[0]}${supervisor.user.last_name[0]}`
  const status = supervisor.is_active ? "active" : "inactive"

  return (
    <div className="flex-1 p-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/supervisors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Supervisors
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Profile summary */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center pt-8">
            <div className="flex justify-center mb-4">
              <Avatar className="h-28 w-28">
                <AvatarImage src={supervisor.profile_picture || ""} alt={fullName} />
                <AvatarFallback className="text-2xl bg-[#004C54] text-white">{initials}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl">{fullName}</CardTitle>
            <div className="mt-1 flex justify-center">
              <Badge variant="outline" className={status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                {status === "active" ? "Active" : "Inactive"}
              </Badge>
            </div>
            <CardDescription>{supervisor.position || "Supervisor"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Staff ID:</span>
                <span className="ml-auto font-medium">{supervisor.staff_id}</span>
              </div>
              <div className="flex items-center text-sm">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Email:</span>
                <span className="ml-auto font-medium">{supervisor.user.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Phone:</span>
                <span className="ml-auto font-medium">{supervisor.phone_number || "Not provided"}</span>
              </div>
              <div className="flex items-center text-sm">
                <GraduationCap className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Department:</span>
                <span className="ml-auto font-medium">{supervisor.department?.name || "Not assigned"}</span>
              </div>
              <div className="flex items-center text-sm">
                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{students.length === 1 ? "Assigned Student:" : "Assigned Students:"}</span>
                <span className="ml-auto font-medium">{students.length}</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Office:</span>
                <span className="ml-auto font-medium">{supervisor.office_address || "Not provided"}</span>
              </div>
              <div className="flex items-center text-sm">
                <AtSign className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Specialization:</span>
                <span className="ml-auto font-medium">{supervisor.specialization || "Not specified"}</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Joined:</span>
                <span className="ml-auto font-medium">
                  {new Date(supervisor.user.date_joined).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/admin/supervisors/${id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Right column - Details tabs */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="students">Assigned Students</TabsTrigger>
              <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                  <CardDescription>Details about the supervisor's professional background</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="mb-2 font-medium">Biography</h4>
                    <p className="text-sm text-muted-foreground">
                      {supervisor.bio || "No biography information available."}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="mb-2 font-medium">Specialization</h4>
                    <p className="text-sm text-muted-foreground">
                      {supervisor.specialization || "No specialization information available."}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="mb-2 font-medium">Position</h4>
                    <p className="text-sm text-muted-foreground">
                      {supervisor.position || "No position information available."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="students">
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Students</CardTitle>
                  <CardDescription>Students under this supervisor's guidance</CardDescription>
                </CardHeader>
                <CardContent>
                  {students.length > 0 ? (
                    <div className="space-y-4">
                      {students.map((student) => (
                        <div key={student.id} className="flex items-center gap-4 p-3 border rounded-lg">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-blue-100 text-blue-800">
                              {student.user.first_name[0]}{student.user.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">
                                {student.user.first_name} {student.user.last_name}
                              </p>
                              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                {student.level}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{student.matric_number}</span>
                              <span>{student.department?.name}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">No students assigned to this supervisor yet</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/admin/assignments/new?supervisor=${id}`}>
                      <Users className="mr-2 h-4 w-4" />
                      Assign Students
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="evaluations">
              <Card>
                <CardHeader>
                  <CardTitle>Evaluations</CardTitle>
                  <CardDescription>Student logbooks and reports evaluated by this supervisor</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <GraduationCap className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">No evaluations available yet</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Activity summary card */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Summary</CardTitle>
              <CardDescription>Summary of the supervisor's activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 border rounded-lg">
                  <p className="text-2xl font-bold">{students.length}</p>
                  <p className="text-sm text-muted-foreground">
                    {students.length === 1 ? "Assigned Student" : "Assigned Students"}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Approved Logbooks</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Evaluations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 