"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { admin, auth } from "@/lib/api"
import apiInstance from "@/lib/api"
import { Loader2, Plus, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"

const studentSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  matric_number: z.string().min(1, "Matriculation number is required"),
  password: z.string().min(1, "Password is required"),
  department: z.string().optional(),
  level: z.string().default("ND1"),
})

type StudentFormValues = z.infer<typeof studentSchema>

export function AddStudentModal({ 
  open, 
  onOpenChange,
  onSuccess
}: { 
  open?: boolean,
  onOpenChange?: (open: boolean) => void,
  onSuccess?: () => void
}) {
  const [departments, setDepartments] = useState<Array<{id: number, name: string}>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const { toast } = useToast()

  // @ts-expect-error - Suppressing type errors for form implementation
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      matric_number: "",
      password: "",
      department: "",
      level: "ND1",
    },
    mode: "onChange"
  })
  
  // Clear any form errors when the modal opens/closes
  useEffect(() => {
    if (open) {
      setFormError(null);
    }
  }, [open]);

  // Watch for changes to matric_number for validation
  const matricNumber = form.watch("matric_number");
  
  // Handle email changes - validate email on blur
  const handleEmailBlur = async () => {
    const email = form.getValues("email");
    if (!email || !form.formState.isValid) return;
    
    try {
      setIsValidating(true);
      
      // Simple check to see if email exists
      try {
        const response = await apiInstance.get(`/accounts/check-email/?email=${encodeURIComponent(email)}`);
        if (response.data?.exists) {
          form.setError("email", { 
            type: "manual", 
            message: "This email is already registered" 
          });
        }
      } catch (error) {
        // Silently handle - this is just a pre-validation
        console.log("Email validation error:", error);
      }
    } finally {
      setIsValidating(false);
    }
  };
  
  // Effect to update password when matric_number changes
  useEffect(() => {
    if (matricNumber) {
      form.setValue("password", matricNumber.toUpperCase());
    }
  }, [matricNumber, form]);

  async function onSubmit(data: StudentFormValues) {
    setIsLoading(true);
    setFormError(null);
    
    try {
      // Ensure password is uppercase version of matric number
      const formData = {
        ...data,
        password: data.matric_number.toUpperCase(),
        role: 'student' as const,
        level: data.level || "ND1", // Use default ND1 if not specified
      }
      
      const response = await auth.register(formData);
      
      if (!response.error) {
        toast({
          title: "Student added successfully",
          description: "The student can now login using their credentials",
        });
        form.reset();
        
        // Close modal and refresh student list if needed
        if (onOpenChange) {
          onOpenChange(false);
        }
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        // Check if the error contains information about duplicates
        const errorMessage = response.error.toLowerCase();
        
        if (errorMessage.includes("email") && errorMessage.includes("exist")) {
          form.setError("email", { 
            type: "manual", 
            message: "Email already exists" 
          });
          setFormError("A user with this email address already exists in the system.");
          form.setFocus("email");
        } else if (errorMessage.includes("matric") && errorMessage.includes("exist")) {
          form.setError("matric_number", { 
            type: "manual", 
            message: "Matriculation number already exists" 
          });
          setFormError("A student with this matriculation number already exists.");
          form.setFocus("matric_number");
        } else if (errorMessage.includes("user") && errorMessage.includes("created")) {
          // This would be for the case where the User object was created but the StudentProfile failed
          setFormError("Account was partially created. Please contact an administrator or try again with different information.");
        } else {
          setFormError(response.error);
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Load departments when the component mounts
  useEffect(() => {
    async function fetchDepartments() {
      try {
        const response = await admin.getDepartments();
        if (response.data) {
          setDepartments(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch departments:", error);
      }
    }

    fetchDepartments();
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-[#004C54] hover:bg-[#004C54]/90">
          <Plus className="mr-2 h-4 w-4" />
          Add New Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Add a new student to the system. They will be able to login using their email and password.
          </DialogDescription>
        </DialogHeader>
        
        {formError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {formError}
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form 
            // @ts-expect-error - Suppressing type errors for form submission handler
            onSubmit={form.handleSubmit(onSubmit)} 
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="john.doe@example.com" 
                      {...field} 
                      onBlur={() => {
                        field.onBlur();
                        handleEmailBlur();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="matric_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matriculation Number</FormLabel>
                  <FormControl>
                    <Input placeholder="SIT/20/123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="text" 
                      {...field} 
                      disabled 
                      className="bg-gray-50"
                    />
                  </FormControl>
                  <FormDescription>
                    Password is automatically set to uppercase matriculation number
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem key={department.id} value={department.id.toString()}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The department can be assigned later if not selected now
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Level</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select student level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ND1">ND1</SelectItem>
                      <SelectItem value="ND2">ND2</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Academic level of the student
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="submit" 
                className="bg-[#004C54] hover:bg-[#004C54]/90"
                disabled={isLoading || isValidating}
              >
                {(isLoading || isValidating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Student
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 