"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Filter,
  Loader2,
  Plus,
  Search,
  SortAsc,
  SortDesc,
  Trash2,
  User,
  Users,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { admin } from "@/lib/api"
import { AddStudentModal } from "@/components/students/add-student-modal"

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [students, setStudents] = useState([])
  const [departments, setDepartments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const { toast } = useToast()

  // Function to fetch students data
  const fetchStudentsData = async () => {
    setIsLoading(true)
    try {
      // Fetch students
      const studentsResponse = await admin.getStudents()
      if (studentsResponse.data) {
        setStudents(studentsResponse.data)
      } else if (studentsResponse.error) {
        toast({
          variant: "destructive",
          title: "Failed to load students",
          description: studentsResponse.error,
        })
      }
      
      // Fetch departments
      const departmentsResponse = await admin.getDepartments()
      if (departmentsResponse.data) {
        setDepartments(departmentsResponse.data)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch students data. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStudentsData()
  }, [toast])

  // Get unique departments for filter
  const departmentOptions = departments.map(dept => ({
    id: dept.id,
    name: dept.name
  }))

  // Helper function to determine student status
  const getStudentStatus = (student) => {
    return student.is_active ? "active" : "inactive"
  }

  // Filter students based on search query, status filter, and department filter
  const filteredStudents = students
    .filter(
      (student) => {
        const fullName = `${student.user.first_name} ${student.user.last_name}`.toLowerCase()
        const status = getStudentStatus(student)
        
        return (
          (fullName.includes(searchQuery.toLowerCase()) ||
            student.matric_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.department?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.company?.name?.toLowerCase().includes(searchQuery.toLowerCase())) &&
          (statusFilter === "all" || status === statusFilter) &&
          (departmentFilter === "all" || student.department?.id?.toString() === departmentFilter)
        )
      }
    )
    .sort((a, b) => {
      const nameA = `${a.user.first_name} ${a.user.last_name}`
      const nameB = `${b.user.first_name} ${b.user.last_name}`
      
      if (sortOrder === "asc") {
        return nameA.localeCompare(nameB)
      } else {
        return nameB.localeCompare(nameA)
      }
    })

  const handleStudentAdded = () => {
    fetchStudentsData()
  }

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[#004C54]" />
          <p className="text-muted-foreground">Loading students information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Students Management</h2>
          <p className="text-muted-foreground">Manage and monitor all SIWES students</p>
        </div>
        <AddStudentModal 
          open={modalOpen} 
          onOpenChange={setModalOpen} 
          onSuccess={handleStudentAdded} 
        />
      </div>

      <Tabs defaultValue="all" className="space-y-4" onValueChange={setStatusFilter}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all">All Students</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Department" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departmentOptions.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {sortOrder === "asc" ? <SortAsc className="mr-2 h-4 w-4" /> : <SortDesc className="mr-2 h-4 w-4" />}
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortOrder("asc")}>
                  <SortAsc className="mr-2 h-4 w-4" />
                  Name (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("desc")}>
                  <SortDesc className="mr-2 h-4 w-4" />
                  Name (Z-A)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <h3 className="font-medium text-lg">No Students Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== "all" || departmentFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Start by adding your first student"}
                </p>
                <Button onClick={() => setModalOpen(true)} className="bg-[#004C54] hover:bg-[#004C54]/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Student
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <h3 className="font-medium text-lg">No Active Students Found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <h3 className="font-medium text-lg">No Inactive Students Found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StudentCard({ student }: { student: any }) {
  const fullName = `${student.user.first_name} ${student.user.last_name}`
  const initials = `${student.user.first_name[0]}${student.user.last_name[0]}`
  const status = student.is_active ? "active" : "inactive"
  const progress = student.progress || 0
  const pendingEntries = student.pending_entries || 0
  const totalEntries = student.total_entries || 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-medium">{fullName}</CardTitle>
          </div>
          <Badge
            variant="outline"
            className={status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
          >
            {status === "active" ? (
              <>
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Active
              </>
            ) : (
              <>
                <Clock className="mr-1 h-3 w-3" />
                Inactive
              </>
            )}
          </Badge>
        </div>
        <CardDescription className="flex items-center mt-1">
          <span>{student.matric_number}</span>
          <span className="mx-2">•</span>
          <span>{student.department?.name}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Company:</span>
            <span className="font-medium">{student.company?.name || "Not Assigned"}</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>Progress:</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Pending Entries:</span>
            <Badge variant="outline" className="bg-amber-100 text-amber-800">
              {pendingEntries}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Total Entries:</span>
            <span className="font-medium">{totalEntries}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 gap-2">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/admin/students/${student.id}`}>
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-8 p-0">
              <span className="sr-only">Open menu</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M10 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                <path d="M2 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                <path d="M18 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem asChild>
              <Link href={`/admin/students/${student.id}/edit`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/assignments/new?student=${student.id}`}>Assign Supervisor</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onSelect={(e) => {
                e.preventDefault()
                // Add deletion logic or confirmation dialog
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  )
}

