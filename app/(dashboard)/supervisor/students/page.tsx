"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { BarChart, CheckCircle2, Clock, FileText, Search, User, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supervisor } from "@/lib/api"


export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchStudents() {
      setIsLoading(true)
      try {
        const response = await supervisor.getAssignedStudents()
        if (response.data) {
          setStudents(response.data)
        } else if (response.error) {
          toast({
            variant: "destructive",
            title: "Failed to load students",
            description: response.error,
          })
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

    fetchStudents()
  }, [toast])

  const filteredStudents = students.filter(
    (student) => {
      const fullName = `${student.user.first_name} ${student.user.last_name}`.toLowerCase()
      return (
        fullName.includes(searchQuery.toLowerCase()) ||
        student.matric_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.department?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.company?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
  )

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
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Assigned Students</h2>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search students..."
          className="max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredStudents.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/20 rounded-lg">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <h3 className="text-lg font-medium">No Students Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? "Try adjusting your search query" : "You don't have any students assigned to you yet"}
          </p>
        </div>
      )}
    </div>
  )
}

function StudentCard({ student }: { student: any }) {
  // Get initials for avatar
  const getInitials = () => {
    if (!student?.user) return "ST";
    return `${student.user.first_name[0]}${student.user.last_name[0]}`;
  };

  // Calculate progress percentage
  const progress = student.progress || 0;
  
  // Pending entries count
  const pendingEntries = student.pending_entries || 0;
  
  // Total entries
  const totalEntries = student.entries_count || 0;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{student.user.first_name} {student.user.last_name}</CardTitle>
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              progress >= 75
                ? "bg-green-100 text-green-800"
                : progress >= 50
                  ? "bg-amber-100 text-amber-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {progress}% Complete
          </div>
        </div>
        <CardDescription>{student.matric_number}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Department</p>
            <p className="font-medium">{student.department?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Company</p>
            <p className="font-medium">{student.company?.name || 'Not set'}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <FileText className="mr-1 h-4 w-4 text-muted-foreground" />
            <span>{totalEntries} Entries</span>
          </div>
          {pendingEntries > 0 ? (
            <div className="flex items-center text-amber-600">
              <Clock className="mr-1 h-4 w-4" />
              <span>{pendingEntries} Pending</span>
            </div>
          ) : (
            <div className="flex items-center text-green-600">
              <CheckCircle2 className="mr-1 h-4 w-4" />
              <span>All Reviewed</span>
            </div>
          )}
        </div>

        <div className="flex justify-between space-x-2">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href={`/supervisor/students/${student.id}`}>
              <User className="mr-1 h-4 w-4" />
              View Profile
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href={`/supervisor/students/${student.id}/logbook`}>
              <FileText className="mr-1 h-4 w-4" />
              View Logbook
            </Link>
          </Button>
        </div>
        <Button size="sm" className="w-full bg-[#004C54] hover:bg-[#004C54]/90" asChild>
          <Link href={`/supervisor/evaluations?student=${student.id}`}>
            <BarChart className="mr-1 h-4 w-4" />
            Evaluate
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

