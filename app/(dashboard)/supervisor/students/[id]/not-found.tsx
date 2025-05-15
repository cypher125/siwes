"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User } from "lucide-react"

export default function StudentNotFound() {
  return (
    <div className="flex-1 p-8 flex items-center justify-center">
      <div className="text-center">
        <User className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-semibold">Student Not Found</h2>
        <p className="mt-2 text-muted-foreground">
          The student you're looking for doesn't exist or you don't have permission to view them.
        </p>
        <Button variant="outline" className="mt-6" asChild>
          <Link href="/supervisor/students">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Students
          </Link>
        </Button>
      </div>
    </div>
  )
} 