"use client";

import { ArrowUpIcon, TrendingUpIcon, IndianRupeeIcon, ShoppingBagIcon, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetYearlyRevenueQuery, useGetSalesQuery } from "@/lib/redux/api/dashboardApi";

export function SalesPerformance() {
  const currentYear = new Date().getFullYear();
  const { data: yearlyData, isLoading: isYearlyLoading } = useGetYearlyRevenueQuery({ year: currentYear });
  const { data: monthlyData, isLoading: isMonthlyLoading } = useGetSalesQuery({ days: 30 });

  const isLoading = isYearlyLoading || isMonthlyLoading;

  const totalRevenue = yearlyData?.totalRevenue || 0;
  const totalOrders = yearlyData?.totalOrders || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const recentSales = monthlyData?.totalSales || 0;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <Loader2 className="h-4 w-4 animate-spin" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue ({currentYear})</CardTitle>
          <IndianRupeeIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Cumulative for the year {currentYear}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
          <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{Math.round(avgOrderValue).toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Based on {totalOrders} total orders
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sales (Last 30 Days)</CardTitle>
          <IndianRupeeIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{recentSales.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Revenue from recent 30 days
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingBagIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalOrders.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Successful transactions this year
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
