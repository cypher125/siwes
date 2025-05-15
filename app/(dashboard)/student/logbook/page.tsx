"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  PlusCircle,
  Search,
  SortAsc,
  SortDesc,
  XCircle,
  Loader2,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { logbook } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { LogbookEntry } from "@/types/api"

export default function LogbookPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedEntry, setSelectedEntry] = useState<number | null>(null)
  const [entries, setEntries] = useState<LogbookEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchLogbookEntries() {
      setIsLoading(true)
      try {
        const response = await logbook.getEntries()
        if (response.data) {
          setEntries(response.data)
        } else if (response.error) {
          toast({
            variant: "destructive",
            title: "Failed to load logbook entries",
            description: response.error,
          })
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch logbook entries. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLogbookEntries()
  }, [toast])

  // Filter entries based on search query and status filter
  const filteredEntries = entries
    .filter(
      (entry) =>
        (entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.activities?.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (statusFilter === "all" || (statusFilter === "approved" && entry.is_approved) || 
                                 (statusFilter === "pending" && !entry.is_approved && !entry.feedback) ||
                                 (statusFilter === "rejected" && !entry.is_approved && entry.feedback))
    )
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA
    })

  // Get the selected entry details
  const selectedEntryDetails = selectedEntry ? entries.find((entry) => entry.id === selectedEntry) : null

  const getEntryStatus = (entry: LogbookEntry): "approved" | "pending" | "rejected" => {
    if (entry.is_approved) return "approved"
    return entry.feedback ? "rejected" : "pending"
  }

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

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        {/* Header with title and actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Logbook Entries</h1>
          <Button asChild className="bg-[#004C54] hover:bg-[#004C54]/90 w-full sm:w-auto">
            <Link href="/student/logbook/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Entry
            </Link>
          </Button>
        </div>

        {/* Search and filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entries</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Needs Revision</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  {sortOrder === "desc" ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
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
                        className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getEntryStatus(entry))}`}
                      >
                        {getStatusIcon(getEntryStatus(entry))}
                        <span className="ml-1">{getStatusText(getEntryStatus(entry))}</span>
                      </div>
                    </div>
                    <CardDescription className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {new Date(entry.date).toLocaleDateString("en-US", {
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
                    <p className="text-sm line-clamp-2">{entry.activities}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.skills?.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-between">
                    <div className="text-xs text-muted-foreground">Supervisor: {entry.supervisor}</div>
                    <Button variant="ghost" size="sm" className="text-[#004C54]">
                      <FileText className="mr-1 h-4 w-4" />
                      View
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg">No Entries Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Start by creating your first logbook entry"}
                </p>
                <Button asChild className="mt-4 bg-[#004C54] hover:bg-[#004C54]/90">
                  <Link href="/student/logbook/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Entry
                  </Link>
                </Button>
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
                      <Badge className={getStatusColor(getEntryStatus(selectedEntryDetails))}>
                        {getStatusText(getEntryStatus(selectedEntryDetails))}
                      </Badge>
                    </div>
                    <CardDescription>
                      {new Date(selectedEntryDetails.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Description</h3>
                      <p className="text-sm">{selectedEntryDetails.activities}</p>
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
                        <h3 className="text-sm font-medium mb-1">Supervisor</h3>
                        <div className="flex items-center">
                          <Avatar className="h-5 w-5 mr-1">
                            <AvatarFallback className="text-[10px]">SJ</AvatarFallback>
                          </Avatar>
                          <span>{selectedEntryDetails.supervisor}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-1">Skills Applied</h3>
                      <div className="flex flex-wrap gap-1">
                        {selectedEntryDetails.skills?.map((skill, index) => (
                          <Badge key={index} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {selectedEntryDetails.feedback && (
                      <div className="p-3 bg-muted rounded-md">
                        <h3 className="text-sm font-medium mb-1">Supervisor Feedback</h3>
                        <p className="text-sm">{selectedEntryDetails.feedback}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between gap-2">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/student/logbook/${selectedEntryDetails.id}`}>
                        <FileText className="mr-2 h-4 w-4" />
                        Full Details
                      </Link>
                    </Button>
                    {getEntryStatus(selectedEntryDetails) === "rejected" && (
                      <Button className="w-full bg-[#004C54] hover:bg-[#004C54]/90" asChild>
                        <Link href={`/student/logbook/${selectedEntryDetails.id}/edit`}>Edit Entry</Link>
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
                  <CardTitle className="text-lg">Logbook Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Entries</p>
                      <p className="text-2xl font-bold">{entries.length}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Approved</p>
                      <p className="text-2xl font-bold text-green-600">
                        {entries.filter((e) => e.is_approved).length}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold text-amber-600">
                        {entries.filter((e) => !e.is_approved && !e.feedback).length}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Needs Revision</p>
                      <p className="text-2xl font-bold text-red-600">
                        {entries.filter((e) => !e.is_approved && e.feedback).length}
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

