"use client"

import React from "react"
import { useState, useEffect } from "react"
import { notFound, useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  AlertCircle, 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  Download, 
  FileText, 
  Lightbulb, 
  Loader2, 
  PenLine, 
  X,
  Clock
} from "lucide-react"
import { supervisor } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { format, isValid } from "date-fns"

interface LogbookEntryPageProps {
  params: {
    id: string
    entryId: string
  }
}

const reviewSchema = z.object({
  status: z.enum(["approved", "rejected"], {
    required_error: "Please select whether to approve or reject this entry",
  }),
  feedback: z.string().min(10, {
    message: "Feedback must be at least 10 characters",
  }).max(500, {
    message: "Feedback must not exceed 500 characters",
  }),
})

export default function LogbookEntryPage({ params }: LogbookEntryPageProps) {
  const paramsData = React.use(params)
  const studentId = parseInt(paramsData.id)
  const entryId = parseInt(paramsData.entryId)
  const router = useRouter()
  
  const [student, setStudent] = useState<any>(null)
  const [entry, setEntry] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  
  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      status: "approved",
      feedback: "",
    },
  })

  useEffect(() => {
    async function fetchData() {
      if (isNaN(studentId) || isNaN(entryId)) {
        router.push(`/supervisor/students/${studentId}/logbook`)
        return
      }
      
      setIsLoading(true)
      
      try {
        // Load student and entry details
        const [studentRes, entriesRes] = await Promise.all([
          supervisor.getStudentDetails(studentId),
          supervisor.getStudentLogbook(studentId)
        ])

        if (studentRes.error) {
          toast({
            variant: "destructive",
            title: "Failed to load student",
            description: studentRes.error,
          })
          return router.push("/supervisor/students")
        }
        
        setStudent(studentRes.data)
        
        if (entriesRes.data && Array.isArray(entriesRes.data)) {
          const foundEntry = entriesRes.data.find(e => e.id === entryId)
          if (foundEntry) {
            setEntry(foundEntry)
            
            // If the entry already has feedback and status, pre-fill the form
            if (foundEntry.feedback) {
              form.setValue("feedback", foundEntry.feedback)
            }
            if (foundEntry.status && (foundEntry.status === "approved" || foundEntry.status === "rejected")) {
              form.setValue("status", foundEntry.status)
            }
          } else {
            toast({
              variant: "destructive", 
              title: "Entry not found",
              description: "The requested logbook entry does not exist",
            })
            return router.push(`/supervisor/students/${studentId}/logbook`)
          }
        } else {
          toast({
            variant: "destructive",
            title: "Failed to load logbook entries",
            description: entriesRes.error || "An error occurred while loading entries",
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
    
    fetchData()
  }, [studentId, entryId, toast, router, form])

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return isValid(date) ? format(date, 'MMMM d, yyyy') : 'Invalid date'
  }
  
  async function onSubmit(data: z.infer<typeof reviewSchema>) {
    if (!entry || !student) return
    
    setIsSubmitting(true)
    
    try {
      const response = await supervisor.reviewLogbookEntry(entryId, {
        status: data.status,
        feedback: data.feedback,
      })
      
      if (response.error) {
        toast({
          variant: "destructive",
          title: "Review failed",
          description: response.error,
        })
      } else {
        toast({
          title: "Review submitted",
          description: "Logbook entry has been successfully reviewed",
        })
        
        // Update the local entry data with the new status and feedback
        setEntry({
          ...entry,
          status: data.status,
          feedback: data.feedback,
        })
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit review. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const getStatusBadge = () => {
    if (!entry) return null
    
    switch (entry.status) {
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <CheckCircle2 className="mr-1 h-4 w-4" />
            Approved
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700">
            <X className="mr-1 h-4 w-4" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700">
            <Clock className="mr-1 h-4 w-4" />
            Pending Review
          </Badge>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[#004C54]" />
          <p className="text-muted-foreground">Loading logbook entry...</p>
        </div>
      </div>
    )
  }

  if (!student || !entry) return notFound()

  const fullName = `${student.user.first_name} ${student.user.last_name}`
  const isPending = entry.status === 'pending'

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/supervisor/students/${studentId}/logbook`)}
          className="mb-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Logbook
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column - Entry details */}
        <div className="lg:w-2/3 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    {entry.title}
                  </CardTitle>
                  <div className="flex items-center mt-1 text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-4 w-4" />
                    {formatDate(entry.date)}
                  </div>
                </div>
                {getStatusBadge()}
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <h3 className="font-medium flex items-center mb-2">
                  <FileText className="mr-2 h-5 w-5 text-[#004C54]" />
                  Activities Performed
                </h3>
                <div className="bg-muted/20 p-4 rounded-md whitespace-pre-wrap">
                  {entry.activities}
                </div>
              </div>

              <div>
                <h3 className="font-medium flex items-center mb-2">
                  <Lightbulb className="mr-2 h-5 w-5 text-[#004C54]" />
                  Skills Learned
                </h3>
                <div className="bg-muted/20 p-4 rounded-md whitespace-pre-wrap">
                  {entry.skills_learned || "No skills specified"}
                </div>
              </div>

              {entry.challenges && (
                <div>
                  <h3 className="font-medium flex items-center mb-2">
                    <AlertCircle className="mr-2 h-5 w-5 text-[#004C54]" />
                    Challenges Encountered
                  </h3>
                  <div className="bg-muted/20 p-4 rounded-md whitespace-pre-wrap">
                    {entry.challenges}
                  </div>
                </div>
              )}

              {entry.attachments && (
                <div>
                  <h3 className="font-medium flex items-center mb-2">
                    <Download className="mr-2 h-5 w-5 text-[#004C54]" />
                    Attachments
                  </h3>
                  <Button variant="outline" size="sm" asChild>
                    <a href={entry.attachments} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-1 h-4 w-4" />
                      Download Attachment
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Your feedback section (if already reviewed) */}
          {!isPending && entry.feedback && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <PenLine className="mr-2 h-5 w-5 text-[#004C54]" />
                  Your Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/20 p-4 rounded-md whitespace-pre-wrap">
                  {entry.feedback}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Reset the status and let them review again
                    form.setValue("status", entry.status)
                    form.setValue("feedback", entry.feedback)
                  }}
                >
                  <PenLine className="mr-2 h-4 w-4" />
                  Edit Feedback
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

        {/* Right column - Review form */}
        <div className="lg:w-1/3 space-y-4">
          {/* Student info card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="font-medium">{fullName}</p>
                  <p className="text-sm text-muted-foreground">{student.matric_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Department</p>
                  <p className="text-sm text-muted-foreground">{student.department?.name || "N/A"}</p>
                </div>
                {student.company && (
                  <div>
                    <p className="text-sm font-medium">Company</p>
                    <p className="text-sm text-muted-foreground">{student.company.name}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Review form */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {isPending ? "Review Entry" : "Update Review"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Entry Status</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex gap-6"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="approved" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer flex items-center text-green-700">
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Approve
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="rejected" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer flex items-center text-red-700">
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="feedback"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Feedback</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide constructive feedback about this logbook entry..."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Your feedback will be shared with the student.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      className="bg-[#004C54] hover:bg-[#004C54]/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isPending ? "Submit Review" : "Update Review"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Guide card */}
          <Card className="bg-muted/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Lightbulb className="mr-2 h-4 w-4" />
                Review Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Be specific and constructive in your feedback</li>
                <li>Comment on both strengths and areas for improvement</li>
                <li>Suggest resources or techniques if rejecting an entry</li>
                <li>Ensure feedback is professional and educational</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 