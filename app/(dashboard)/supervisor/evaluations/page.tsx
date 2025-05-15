"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, CheckCircle2, Clock, FileText, Filter, Loader2, Search, SortAsc, SortDesc, XCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { evaluation } from "@/lib/api"
import { Evaluation } from "@/types/api"

export default function EvaluationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("pending")
  const [studentFilter, setStudentFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedEntry, setSelectedEntry] = useState<number | null>(null)
  const [evaluationEntries, setEvaluationEntries] = useState<Evaluation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchEvaluations() {
      setIsLoading(true)
      try {
        const response = await evaluation.getEvaluations()
        if (response.data) {
          setEvaluationEntries(response.data)
        } else if (response.error) {
          toast({
            variant: "destructive",
            title: "Failed to load evaluations",
            description: response.error,
          })
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch evaluations. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvaluations()
  }, [toast])

  // Get unique students for filter
  const students = Array.from(
    new Set(evaluationEntries.map((entry) => entry.student?.user.id))
  ).map((id) => {
    const entry = evaluationEntries.find((e) => e.student?.user.id === id)
    if (!entry) return { name: "Unknown", id: "" }
    return {
      name: `${entry.student?.user.first_name} ${entry.student?.user.last_name}`,
      id: entry.student?.matric_number || "",
    }
  })

  // Helper function to determine status
  const getEntryStatus = (entry: Evaluation) => {
    if (entry.is_approved) return "approved"
    if (entry.feedback) return "rejected"
    return "pending"
  }

  // Filter entries based on search query, status filter, and student filter
  const filteredEntries = evaluationEntries
    .filter((entry) => {
      const studentName = `${entry.student?.user.first_name} ${entry.student?.user.last_name}`.toLowerCase()
      const status = getEntryStatus(entry)
      
      return (
        (entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.comments?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          studentName.includes(searchQuery.toLowerCase())) &&
        (statusFilter === "all" || status === statusFilter) &&
        (studentFilter === "all" || entry.student?.user.id === studentFilter)
      )
    })
    .sort((a, b) => {
      const dateA = new Date(a.date_submitted).getTime()
      const dateB = new Date(b.date_submitted).getTime()
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA
    })

  // Get the selected entry details
  const selectedEntryDetails = selectedEntry
    ? evaluationEntries.find((entry) => entry.id === selectedEntry)
    : null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-amber-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Approved"
      case "pending":
        return "Pending Review"
      case "rejected":
        return "Needs Revision"
      default:
        return "Unknown"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-amber-100 text-amber-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[#004C54]" />
          <p className="text-muted-foreground">Loading evaluations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        {/* Header with title and actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Evaluations</h1>
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">
                Pending ({evaluationEntries.filter((e) => e.status === "pending").length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({evaluationEntries.filter((e) => e.status === "approved").length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({evaluationEntries.filter((e) => e.status === "rejected").length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Search and filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="md:col-span-1">
            <Select value={studentFilter} onValueChange={setStudentFilter}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by student" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                {students.map((student) => (
                  <SelectItem key={student.name} value={student.name}>
                    {student.name} ({student.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {sortOrder === "desc" ? <SortDesc className="mr-2 h-4 w-4" /> : <SortAsc className="mr-2 h-4 w-4" />}
                  Sort by Date
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort by Date</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortOrder("desc")}>
                  <SortDesc className="mr-2 h-4 w-4" />
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("asc")}>
                  <SortAsc className="mr-2 h-4 w-4" />
                  Oldest First
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Entries list */}
          <div className="lg:col-span-2 space-y-4">
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <Card
                  key={entry.id}
                  className={`transition-all hover:shadow-md cursor-pointer ${
                    selectedEntry === entry.id ? "ring-2 ring-[#004C54]" : ""
                  }`}
                  onClick={() => setSelectedEntry(entry.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{entry.title}</CardTitle>
                      <div
                        className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}
                      >
                        {getStatusIcon(entry.status)}
                        <span className="ml-1">{getStatusText(entry.status)}</span>
                      </div>
                    </div>
                    <CardDescription className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {new Date(entry.date_submitted).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      <span className="mx-2">•</span>
                      <Clock className="mr-1 h-3 w-3" />
                      {entry.hours} hours
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                          {entry.student
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{entry.student}</span>
                      <span className="text-xs text-muted-foreground">({entry.student?.matric_number})</span>
                    </div>
                    <p className="text-sm line-clamp-2">{entry.comments}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-end">
                    <Button variant="ghost" size="sm" className="text-[#004C54]">
                      <FileText className="mr-1 h-4 w-4" />
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg">No Entries Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== "all" || studentFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "There are no entries to evaluate at this time"}
                </p>
              </div>
            )}
          </div>

          {/* Entry details */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              {selectedEntryDetails ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{selectedEntryDetails.title}</CardTitle>
                      <Badge className={getStatusColor(selectedEntryDetails.status)}>
                        {getStatusText(selectedEntryDetails.status)}
                      </Badge>
                    </div>
                    <CardDescription>
                      {new Date(selectedEntryDetails.date_submitted).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {selectedEntryDetails.student
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedEntryDetails.student}</p>
                        <p className="text-xs text-muted-foreground">({selectedEntryDetails.student?.matric_number})</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-1">Description</h3>
                      <p className="text-sm">{selectedEntryDetails.comments}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium mb-1">Hours Spent</h3>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                          <span>{selectedEntryDetails.hours} hours</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-1">Skills Applied</h3>
                        <div className="flex flex-wrap gap-1">
                          {selectedEntryDetails.skills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {selectedEntryDetails.feedback && (
                      <div className="p-3 bg-muted rounded-md">
                        <h3 className="text-sm font-medium mb-1">Your Feedback</h3>
                        <p className="text-sm">{selectedEntryDetails.feedback}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between gap-2">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/supervisor/evaluations/${selectedEntryDetails.id}`}>
                        <FileText className="mr-2 h-4 w-4" />
                        Full Details
                      </Link>
                    </Button>
                    {selectedEntryDetails.status === "pending" && (
                      <Button className="w-full bg-[#004C54] hover:bg-[#004C54]/90" asChild>
                        <Link href={`/supervisor/evaluations/${selectedEntryDetails.id}/review`}>Review Entry</Link>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium text-lg">No Entry Selected</h3>
                    <p className="text-muted-foreground">Select an entry from the list to view details</p>
                  </CardContent>
                </Card>
              )}

              {/* Stats card */}
              <Card className="mt-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Evaluation Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold text-amber-600">
                        {evaluationEntries.filter((e) => e.status === "pending").length}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Approved</p>
                      <p className="text-2xl font-bold text-green-600">
                        {evaluationEntries.filter((e) => e.status === "approved").length}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Rejected</p>
                      <p className="text-2xl font-bold text-red-600">
                        {evaluationEntries.filter((e) => e.status === "rejected").length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

