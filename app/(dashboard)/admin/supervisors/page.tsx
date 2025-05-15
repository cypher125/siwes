"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Download, Filter, Loader2, Plus, Search, SortAsc, SortDesc, Trash2, User, Users } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { admin } from "@/lib/api"
import { AddSupervisorModal } from "@/components/supervisors/add-supervisor-modal"

export default function SupervisorsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [supervisors, setSupervisors] = useState([])
  const [departments, setDepartments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [supervisorModalOpen, setSupervisorModalOpen] = useState(false)
  const { toast } = useToast()

  async function fetchData() {
    setIsLoading(true)
    try {
      // Fetch supervisors
      const supervisorsResponse = await admin.getSupervisors()
      if (supervisorsResponse.data) {
        setSupervisors(supervisorsResponse.data)
      } else if (supervisorsResponse.error) {
        toast({
          variant: "destructive",
          title: "Failed to load supervisors",
          description: supervisorsResponse.error,
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
        description: "Failed to fetch supervisors data. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [toast])

  // Get unique departments for filter
  const departmentOptions = departments.map(dept => ({
    id: dept.id,
    name: dept.name
  }))

  // Helper function to determine supervisor status
  const getSupervisorStatus = (supervisor) => {
    return supervisor.is_active ? "active" : "inactive"
  }

  // Filter supervisors based on search query, status filter, and department filter
  const filteredSupervisors = supervisors
    .filter(
      (supervisor) => {
        const fullName = `${supervisor.user.first_name} ${supervisor.user.last_name}`.toLowerCase()
        const status = getSupervisorStatus(supervisor)
        
        return (
          (fullName.includes(searchQuery.toLowerCase()) ||
            supervisor.staff_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            supervisor.department?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            supervisor.user.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
          (statusFilter === "all" || status === statusFilter) &&
          (departmentFilter === "all" || supervisor.department?.id.toString() === departmentFilter)
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

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[#004C54]" />
          <p className="text-muted-foreground">Loading supervisors information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Supervisors Management</h2>
          <p className="text-muted-foreground">Manage and monitor all SIWES supervisors</p>
        </div>
        <div className="flex-shrink-0" id="add-supervisor-container">
          <Button 
            className="bg-[#004C54] hover:bg-[#004C54]/90"
            onClick={() => setSupervisorModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Supervisor
          </Button>
        </div>
        <AddSupervisorModal
          open={supervisorModalOpen}
          onOpenChange={setSupervisorModalOpen}
          onSuccess={() => {
            // Refresh the supervisors list after adding a new one
            fetchData();
          }}
        />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
            className={statusFilter === "all" ? "bg-[#004C54] hover:bg-[#004C54]/90" : ""}
          >
            All
          </Button>
          <Button
            variant={statusFilter === "active" ? "default" : "outline"}
            onClick={() => setStatusFilter("active")}
            className={statusFilter === "active" ? "bg-[#004C54] hover:bg-[#004C54]/90" : ""}
          >
            Active
          </Button>
          <Button
            variant={statusFilter === "inactive" ? "default" : "outline"}
            onClick={() => setStatusFilter("inactive")}
            className={statusFilter === "inactive" ? "bg-[#004C54] hover:bg-[#004C54]/90" : ""}
          >
            Inactive
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search supervisors..."
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSupervisors.length > 0 ? (
          filteredSupervisors.map((supervisor) => (
            <SupervisorCard key={supervisor.id} supervisor={supervisor} />
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <h3 className="font-medium text-lg">No Supervisors Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all" || departmentFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Start by adding your first supervisor"}
            </p>
            <Button 
              className="bg-[#004C54] hover:bg-[#004C54]/90"
              onClick={() => setSupervisorModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Supervisor
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function SupervisorCard({ supervisor }: { supervisor: any }) {
  const fullName = `${supervisor.user.first_name} ${supervisor.user.last_name}`
  const initials = `${supervisor.user.first_name[0]}${supervisor.user.last_name[0]}`
  const status = supervisor.is_active ? "active" : "inactive" 
  const studentCount = supervisor.student_count || 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">{fullName}</CardTitle>
          <Badge
            variant="outline"
            className={status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
          >
            {status}
          </Badge>
        </div>
        <CardDescription className="flex items-center">
          <span>{supervisor.staff_id}</span>
          <span className="mx-2">•</span>
          <span>{supervisor.department?.name}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span>Email:</span>
          <span className="font-medium">{supervisor.user.email}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>Phone:</span>
          <span className="font-medium">{supervisor.phone_number || "N/A"}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>Position:</span>
          <span className="font-medium">{supervisor.position || "N/A"}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>Students Assigned:</span>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {studentCount}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="pt-2 gap-2">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/admin/supervisors/${supervisor.id}`}>
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
              <Link href={`/admin/supervisors/${supervisor.id}/edit`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/assignments?supervisor=${supervisor.id}`}>View Students</Link>
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

