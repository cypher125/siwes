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

const formSchema = z.object({
  email: z.string()
    .email({ message: "Please enter a valid email address" })
    .endsWith("@yabatech.edu.ng", { message: "Must be a Yabatech email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})

export default function AdminLogin() {
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const result = await login(values.email, values.password)
      if (result.success) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        })
        
        // Navigate to the appropriate dashboard based on role
        if (result.role === 'ADMIN') {
          router.push("/admin")
        } else {
          toast({
            variant: "destructive",
            title: "Access denied",
            description: "This account does not have admin privileges.",
          })
          return
        }
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
        })
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "An error occurred during login. Please try again.",
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
              <CardTitle className="text-2xl font-bold text-center text-[#004C54]">Admin Login</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access the admin dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <div className="text-sm text-center text-gray-500">
                Don&apos;t have an account?{" "}
                <Link href="/admin/register" className="text-[#004C54] hover:underline">
                  Register
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
          <h2 className="text-3xl font-bold mb-6">Admin Dashboard Access</h2>
          <p className="mb-8">
            Manage the SIWES program efficiently with comprehensive tools for overseeing students, supervisors, and the
            entire industrial training process.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold text-[#FFC300]">User Management</h3>
              <p className="text-sm mt-1">Manage students and supervisors accounts</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold text-[#FFC300]">Program Analytics</h3>
              <p className="text-sm mt-1">Access detailed reports and statistics</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold text-[#FFC300]">Supervisor Assignment</h3>
              <p className="text-sm mt-1">Assign supervisors to students</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold text-[#FFC300]">System Configuration</h3>
              <p className="text-sm mt-1">Configure system settings and parameters</p>
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

