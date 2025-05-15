"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  CalendarCheck, 
  Download, 
  Filter, 
  Loader2, 
  Plus, 
  Search,
  User, 
  UserCheck, 
  Users 
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { admin } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function AssignmentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [supervisorFilter, setSupervisorFilter] = useState("all")
  const [assignments, setAssignments] = useState([])
  const [supervisors, setSupervisors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Get query params to support filtering
  const searchParams = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search) 
    : null
  const supervisorFromQuery = searchParams?.get('supervisor')

  useEffect(() => {
    // If we have a supervisor query param, update the filter
    if (supervisorFromQuery) {
      setSupervisorFilter(supervisorFromQuery)
    }
  }, [supervisorFromQuery])

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        // Fetch assignments
        const assignmentsResponse = await admin.getAssignments()
        if (assignmentsResponse.data) {
          setAssignments(assignmentsResponse.data)
        } else if (assignmentsResponse.error) {
          toast({
            variant: "destructive",
            title: "Failed to load assignments",
            description: assignmentsResponse.error,
          })
        }

        // Fetch supervisors for filtering
        const supervisorsResponse = await admin.getSupervisors()
        if (supervisorsResponse.data) {
          setSupervisors(supervisorsResponse.data)
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch assignments data. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  // Filter assignments based on search query and supervisor filter
  const filteredAssignments = assignments.filter((assignment) => {
    // Check if the expected properties exist before accessing them
    const studentName = assignment.student_details?.full_name || "";
    const supervisorName = assignment.supervisor_details?.full_name || "";
    const studentMatric = assignment.student_details?.matric_number || "";
    const supervisorId = assignment.supervisor_details?.id?.toString() || "";
    
    const matchesSearch = 
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supervisorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentMatric.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSupervisor = 
      supervisorFilter === "all" || 
      supervisorId === supervisorFilter;
    
    return matchesSearch && matchesSupervisor;
  });

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[#004C54]" />
          <p className="text-muted-foreground">Loading assignments information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Supervisor Assignments</h2>
          <p className="text-muted-foreground">
            Manage supervisor-student assignments for SIWES
          </p>
        </div>
        <Button className="bg-[#004C54] hover:bg-[#004C54]/90" asChild>
          <Link href="/admin/assignments/new">
            <Plus className="mr-2 h-4 w-4" />
            New Assignment
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap justify-between gap-4">
        <div className="flex flex-1 gap-2 min-w-[200px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assignments..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={supervisorFilter} onValueChange={setSupervisorFilter}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Supervisor" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Supervisors</SelectItem>
              {supervisors.map((supervisor) => {
                const name = `${supervisor.user.first_name} ${supervisor.user.last_name}`
                return (
                  <SelectItem key={supervisor.id} value={supervisor.id.toString()}>
                    {name}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))
        ) : (
          <div className="text-center py-10">
            <UserCheck className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <h3 className="font-medium text-lg">No Assignments Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || supervisorFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Start by creating your first supervisor-student assignment"}
            </p>
            <Button asChild className="bg-[#004C54] hover:bg-[#004C54]/90">
              <Link href="/admin/assignments/new">
                <Plus className="mr-2 h-4 w-4" />
                New Assignment
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function AssignmentCard({ assignment }: { assignment: any }) {
  // Use the correct data structure returned by the API
  const studentName = assignment.student_details?.full_name || "Unknown Student";
  const supervisorName = assignment.supervisor_details?.full_name || "Unknown Supervisor";
  const assignedDate = new Date(assignment.assigned_date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short', 
    year: 'numeric'
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap justify-between gap-2">
          <CardTitle className="text-lg">Assignment #{assignment.id}</CardTitle>
          <div className="flex items-center gap-1">
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Assigned: {assignedDate}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-5 w-5 text-[#004C54]" />
              <h3 className="font-medium">Student</h3>
            </div>
            <div className="space-y-2 pl-7">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{studentName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Matric Number</p>
                <p className="font-medium">{assignment.student_details?.matric_number || "N/A"}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="h-5 w-5 text-[#004C54]" />
              <h3 className="font-medium">Supervisor</h3>
            </div>
            <div className="space-y-2 pl-7">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{supervisorName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Staff ID</p>
                <p className="font-medium">{assignment.supervisor_details?.staff_id || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/students/${assignment.student}`}>
            View Student
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/supervisors/${assignment.supervisor_details?.id}`}>
            View Supervisor
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/assignments/${assignment.id}/edit`}>
                Edit Assignment
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onSelect={(e) => {
                e.preventDefault()
                // Add deletion logic or confirmation dialog
              }}
            >
              Delete Assignment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  )
}

