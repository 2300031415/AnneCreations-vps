"use client"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { OverviewCards } from "@/components/dashboard/overview-cards"
import { RecentOrders } from "@/components/dashboard/recent-orders"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { CustomerGrowthChart } from "@/components/dashboard/customer-growth-chart"
import { TopProducts } from "@/components/dashboard/top-products"
import { usePermissions } from "@/hooks/use-permissions"
import { AccessDenied } from "@/components/ui/access-denied"

export function DashboardContent() {
  const { canRead, isSuperAdmin, isLoading } = usePermissions()
  const hasDashboardAccess = isSuperAdmin || canRead('dashboard')

  return (
    <>
      {isLoading ? (
        <div className="flex min-h-[600px] flex-col items-center justify-center bg-[#FFFAF0]/50 backdrop-blur-sm">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <div className="absolute h-full w-full animate-spin rounded-full border-4 border-[#311807]/5 border-t-[#ccd88f]"></div>
            <div className="h-10 w-10 animate-pulse rounded-full bg-[#ccd88f]/20"></div>
          </div>
          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#311807]/40">Synchronizing Dashboard</p>
        </div>
      ) : hasDashboardAccess ? (
        <div className="grid gap-6">
          <OverviewCards />

          <div className="grid gap-6 lg:grid-cols-2">
            <RevenueChart />
            <CustomerGrowthChart />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <RecentOrders className="lg:col-span-4" />
            <TopProducts className="lg:col-span-3" />
          </div>
        </div>
      ) : (
        <AccessDenied
          description="You don't have permission to access the dashboard"
          message="This page requires dashboard read permission that hasn't been granted to your account. Please contact your administrator if you believe you should have access."
        />
      )}
    </>
  )
}

