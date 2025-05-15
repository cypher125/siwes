"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, User, UserCheck } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { admin } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function NewAssignmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [students, setStudents] = useState([])
  const [supervisors, setSupervisors] = useState([])
  
  const [selectedStudent, setSelectedStudent] = useState("")
  const [selectedSupervisor, setSelectedSupervisor] = useState("")
  const [notes, setNotes] = useState("")

  // Check if we have a student or supervisor query param (for pre-selection)
  const studentIdFromQuery = searchParams.get('student')
  const supervisorIdFromQuery = searchParams.get('supervisor')
  
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        // Fetch students and supervisors in parallel
        const [studentsResponse, supervisorsResponse] = await Promise.all([
          admin.getStudents(),
          admin.getSupervisors()
        ])
        
        if (studentsResponse.data) {
          setStudents(studentsResponse.data)
          // If we have a student ID from query params, pre-select it
          if (studentIdFromQuery) {
            setSelectedStudent(studentIdFromQuery)
          }
        } else if (studentsResponse.error) {
          toast({
            variant: "destructive",
            title: "Failed to load students",
            description: studentsResponse.error,
          })
        }
        
        if (supervisorsResponse.data) {
          setSupervisors(supervisorsResponse.data)
          // If we have a supervisor ID from query params, pre-select it
          if (supervisorIdFromQuery) {
            setSelectedSupervisor(supervisorIdFromQuery)
          }
        } else if (supervisorsResponse.error) {
          toast({
            variant: "destructive",
            title: "Failed to load supervisors",
            description: supervisorsResponse.error,
          })
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch data. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast, studentIdFromQuery, supervisorIdFromQuery])

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (!selectedStudent || !selectedSupervisor) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select both a student and a supervisor.",
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Find the supervisor's user ID from the supervisor profile
      const supervisorProfile = supervisors.find(s => s.id.toString() === selectedSupervisor)
      if (!supervisorProfile) {
        throw new Error("Selected supervisor not found")
      }

      const response = await admin.createAssignment({
        student: parseInt(selectedStudent),
        supervisor: supervisorProfile.user.id, // Use the user ID, not the profile ID
        notes: notes.trim() || null
      })
      
      if (response.data) {
        toast({
          title: "Assignment Created",
          description: "The supervisor-student assignment has been created successfully.",
        })
        
        // Redirect back to assignments list
        router.push("/admin/assignments")
      } else if (response.error) {
        toast({
          variant: "destructive",
          title: "Failed to create assignment",
          description: response.error,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Find details of selected student and supervisor for display
  const selectedStudentDetails = students.find(s => s.id.toString() === selectedStudent)
  const selectedSupervisorDetails = supervisors.find(s => s.id.toString() === selectedSupervisor)

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[#004C54]" />
          <p className="text-muted-foreground">Loading assignment form...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1" 
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Create New Assignment</h2>
          <p className="text-muted-foreground">
            Assign a supervisor to a student for SIWES monitoring
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Student Selection */}
              <div className="space-y-2">
                <Label htmlFor="student">Student</Label>
                <Select 
                  value={selectedStudent} 
                  onValueChange={setSelectedStudent}
                >
                  <SelectTrigger id="student">
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem 
                        key={student.id} 
                        value={student.id.toString()}
                      >
                        {student.user.first_name} {student.user.last_name} ({student.matric_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Supervisor Selection */}
              <div className="space-y-2">
                <Label htmlFor="supervisor">Supervisor</Label>
                <Select 
                  value={selectedSupervisor} 
                  onValueChange={setSelectedSupervisor}
                >
                  <SelectTrigger id="supervisor">
                    <SelectValue placeholder="Select a supervisor" />
                  </SelectTrigger>
                  <SelectContent>
                    {supervisors.map((supervisor) => (
                      <SelectItem 
                        key={supervisor.id} 
                        value={supervisor.id.toString()}
                      >
                        {supervisor.user.first_name} {supervisor.user.last_name} ({supervisor.department?.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Notes Field */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  placeholder="Add any additional notes about this assignment"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
            
            {/* Preview of selection */}
            {(selectedStudentDetails || selectedSupervisorDetails) && (
              <>
                <Separator />
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-4">Selection Preview</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {selectedStudentDetails && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-[#004C54]" />
                          <h4 className="font-medium">Student</h4>
                        </div>
                        <div className="space-y-2 pl-7">
                          <div>
                            <p className="text-sm text-muted-foreground">Name</p>
                            <p className="font-medium">
                              {selectedStudentDetails.user.first_name} {selectedStudentDetails.user.last_name}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Matric Number</p>
                            <p className="font-medium">{selectedStudentDetails.matric_number}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Department</p>
                            <p className="font-medium">{selectedStudentDetails.department?.name}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedSupervisorDetails && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-5 w-5 text-[#004C54]" />
                          <h4 className="font-medium">Supervisor</h4>
                        </div>
                        <div className="space-y-2 pl-7">
                          <div>
                            <p className="text-sm text-muted-foreground">Name</p>
                            <p className="font-medium">
                              {selectedSupervisorDetails.user.first_name} {selectedSupervisorDetails.user.last_name}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Staff ID</p>
                            <p className="font-medium">{selectedSupervisorDetails.staff_id}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Department</p>
                            <p className="font-medium">{selectedSupervisorDetails.department?.name}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </>
            )}
            
            <CardFooter className="flex justify-between border-t p-6">
              <Button 
                variant="outline" 
                onClick={() => router.push("/admin/assignments")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-[#004C54] hover:bg-[#004C54]/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Assignment"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
} 