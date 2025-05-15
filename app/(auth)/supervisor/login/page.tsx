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

const formSchema = z.object({
  staffId: z.string().min(4, { message: "Please enter a valid staff ID" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

export default function SupervisorLogin() {
  const router = useRouter()
  const { toast } = useToast()
  const { loginWithStaffId } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      staffId: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const result = await loginWithStaffId(values.staffId, values.password)
      console.log('Login result:', result)
      
      if (result.success) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        })
        
        // Hard-coded redirect to supervisor dashboard for now
        console.log('Redirecting directly to supervisor dashboard')
        router.push("/supervisor")
        
        /* 
        // Original role-based redirection
        if (result.role === 'student') {
          console.log('Redirecting to student dashboard')
          router.push("/student")
        } else if (result.role === 'supervisor') {
          console.log('Redirecting to supervisor dashboard')
          router.push("/supervisor") 
        } else if (result.role === 'admin') {
          console.log('Redirecting to admin dashboard')
          router.push("/admin")
        } else {
          console.log('Unknown role, redirecting to home')
          router.push("/")
        }
        */
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid staff ID or password. Please try again.",
        })
      }
    } catch (error) {
      const apiError = error as ApiError
      toast({
        variant: "destructive",
        title: "Login failed",
        description: apiError.message || "Invalid staff ID or password. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Login form */}
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
              <CardTitle className="text-2xl font-bold text-center text-[#004C54]">Supervisor Login</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access the supervisor portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="staffId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Staff ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="SUP001"
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
                        <div className="flex items-center justify-between">
                          <FormLabel>Password</FormLabel>
                          <Link href="#" className="text-xs text-[#004C54] hover:underline">
                            Forgot password?
                          </Link>
                        </div>
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
                  <Button type="submit" className="w-full bg-[#004C54] hover:bg-[#004C54]/90" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 pt-0">
              <div className="text-sm text-center text-gray-500">Need help? Contact the SIWES coordinator</div>
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
          <h2 className="text-3xl font-bold mb-6">Welcome to the Supervisor Portal</h2>
          <p className="mb-8">
            Guide and evaluate students during their industrial training experience with our comprehensive supervisor
            tools.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold text-[#FFC300]">Student Monitoring</h3>
              <p className="text-sm mt-1">Track student progress and activities</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold text-[#FFC300]">Logbook Review</h3>
              <p className="text-sm mt-1">Review and approve student entries</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold text-[#FFC300]">Performance Evaluation</h3>
              <p className="text-sm mt-1">Evaluate student performance</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold text-[#FFC300]">Report Generation</h3>
              <p className="text-sm mt-1">Generate comprehensive reports</p>
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

