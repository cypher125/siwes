"use client"

import React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { notFound, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ArrowLeft,
  Calendar,
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  FileText, 
  Filter, 
  Loader2,
  Search,
  X
} from "lucide-react"
import { supervisor } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { format, parse, isValid } from "date-fns"

interface LogbookPageProps {
  params: {
    id: string
  }
}

export default function StudentLogbookPage({ params }: LogbookPageProps) {
  const studentId = parseInt(React.use(params).id)
  const router = useRouter()
  const searchParams = useSearchParams()
  const statusFilter = searchParams.get('status') || 'all'
  
  const [student, setStudent] = useState<any>(null)
  const [entries, setEntries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const { toast } = useToast()
  
  const entriesPerPage = 6

  useEffect(() => {
    async function fetchData() {
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
          setEntries(entriesRes.data)
        } else if (entriesRes.error) {
          console.error("Failed to fetch logbook entries:", entriesRes.error)
          toast({
            variant: "destructive",
            title: "Failed to load logbook entries",
            description: entriesRes.error,
          })
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch data. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (isNaN(studentId)) {
      router.push("/supervisor/students")
      return
    }

    fetchData()
  }, [studentId, toast, router])

  const handleFilterChange = (value: string) => {
    // Update URL with the new status filter
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('status')
    } else {
      params.set('status', value)
    }
    router.push(`/supervisor/students/${studentId}/logbook?${params.toString()}`)
  }

  // Filter entries by status and search query
  const filteredEntries = entries.filter(entry => {
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter
    
    const matchesSearch = 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.activities.toLowerCase().includes(searchQuery.toLowerCase()) || 
      entry.skills_learned?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatDate(entry.date).toLowerCase().includes(searchQuery.toLowerCase())
      
    return matchesStatus && matchesSearch
  })
  
  // Paginate entries
  const totalPages = Math.ceil(filteredEntries.length / entriesPerPage)
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  )
  
  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return isValid(date) ? format(date, 'MMMM d, yyyy') : 'Invalid date'
  }
  
  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'approved':
        return "bg-green-50 text-green-700"
      case 'rejected':
        return "bg-red-50 text-red-700"
      default:
        return "bg-amber-50 text-amber-700"
    }
  }
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return "Approved"
      case 'rejected':
        return "Rejected"
      default:
        return "Pending"
    }
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4" />
      case 'rejected':
        return <X className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[#004C54]" />
          <p className="text-muted-foreground">Loading logbook entries...</p>
        </div>
      </div>
    )
  }

  if (!student) return notFound()

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/supervisor/students/${studentId}`)}
            className="mr-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Student
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">
            {student.user.first_name} {student.user.last_name}'s Logbook
          </h2>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            className="max-w-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            defaultValue={statusFilter}
            onValueChange={handleFilterChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entries</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredEntries.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {paginatedEntries.map((entry) => (
              <Card key={entry.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{entry.title}</CardTitle>
                    <Badge 
                      variant="outline"
                      className={getStatusClasses(entry.status)}
                    >
                      {getStatusIcon(entry.status)}
                      <span className="ml-1">{getStatusText(entry.status)}</span>
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(entry.date)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground line-clamp-3">{entry.activities}</p>
                  
                  {entry.feedback && (
                    <div className="mt-4 pt-3 border-t text-sm">
                      <p className="font-medium">Your Feedback:</p>
                      <p className="text-muted-foreground line-clamp-2">{entry.feedback}</p>
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
                    <Link href={`/supervisor/students/${studentId}/logbook/${entry.id}`}>
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
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 py-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-muted/20 rounded-lg">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <h3 className="text-lg font-medium">No Logbook Entries Found</h3>
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== 'all'
              ? "Try adjusting your filters or search query"
              : "The student hasn't submitted any logbook entries yet"}
          </p>
        </div>
      )}

      <div className="border rounded-lg p-4 bg-muted/20">
        <h3 className="font-medium mb-2">What can you do here?</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>View all logbook entries submitted by the student</li>
          <li>Filter entries by status (pending, approved, rejected)</li>
          <li>Search for specific entries by title or content</li>
          <li>Review pending entries and provide feedback</li>
        </ul>
      </div>
    </div>
  )
} 