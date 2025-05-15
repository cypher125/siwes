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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { admin, auth } from "@/lib/api"
import apiInstance from "@/lib/api"
import { Loader2, Plus, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"

const supervisorSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  staff_id: z.string().min(1, "Staff ID is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  department: z.string().min(1, "Department is required"),
  position: z.string().optional(),
  phone_number: z.string().optional(),
  office_address: z.string().optional(),
  specialization: z.string().optional(),
  bio: z.string().optional(),
})

type SupervisorFormValues = z.infer<typeof supervisorSchema>

export function AddSupervisorModal({ 
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
  const form = useForm<SupervisorFormValues>({
    resolver: zodResolver(supervisorSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      staff_id: "",
      password: "",
      department: "",
      position: "",
      phone_number: "",
      office_address: "",
      specialization: "",
      bio: ""
    },
    mode: "onChange"
  })
  
  // Clear any form errors when the modal opens/closes
  useEffect(() => {
    if (open) {
      setFormError(null);
    }
  }, [open]);
  
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

  async function onSubmit(data: SupervisorFormValues) {
    setIsLoading(true);
    setFormError(null);
    
    try {
      // Create registration data
      const formData = {
        ...data,
        role: 'supervisor' as const,
        // Ensure username is set to email for backend user creation
        username: data.email,
        // Ensure other required fields have default values if empty
        position: data.position || "",
        phone_number: data.phone_number || "",
        office_address: data.office_address || "",
        specialization: data.specialization || "",
        bio: data.bio || ""
      }
      
      const response = await auth.register(formData);
      
      if (!response.error) {
        toast({
          title: "Supervisor added successfully",
          description: "The supervisor can now login using their credentials",
        });
        form.reset();
        
        // Close modal and refresh supervisor list if needed
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
        } else if (errorMessage.includes("staff") && errorMessage.includes("exist")) {
          form.setError("staff_id", { 
            type: "manual", 
            message: "Staff ID already exists" 
          });
          setFormError("A supervisor with this staff ID already exists.");
          form.setFocus("staff_id");
        } else if (errorMessage.includes("user") && errorMessage.includes("created")) {
          // This would be for the case where the User object was created but the SupervisorProfile failed
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
        <Button variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add New Supervisor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Supervisor</DialogTitle>
          <DialogDescription>
            Fill out the form below to add a new supervisor to the system.
          </DialogDescription>
        </DialogHeader>
        
        {formError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
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
                      onBlur={handleEmailBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="staff_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff ID</FormLabel>
                    <FormControl>
                      <Input placeholder="SUP/2025/001" {...field} />
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
                        type="password" 
                        placeholder="Enter password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input placeholder="Lecturer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+234 800 0000 000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="office_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Office Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Block A, Room 101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="specialization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialization</FormLabel>
                  <FormControl>
                    <Input placeholder="Computer Science, Networking, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Short biography or professional information" 
                      className="resize-none min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange && onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Supervisor"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 