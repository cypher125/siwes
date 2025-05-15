"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { ApiError } from "@/types/api"
import { BarChart3, FileText, Settings, Users } from "lucide-react"

const formSchema = z
  .object({
    firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
    lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
    email: z
      .string()
      .email({ message: "Please enter a valid email address" })
      .endsWith("@yabatech.edu.ng", { message: "Email must be a Yabatech email" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
    adminCode: z.string().min(6, { message: "Admin code is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export default function AdminRegister() {
  const router = useRouter()
  const { toast } = useToast()
  const { register } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      adminCode: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const result = await register(
        values.email, 
        values.password, 
        values.firstName, 
        values.lastName, 
        'admin',
        { admin_code: values.adminCode }
      )
      
      if (result.success) {
        toast({
          title: "Registration successful",
          description: "Your admin account has been created. You can now log in.",
        })
        router.push("/admin/login")
      } else {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: result.message || "Failed to create admin account. Please try again.",
        })
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "An error occurred. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Registration form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-gradient-to-b from-white to-[#E6E6E6]/30">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block">
              <div className="flex items-center justify-center gap-2">
                <div className="w-12 h-12 relative">
                  <Image src="/images/yct-logo.png" alt="YCT Logo" width={48} height={48} className="object-contain" />
                </div>
                <h1 className="text-2xl font-bold text-[#004C54]">SIWES Portal</h1>
                <div className="w-12 h-12 relative">
                  <Image src="/images/itf-logo.png" alt="ITF Logo" width={48} height={48} className="object-contain" />
                </div>
              </div>
            </Link>
            <p className="mt-2 text-gray-600">Student Industrial Work Experience Scheme</p>
          </div>

          <Card className="border-none shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-center text-[#004C54]">Admin Registration</CardTitle>
              <CardDescription className="text-center">
                Create an admin account to manage the SIWES system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                      name="firstName"
                    render={({ field }) => (
                      <FormItem>
                          <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input
                              placeholder="John"
                            {...field}
                            className="border-[#004C54]/20 focus-visible:ring-[#004C54]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Doe"
                              {...field}
                              className="border-[#004C54]/20 focus-visible:ring-[#004C54]"
                            />
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
                            placeholder="admin@yabatech.edu.ng"
                            {...field}
                            className="border-[#004C54]/20 focus-visible:ring-[#004C54]"
                          />
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
                            placeholder="••••••••"
                            {...field}
                            className="border-[#004C54]/20 focus-visible:ring-[#004C54]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            className="border-[#004C54]/20 focus-visible:ring-[#004C54]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="adminCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin Code</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter admin registration code"
                            {...field}
                            className="border-[#004C54]/20 focus-visible:ring-[#004C54]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-[#004C54] hover:bg-[#004C54]/90" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 pt-0">
              <div className="text-sm text-center text-gray-500">
                Already have an account?{" "}
                <Link href="/admin/login" className="text-[#004C54] hover:underline">
                  Login
                </Link>
              </div>
              <Link href="/" className="text-sm text-center text-[#004C54] hover:underline">
                Back to Home
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Right side - Image and info */}
      <div className="hidden md:flex md:w-1/2 bg-[#004C54] text-white p-8 flex-col justify-center items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFC300]/20 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FFC300]/10 rounded-full -ml-48 -mb-48"></div>

        <div className="relative z-10 max-w-md text-center">
          <h2 className="text-3xl font-bold mb-6">Join as an Administrator</h2>
          <p className="mb-8">
            Become part of the team that manages and oversees the SIWES program at Yaba College of Technology.
          </p>

          <div className="space-y-6 mb-8">
            <div className="flex items-start gap-3">
              <div className="bg-white/10 p-2 rounded-full">
                <Users className="h-5 w-5 text-[#FFC300]" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Manage Users</h3>
                <p className="text-sm text-white/80">Create, update, and manage student and supervisor accounts</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-white/10 p-2 rounded-full">
                <BarChart3 className="h-5 w-5 text-[#FFC300]" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Access Analytics</h3>
                <p className="text-sm text-white/80">View comprehensive reports and program statistics</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-white/10 p-2 rounded-full">
                <FileText className="h-5 w-5 text-[#FFC300]" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Document Management</h3>
                <p className="text-sm text-white/80">Handle student submissions and official documents</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-white/10 p-2 rounded-full">
                <Settings className="h-5 w-5 text-[#FFC300]" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">System Settings</h3>
                <p className="text-sm text-white/80">Configure and maintain the SIWES platform</p>
              </div>
            </div>
          </div>

          <div className="inline-flex items-center justify-center">
            <div className="w-[240px] h-[80px] bg-white/10 rounded-lg flex items-center justify-center">
              <Image src="/images/itf-logo.png" alt="ITF Logo" width={200} height={70} className="object-contain" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

