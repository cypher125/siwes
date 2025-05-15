import { Loader2 } from "lucide-react"

export default function LogbookLoading() {
  return (
    <div className="flex-1 p-8 flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-[#004C54]" />
        <p className="text-muted-foreground">Loading logbook entries...</p>
      </div>
    </div>
  )
} 