"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Building, Calendar, Edit, Loader2, Mail, MapPin, Phone, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { student } from "@/lib/api"
import { StudentProfile } from "@/types/api"

// Default profile structure for new users or when API fails
const defaultProfile = {
  personal: {
    name: "",
    matricNumber: "",
    email: "",
    phone: "",
    department: "",
    level: "",
    address: "",
    bio: "",
  },
  siwes: {
    company: "",
    position: "Student Intern",
    supervisor: "",
    supervisorEmail: "",
    supervisorPhone: "",
    startDate: "",
    endDate: "",
    address: "",
    skills: [],
  },
  academic: {
    institution: "Yaba College of Technology",
    program: "",
    gpa: "",
    academicAdvisor: "",
    advisorEmail: "",
    coursework: [],
  },
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState(defaultProfile)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await student.getProfile()
        if (response.data) {
          // Transform API data to match our form structure
          const profile = response.data
          setFormData({
            personal: {
              name: `${profile.user.first_name} ${profile.user.last_name}`,
              matricNumber: profile.matric_number || "",
              email: profile.user.email || "",
              phone: profile.phone_number || "",
              department: profile.department?.name || "",
              level: profile.level ? `${profile.level} Level` : "",
              address: profile.address || "",
              bio: profile.bio || "",
            },
            siwes: {
              company: profile.company?.name || "",
              position: "Student Intern",
              supervisor: profile.supervisor ? `${profile.supervisor.first_name} ${profile.supervisor.last_name}` : "",
              supervisorEmail: profile.supervisor?.email || "",
              supervisorPhone: profile.supervisor_profile?.phone_number || "",
              startDate: profile.it_start_date || "",
              endDate: profile.it_end_date || "",
              address: profile.company?.address || "",
              skills: profile.skills || [],
            },
            academic: {
              institution: "Yaba College of Technology",
              program: profile.department?.name || "",
              gpa: "",
              academicAdvisor: "",
              advisorEmail: "",
              coursework: [],
            },
          })
        } else if (response.error) {
          toast({
            variant: "destructive",
            title: "Failed to load profile",
            description: response.error,
          })
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile information. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [toast])

  const handleInputChange = (section: keyof typeof formData, field: string, value: string) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value,
      },
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Transform form data back to API format
      const apiData = {
        phone_number: formData.personal.phone,
        address: formData.personal.address,
        bio: formData.personal.bio,
      }
      
      const response = await student.updateProfile(apiData)
      
      if (response.data) {
        toast({
          title: "Profile updated",
          description: "Your profile information has been saved successfully.",
        })
        setIsEditing(false)
      } else if (response.error) {
        toast({
          variant: "destructive",
          title: "Update failed",
          description: response.error,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "An error occurred while updating your profile. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[#004C54]" />
          <p className="text-muted-foreground">Loading profile information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <Button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className={isEditing ? "bg-green-600 hover:bg-green-700" : "bg-[#004C54] hover:bg-[#004C54]/90"}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isEditing ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src="/placeholder.svg?height=96&width=96" alt="@student" />
                <AvatarFallback className="text-2xl bg-[#004C54] text-white">JD</AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold">{formData.personal.name}</h2>
                <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                  <Badge variant="outline" className="bg-[#004C54]/10 text-[#004C54] hover:bg-[#004C54]/20">
                    {formData.personal.matricNumber}
                  </Badge>
                  <Badge variant="outline" className="bg-[#FFC300]/10 text-[#004C54] hover:bg-[#FFC300]/20">
                    {formData.personal.department}
                  </Badge>
                  <Badge variant="outline" className="bg-[#004C54]/10 text-[#004C54] hover:bg-[#004C54]/20">
                    {formData.personal.level}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formData.personal.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formData.personal.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formData.siwes.company}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formData.personal.address}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="bg-muted/50 w-full justify-start">
            <TabsTrigger value="personal">Personal Information</TabsTrigger>
            <TabsTrigger value="siwes">SIWES Details</TabsTrigger>
            <TabsTrigger value="academic">Academic Information</TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your basic personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.personal.name}
                      onChange={(e) => handleInputChange("personal", "name", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="matricNumber">Matriculation Number</Label>
                    <Input
                      id="matricNumber"
                      value={formData.personal.matricNumber}
                      disabled={true} // Always disabled as matric number shouldn't change
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.personal.email}
                      onChange={(e) => handleInputChange("personal", "email", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.personal.phone}
                      onChange={(e) => handleInputChange("personal", "phone", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formData.personal.department}
                      disabled={true} // Department shouldn't be editable by student
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level">Level</Label>
                    <Input
                      id="level"
                      value={formData.personal.level}
                      disabled={true} // Level shouldn't be editable by student
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.personal.address}
                      onChange={(e) => handleInputChange("personal", "address", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.personal.bio}
                      onChange={(e) => handleInputChange("personal", "bio", e.target.value)}
                      disabled={!isEditing}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SIWES Details Tab */}
          <TabsContent value="siwes">
            <Card>
              <CardHeader>
                <CardTitle>SIWES Information</CardTitle>
                <CardDescription>Details about your industrial training</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      value={formData.siwes.company}
                      onChange={(e) => handleInputChange("siwes", "company", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position/Role</Label>
                    <Input
                      id="position"
                      value={formData.siwes.position}
                      onChange={(e) => handleInputChange("siwes", "position", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supervisor">Supervisor Name</Label>
                    <Input
                      id="supervisor"
                      value={formData.siwes.supervisor}
                      onChange={(e) => handleInputChange("siwes", "supervisor", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supervisorEmail">Supervisor Email</Label>
                    <Input
                      id="supervisorEmail"
                      type="email"
                      value={formData.siwes.supervisorEmail}
                      onChange={(e) => handleInputChange("siwes", "supervisorEmail", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supervisorPhone">Supervisor Phone</Label>
                    <Input
                      id="supervisorPhone"
                      value={formData.siwes.supervisorPhone}
                      onChange={(e) => handleInputChange("siwes", "supervisorPhone", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyAddress">Company Address</Label>
                    <Input
                      id="companyAddress"
                      value={formData.siwes.address}
                      onChange={(e) => handleInputChange("siwes", "address", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      value={formData.siwes.startDate}
                      disabled={true} // Dates are typically set by admin
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      value={formData.siwes.endDate}
                      disabled={true} // Dates are typically set by admin
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <Label>Skills Acquired</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.siwes.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Information Tab */}
          <TabsContent value="academic">
            <Card>
              <CardHeader>
                <CardTitle>Academic Information</CardTitle>
                <CardDescription>Your academic details and coursework</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="institution">Institution</Label>
                    <Input
                      id="institution"
                      value={formData.academic.institution}
                      disabled={true} // Institution is fixed
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="program">Program</Label>
                    <Input
                      id="program"
                      value={formData.academic.program}
                      disabled={true} // Program is fixed
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gpa">GPA</Label>
                    <Input
                      id="gpa"
                      value={formData.academic.gpa}
                      disabled={true} // GPA is typically set by admin
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="advisor">Academic Advisor</Label>
                    <Input
                      id="advisor"
                      value={formData.academic.academicAdvisor}
                      disabled={true} // Advisor is typically set by admin
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="advisorEmail">Advisor Email</Label>
                    <Input
                      id="advisorEmail"
                      value={formData.academic.advisorEmail}
                      disabled={true} // Advisor email is typically set by admin
                    />
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <Label>Relevant Coursework</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {formData.academic.coursework.map((course, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{course}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Academic information is managed by your department and cannot be edited directly. Please contact your
                  department coordinator for any updates.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

