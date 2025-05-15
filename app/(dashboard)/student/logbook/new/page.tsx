"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { CalendarIcon, Clock, Loader2, Save, X } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { logbook } from "@/lib/api"

// List of available skills for selection
const availableSkills = [
  { value: "javascript", label: "JavaScript" },
  { value: "react", label: "React" },
  { value: "node", label: "Node.js" },
  { value: "express", label: "Express" },
  { value: "sql", label: "SQL" },
  { value: "mongodb", label: "MongoDB" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "tailwind", label: "Tailwind CSS" },
  { value: "typescript", label: "TypeScript" },
  { value: "git", label: "Git" },
  { value: "api", label: "API Integration" },
  { value: "testing", label: "Testing" },
  { value: "ui-ux", label: "UI/UX Design" },
  { value: "database", label: "Database Design" },
  { value: "security", label: "Security" },
  { value: "performance", label: "Performance Optimization" },
  { value: "deployment", label: "Deployment" },
]

const formSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Title must be at least 5 characters" })
    .max(100, { message: "Title must not exceed 100 characters" }),
  date: z.date({ required_error: "Please select a date" }),
  hours: z.coerce
    .number()
    .min(1, { message: "Hours must be at least 1" })
    .max(12, { message: "Hours cannot exceed 12" }),
  description: z
    .string()
    .min(50, { message: "Description must be at least 50 characters" })
    .max(1000, { message: "Description must not exceed 1000 characters" }),
  skills: z.array(z.string()).min(1, { message: "Please select at least one skill" }),
  learningOutcomes: z
    .string()
    .min(20, { message: "Learning outcomes must be at least 20 characters" })
    .max(500, { message: "Learning outcomes must not exceed 500 characters" }),
})

export default function NewLogbookEntryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [skillsOpen, setSkillsOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      date: new Date(),
      hours: 1,
      description: "",
      skills: [],
      learningOutcomes: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      const response = await logbook.createEntry({
        title: values.title,
        date: format(values.date, "yyyy-MM-dd"),
        activities: values.description,
        hours_spent: values.hours,
        skills_learned: values.learningOutcomes,
        challenges: "",
        skills: values.skills,
      })

      if (response.data) {
        toast({
          title: "Entry submitted successfully",
          description: "Your logbook entry has been submitted for review.",
        })
        router.push("/student/logbook")
      } else if (response.error) {
        toast({
          variant: "destructive",
          title: "Submission failed",
          description: response.error,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: "An error occurred while submitting your entry. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedSkills = form.watch("skills")

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">New Logbook Entry</h1>
          <Button variant="outline" size="icon" asChild>
            <Link href="/student/logbook">
              <X className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New Entry</CardTitle>
            <CardDescription>Record your daily activities, tasks, and learning outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entry Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Database Implementation" {...field} />
                      </FormControl>
                      <FormDescription>A concise title describing the main task or activity</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date() || date < new Date("2025-01-01")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>The date when the activity was performed</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hours Spent</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <Input type="number" min={1} max={12} {...field} className="w-20 mr-2" />
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </FormControl>
                        <FormDescription>Number of hours spent on this activity (1-12)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide a detailed description of the tasks performed..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Detailed description of the activities, tasks, and responsibilities
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Skills Applied</FormLabel>
                      <Popover open={skillsOpen} onOpenChange={setSkillsOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn("w-full justify-between", !field.value.length && "text-muted-foreground")}
                            >
                              {field.value.length > 0
                                ? `${field.value.length} skill${field.value.length > 1 ? "s" : ""} selected`
                                : "Select skills"}
                              <CalendarIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search skills..." />
                            <CommandList>
                              <CommandEmpty>No skills found.</CommandEmpty>
                              <CommandGroup className="max-h-64 overflow-auto">
                                {availableSkills.map((skill) => (
                                  <CommandItem
                                    key={skill.value}
                                    value={skill.value}
                                    onSelect={() => {
                                      const currentValues = new Set(field.value)
                                      if (currentValues.has(skill.value)) {
                                        currentValues.delete(skill.value)
                                      } else {
                                        currentValues.add(skill.value)
                                      }
                                      field.onChange(Array.from(currentValues))
                                    }}
                                  >
                                    <div className="flex items-center">
                                      {skill.label}
                                      {field.value.includes(skill.value) && (
                                        <span className="ml-auto text-green-600">✓</span>
                                      )}
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      {field.value.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {field.value.map((skill) => {
                            const skillLabel = availableSkills.find((s) => s.value === skill)?.label || skill
                            return (
                              <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                                {skillLabel}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 hover:bg-transparent"
                                  onClick={() => {
                                    const currentValues = new Set(field.value)
                                    currentValues.delete(skill)
                                    field.onChange(Array.from(currentValues))
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                  <span className="sr-only">Remove {skillLabel}</span>
                                </Button>
                              </Badge>
                            )
                          })}
                        </div>
                      )}

                      <FormDescription>Select the skills you applied during this activity</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="learningOutcomes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Learning Outcomes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What did you learn from this experience?"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Describe what you learned and how it relates to your academic program
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" asChild>
                    <Link href="/student/logbook">Cancel</Link>
                  </Button>
                  <Button type="submit" className="bg-[#004C54] hover:bg-[#004C54]/90" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Submit Entry
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

