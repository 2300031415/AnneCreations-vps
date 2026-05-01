import type { ReactNode } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { AdminLayout } from "@/components/dashboard/admin-layout"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  )
}
