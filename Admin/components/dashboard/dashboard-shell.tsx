import type React from "react"
import { cn } from "@/lib/utils"

interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> { }

export function DashboardShell({ children, className, ...props }: DashboardShellProps) {
  return (
    <div className={cn("min-h-[calc(100vh-6rem)] bg-[#FFFAF0] bg-gradient-to-br from-[#FFFAF0] via-[#FFFAF0] to-[#ccd88f]/5 p-6 lg:p-10", className)} {...props}>
      {children}
    </div>
  )
}
