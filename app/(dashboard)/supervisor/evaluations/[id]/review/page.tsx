"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Clock, Loader2, Save, ThumbsDown, ThumbsUp, X } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { evaluation } from "@/lib/api"

const formSchema = z.object({
  decision: z.enum(["approve", "revise"], {
    required_error: "Please select a decision",
  }),
  feedback: z.string().min(10, {
    message: "Feedback must be at least 10 characters",
  }),
  rating: z.enum(["1", "2", "3", "4", "5"], {
    required_error: "Please provide a rating",
  }),
})

export default function ReviewEntryPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [entryData, setEntryData] = useState<any>(null)

  const entryId = Number(params.id)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      decision: undefined,
      feedback: "",
      rating: undefined,
    },
  })

  useEffect(() => {
    async function fetchEntry() {
      if (!entryId) return
      
      setIsLoading(true)
      try {
        const response = await evaluation.getEvaluationById(entryId)
        if (response.data) {
          setEntryData(response.data)
        } else if (response.error) {
          toast({
            variant: "destructive",
            title: "Failed to load entry",
            description: response.error,
          })
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch entry data. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchEntry()
  }, [entryId, toast])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!entryId) return
    
    setIsSubmitting(true)

    try {
      const response = await evaluation.submitFeedback(entryId, {
        is_approved: values.decision === "approve",
        feedback: values.feedback,
        rating: parseInt(values.rating),
      })
      
      if (response.data) {
      toast({
        title: values.decision === "approve" ? "Entry approved" : "Revision requested",
        description:
          values.decision === "approve"
            ? "The logbook entry has been approved and the student has been notified."
            : "The student has been notified to revise their entry based on your feedback.",
      })

        // Redirect back to evaluations list
      router.push("/supervisor/evaluations")
      } else if (response.error) {
        toast({
          variant: "destructive",
          title: "Failed to submit feedback",
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
  
  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[#004C54]" />
          <p className="text-muted-foreground">Loading entry details...</p>
        </div>
      </div>
    )
  }
  
  if (!entryData) {
    return (
      <div className="container py-8">
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Entry Not Found</h1>
            <Button variant="outline" size="icon" asChild>
              <Link href="/supervisor/evaluations">
                <X className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">The requested entry could not be found.</p>
              <Button asChild>
                <Link href="/supervisor/evaluations">Return to Evaluations</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  // Helper function to get initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
  }
  
  const studentName = `${entryData.student.user.first_name} ${entryData.student.user.last_name}`
  const formattedDate = new Date(entryData.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  
  // Get skills from a comma-separated string in the API or use empty array
  const skills = entryData.skills_learned 
    ? entryData.skills_learned.split(',').map((s: string) => s.trim()) 
    : []

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Review Logbook Entry</h1>
          <Button variant="outline" size="icon" asChild>
            <Link href="/supervisor/evaluations">
              <X className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Entry details card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{entryData.title}</CardTitle>
              <Badge className="bg-amber-100 text-amber-800">
                <Clock className="mr-1 h-3 w-3" />
                Pending Review
              </Badge>
            </div>
            <CardDescription className="flex items-center">
              <Calendar className="mr-1 h-3 w-3" />
              {formattedDate}
              <span className="mx-2">•</span>
              <Clock className="mr-1 h-3 w-3" />
              {entryData.hours || 8} hours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(studentName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{studentName}</p>
                <p className="text-xs text-muted-foreground">{entryData.student.matric_number}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-1">Description</h3>
              <p className="text-sm">{entryData.activities}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-1">Learning Outcomes</h3>
              <p className="text-sm">{entryData.skills_learned || "No learning outcomes provided."}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-1">Challenges</h3>
              <p className="text-sm">{entryData.challenges || "No challenges reported."}</p>
            </div>

            {skills.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-1">Skills Applied</h3>
              <div className="flex flex-wrap gap-1">
                  {skills.map((skill, index) => (
                  <Badge key={index} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            )}
          </CardContent>
        </Card>

        {/* Review form */}
        <Card>
          <CardHeader>
            <CardTitle>Provide Feedback</CardTitle>
            <CardDescription>Review the logbook entry and provide feedback to the student</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="decision"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Decision</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="approve" id="approve" />
                            <label htmlFor="approve" className="flex items-center cursor-pointer">
                              <ThumbsUp className="h-4 w-4 text-green-600 mr-2" />
                              <span>Approve Entry</span>
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="revise" id="revise" />
                            <label htmlFor="revise" className="flex items-center cursor-pointer">
                              <ThumbsDown className="h-4 w-4 text-red-600 mr-2" />
                              <span>Request Revision</span>
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormDescription>
                        Choose whether to approve this entry or request revisions from the student
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Quality Rating</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-2"
                        >
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <div key={rating} className="flex flex-col items-center">
                              <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} className="sr-only" />
                              <label
                                htmlFor={`rating-${rating}`}
                                className={`w-10 h-10 flex items-center justify-center rounded-full cursor-pointer border ${
                                  field.value === rating.toString()
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-muted"
                                }`}
                              >
                                {rating}
                              </label>
                              <span className="text-xs mt-1">
                                {rating === 1
                                  ? "Poor"
                                  : rating === 2
                                    ? "Fair"
                                    : rating === 3
                                      ? "Good"
                                      : rating === 4
                                        ? "Very Good"
                                        : "Excellent"}
                              </span>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormDescription>
                        Rate the quality of this logbook entry from 1 (poor) to 5 (excellent)
                      </FormDescription>
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
                          placeholder="Provide constructive feedback to the student about this entry..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Your feedback will be shared with the student to help them improve
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" asChild>
                    <Link href="/supervisor/evaluations">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-[#004C54] hover:bg-[#004C54]/90">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Submit Review
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

