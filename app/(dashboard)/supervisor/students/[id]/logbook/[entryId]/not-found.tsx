"use client"

import React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText } from "lucide-react"

export default function LogbookEntryNotFound() {
  const params = useParams()
  const studentId = React.use(params).id

  return (
    <div className="flex-1 p-8 flex items-center justify-center">
      <div className="text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-semibold">Logbook Entry Not Found</h2>
        <p className="mt-2 text-muted-foreground">
          The logbook entry you're looking for doesn't exist or has been removed.
        </p>
        <Button variant="outline" className="mt-6" asChild>
          <Link href={`/supervisor/students/${studentId}/logbook`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Logbook
          </Link>
        </Button>
      </div>
    </div>
  )
} 