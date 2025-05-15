import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronRight,
  FileText,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Users,
} from "lucide-react"
import Image from "next/image"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 relative">
              <Image src="/images/yct-logo.png" alt="YCT Logo" width={48} height={48} className="object-contain" />
            </div>
            <span className="font-bold text-xl text-[#004C54]">SIWES Portal</span>
            <div className="w-12 h-12 relative ml-2">
              <Image src="/images/itf-logo.png" alt="ITF Logo" width={48} height={48} className="object-contain" />
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-[#004C54] transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:text-[#004C54] transition-colors">
              How It Works
            </Link>
            <Link href="#testimonials" className="text-sm font-medium hover:text-[#004C54] transition-colors">
              Testimonials
            </Link>
            <Link href="#faq" className="text-sm font-medium hover:text-[#004C54] transition-colors">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" className="hidden sm:flex">
              <Link href="/admin/login">Admin</Link>
            </Button>
            <Button asChild className="bg-[#004C54] hover:bg-[#004C54]/90">
              <Link href="/student/login">Student Login</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#004C54] to-[#004C54]/90 text-white py-16 md:py-24">
        <div className="container grid gap-8 md:grid-cols-2 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              SIWES Logbook Management System
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-lg">
              Yaba College of Technology's digital platform for managing Student Industrial Work Experience Scheme
              logbooks.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-[#FFC300] text-[#004C54] hover:bg-[#FFC300]/90">
                <Link href="/student/login">
                  Student Portal
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent text-white border-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/supervisor/login">Supervisor Portal</Link>
              </Button>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#FFC300]/20 rounded-full"></div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#FFC300]/10 rounded-full"></div>
            <div className="relative bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-xl">
              <div className="bg-white/5 rounded-lg p-4 mb-4">
                <div className="h-6 w-24 bg-white/20 rounded mb-2"></div>
                <div className="h-4 w-full bg-white/20 rounded mb-2"></div>
                <div className="h-4 w-3/4 bg-white/20 rounded"></div>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-[#FFC300]/30"></div>
                <div>
                  <div className="h-4 w-24 bg-white/20 rounded mb-1"></div>
                  <div className="h-3 w-32 bg-white/20 rounded"></div>
                </div>
                <div className="ml-auto h-8 w-20 bg-[#FFC300]/30 rounded"></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="h-4 w-12 bg-white/20 rounded mb-2"></div>
                  <div className="h-6 w-10 bg-white/20 rounded"></div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="h-4 w-12 bg-white/20 rounded mb-2"></div>
                  <div className="h-6 w-10 bg-white/20 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portal Cards */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#004C54] mb-4">Choose Your Portal</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform provides dedicated portals for students, supervisors, and administrators to streamline the
              SIWES process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PortalCard
              title="Student Portal"
              description="Create logbook entries, track progress, and view supervisor feedback."
              icon={GraduationCap}
              features={["Digital logbook creation", "Progress tracking", "Supervisor feedback", "Document uploads"]}
              href="/student/login"
              color="bg-blue-50 text-blue-600"
            />
            <PortalCard
              title="Supervisor Portal"
              description="Review logbook entries, evaluate performance, and provide feedback."
              icon={Users}
              features={[
                "Student performance tracking",
                "Logbook review and approval",
                "Feedback submission",
                "Evaluation reports",
              ]}
              href="/supervisor/login"
              color="bg-green-50 text-green-600"
            />
            <PortalCard
              title="Admin Portal"
              description="Manage users, assign supervisors, and monitor program metrics."
              icon={LayoutDashboard}
              features={["User management", "Supervisor assignments", "Program analytics", "System configuration"]}
              href="/admin/login"
              color="bg-purple-50 text-purple-600"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#004C54] mb-4">Key Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our SIWES Logbook Management System offers a comprehensive set of features designed to enhance the
              industrial training experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="Digital Logbook"
              description="Create, edit, and submit logbook entries digitally, eliminating the need for paper-based records."
              icon={BookOpen}
              color="bg-blue-50 text-blue-600"
            />
            <FeatureCard
              title="Progress Tracking"
              description="Monitor your SIWES completion status with visual progress indicators and statistics."
              icon={CheckCircle}
              color="bg-green-50 text-green-600"
            />
            <FeatureCard
              title="Supervisor Feedback"
              description="Receive timely feedback from your supervisor on your performance and logbook entries."
              icon={MessageSquare}
              color="bg-amber-50 text-amber-600"
            />
            <FeatureCard
              title="Calendar Integration"
              description="Keep track of important dates, deadlines, and scheduled meetings with the built-in calendar."
              icon={Calendar}
              color="bg-purple-50 text-purple-600"
            />
            <FeatureCard
              title="Report Generation"
              description="Generate comprehensive reports based on your logbook entries and supervisor evaluations."
              icon={FileText}
              color="bg-red-50 text-red-600"
            />
            <FeatureCard
              title="Mobile Responsive"
              description="Access the platform from any device with our fully responsive design that works on desktop, tablet, and mobile."
              icon={LayoutDashboard}
              color="bg-indigo-50 text-indigo-600"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#004C54] mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform simplifies the SIWES process for all stakeholders, making it easy to manage industrial
              training.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-[#004C54] text-white flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h3 className="text-xl font-bold mb-3 pt-2">For Students</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Register and create your profile</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Create daily/weekly logbook entries</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Submit entries for supervisor review</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Track progress and view feedback</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Generate final reports for submission</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-[#004C54] text-white flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="text-xl font-bold mb-3 pt-2">For Supervisors</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Access assigned students' profiles</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Review submitted logbook entries</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Provide feedback and evaluations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Track student performance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Generate assessment reports</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-[#004C54] text-white flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h3 className="text-xl font-bold mb-3 pt-2">For Administrators</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Manage user accounts and permissions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Assign students to supervisors</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Monitor overall program metrics</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Generate institutional reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Configure system settings</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 bg-[#004C54]">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">What Our Users Say</h2>
            <p className="text-white/80 max-w-2xl mx-auto">
              Hear from students, supervisors, and administrators who have experienced the benefits of our SIWES Logbook
              Management System.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="The digital logbook has made my SIWES experience so much easier. I can update my entries from anywhere and get quick feedback from my supervisor."
              name="Adeola Johnson"
              role="Computer Science Student"
            />
            <TestimonialCard
              quote="As a supervisor, this platform has streamlined my workflow. I can review multiple students' logbooks efficiently and provide timely feedback."
              name="Dr. Michael Adeyemi"
              role="Industry Supervisor"
            />
            <TestimonialCard
              quote="The administrative features have significantly reduced paperwork and improved our ability to monitor the SIWES program across departments."
              name="Prof. Sarah Okonkwo"
              role="SIWES Coordinator"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#004C54] mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about the SIWES Logbook Management System.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <FaqCard
              question="How do I create a new logbook entry?"
              answer="Log in to your student portal, navigate to the Logbook section, and click on 'New Entry'. Fill in the required details about your daily activities and submit for review."
            />
            <FaqCard
              question="Can I edit an entry after submission?"
              answer="You can only edit entries that have been marked for revision by your supervisor. Approved entries cannot be modified to maintain record integrity."
            />
            <FaqCard
              question="How often should I update my logbook?"
              answer="It's recommended to update your logbook daily or at least weekly, depending on your department's requirements. Regular updates ensure accurate recording of your activities."
            />
            <FaqCard
              question="How do supervisors provide feedback?"
              answer="Supervisors can review submitted entries and provide feedback directly through the platform. You'll receive notifications when feedback is available."
            />
            <FaqCard
              question="Can I access the system on mobile devices?"
              answer="Yes, the SIWES Logbook Management System is fully responsive and can be accessed on smartphones, tablets, and desktop computers."
            />
            <FaqCard
              question="What happens if I forget my password?"
              answer="On the login page, click on 'Forgot Password' and follow the instructions to reset your password through your registered email address."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#004C54] to-[#004C54]/90 text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            Join Yaba College of Technology's digital SIWES platform and streamline your industrial training experience.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-[#FFC300] text-[#004C54] hover:bg-[#FFC300]/90">
              <Link href="/student/login">Student Login</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent text-white border-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/supervisor/login">Supervisor Login</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent text-white border-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/admin/login">Admin Login</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 relative">
                  <Image src="/images/yct-logo.png" alt="YCT Logo" width={40} height={40} className="object-contain" />
                </div>
                <span className="font-bold text-xl">SIWES Portal</span>
                <div className="w-10 h-10 relative">
                  <Image src="/images/itf-logo.png" alt="ITF Logo" width={40} height={40} className="object-contain" />
                </div>
              </div>
              <p className="text-gray-400">
                Yaba College of Technology's digital platform for managing Student Industrial Work Experience Scheme
                logbooks.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-gray-400 hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="#testimonials" className="text-gray-400 hover:text-white transition-colors">
                    Testimonials
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="text-gray-400 hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Portals</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/student/login" className="text-gray-400 hover:text-white transition-colors">
                    Student Portal
                  </Link>
                </li>
                <li>
                  <Link href="/supervisor/login" className="text-gray-400 hover:text-white transition-colors">
                    Supervisor Portal
                  </Link>
                </li>
                <li>
                  <Link href="/admin/login" className="text-gray-400 hover:text-white transition-colors">
                    Admin Portal
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Contact</h3>
              <address className="text-gray-400 not-italic">
                <p>Yaba College of Technology</p>
                <p>Yaba, Lagos, Nigeria</p>
                <p className="mt-2">Email: siwes@yabatech.edu.ng</p>
                <p>Phone: +234 123 456 7890</p>
              </address>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Yaba College of Technology. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function PortalCard({
  title,
  description,
  icon: Icon,
  features,
  href,
  color,
}: {
  title: string
  description: string
  icon: React.ElementType
  features: string[]
  href: string
  color: string
}) {
  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mb-4`}>
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl text-[#004C54]">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-[#004C54] hover:bg-[#004C54]/90">
          <Link href={href}>Access Portal</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function FeatureCard({
  title,
  description,
  icon: Icon,
  color,
}: {
  title: string
  description: string
  icon: React.ElementType
  color: string
}) {
  return (
    <Card className="transition-all duration-300 hover:shadow-md">
      <CardHeader>
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  )
}

function TestimonialCard({
  quote,
  name,
  role,
}: {
  quote: string
  name: string
  role: string
}) {
  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardContent className="pt-6">
        <div className="mb-4">
          <svg className="h-8 w-8 text-[#FFC300]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </div>
        <p className="text-white/90 mb-4">{quote}</p>
        <div>
          <p className="font-bold text-white">{name}</p>
          <p className="text-white/70 text-sm">{role}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function FaqCard({
  question,
  answer,
}: {
  question: string
  answer: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{question}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{answer}</p>
      </CardContent>
    </Card>
  )
}

