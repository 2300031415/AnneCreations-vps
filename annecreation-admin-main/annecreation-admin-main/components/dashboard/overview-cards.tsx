'use client'

import React from "react"
import { useRouter } from "next/navigation"
import {
  IndianRupee,
  ShoppingCart,
  Users,
} from "lucide-react"
import { MetricChartCard } from "./metric-chart-card"
import {
  useGetNewOrdersQuery,
  useGetNewCustomersQuery,
  useGetOnlineCustomersQuery,
  useGetYearlyRevenueQuery,
  useGetYearlyNewCustomersQuery,
} from "@/lib/redux/api/dashboardApi"

export const OverviewCards = React.memo(() => {
  const router = useRouter()
  // State for individual filters (now Years)
  const currentYear = new Date().getFullYear().toString();

  const [newOrdersYear, setNewOrdersYear] = React.useState(currentYear)
  const [newCustomersYear, setNewCustomersYear] = React.useState(currentYear)
  const [totalCustomersYear, setTotalCustomersYear] = React.useState(currentYear)

  // Fetch New Orders Data (using Yearly Revenue endpoint for orders count)
  const { data: ordersRevenueData, isLoading: isOrdersLoading } = useGetYearlyRevenueQuery(
    { year: parseInt(newOrdersYear) },
    { refetchOnFocus: false, refetchOnReconnect: false }
  )

  // Fetch New Customers Data (using Yearly New Customers endpoint)
  const { data: newCustomersData, isLoading: isNewCustomersLoading } = useGetYearlyNewCustomersQuery(
    { year: parseInt(newCustomersYear) },
    { refetchOnFocus: false, refetchOnReconnect: false }
  )

  // Fetch Total Customers Trend (using Yearly New Customers endpoint for growth)
  const { data: totalCustomersData, isLoading: isTotalCustomersLoading } = useGetYearlyNewCustomersQuery(
    { year: parseInt(totalCustomersYear) },
    { refetchOnFocus: false, refetchOnReconnect: false }
  )

  const { data: onlineCustomersData } = useGetOnlineCustomersQuery(
    undefined,
    {
      refetchOnFocus: false,
      refetchOnReconnect: false,
      pollingInterval: 10000,
    }
  )

  const [onlineHistory, setOnlineHistory] = React.useState<{ date: string; value: number }[]>([])

  // Track online history
  React.useEffect(() => {
    if (onlineCustomersData) {
      setOnlineHistory(prev => {
        const now = new Date().toISOString();
        const newPoint = { date: now, value: onlineCustomersData.totalOnline };
        // Append and keep last 20 points
        const newHistory = [...prev, newPoint];
        return newHistory.slice(-20);
      });
    }
  }, [onlineCustomersData]);

  // Helper to formatting monthly data for charts
  const formatMonthlyData = (monthlyData: any[] | undefined, valueField: string = 'count') => {
    if (!monthlyData) return [];
    // map month 1->Jan-01
    return monthlyData.map(item => {
      // Construct a date object. Use current year to keep it simple, or matching year.
      // Actually chart only cares about month name.
      // Let's use 2024 (leap year safe)
      const d = new Date(2024, item.month - 1, 1);
      return {
        date: d.toISOString(), // MetricChartCard expects ISO string or sortable
        value: item[valueField] || 0
      };
    });
  };

  const totalCustomersTrend = formatMonthlyData(totalCustomersData?.monthlyData, 'count');
  const newOrdersTrend = formatMonthlyData(ordersRevenueData?.monthlyData, 'orders'); // Revenue endpoint returns 'orders'
  const newCustomersTrend = formatMonthlyData(newCustomersData?.monthlyData, 'count');

  // Need total counts
  // Total Customers is tricky. newCustomersData only returns *new* customers for that year.
  // Ideally "Total Customers" card shows ALL TIME total.
  // The `getNewCustomers` endpoint (used previously) returned `totalCustomers` (all time).
  // The `getYearlyNewCustomers` returns `totalNewCustomers` (for that year).
  // We can fetch `useGetNewCustomersQuery({ days: 1 })` just to get the *Total* All-Time count?
  // Or just display "New Customers in Year" as the main metric for "Total Customers" card?
  // Previous implementation: "Total Customers" used `totalCustomersTrendData?.totalCustomers`.
  // Let's fetch all-time total separately or just use the yearly growth figure?
  // Usually "Total Customers" card displays the big number (All Time).
  // Let's keep a separate query for the big number if needed, or just show yearly growth.
  // But the card title is "Total Customers".
  // Let's use `useGetNewCustomersQuery` with minimal range just to get the total count.
  const { data: allTimeCustomersData } = useGetNewCustomersQuery({ days: 1 });


  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* 1. Total Customers */}
      {/* Title says "Total Customers", so main value should be Total. */}
      {/* Chart shows growth (new customers) for the selected year. */}
      <MetricChartCard
        title="Total Customers"
        value={allTimeCustomersData?.totalCustomers?.toLocaleString("en-IN") || "0"}
        icon={Users}
        data={totalCustomersTrend}
        description={`Growth in ${totalCustomersYear}`}
        color="#ccd88f"
        loading={isTotalCustomersLoading}
        period={totalCustomersYear}
        onPeriodChange={setTotalCustomersYear}
      />

      {/* 2. New Orders */}
      <MetricChartCard
        title="New Orders"
        value={ordersRevenueData?.totalOrders?.toLocaleString("en-IN") || "0"}
        icon={ShoppingCart}
        data={newOrdersTrend}
        description={`Orders in ${newOrdersYear}`}
        color="#ccd88f"
        loading={isOrdersLoading}
        period={newOrdersYear}
        onPeriodChange={setNewOrdersYear}
      />

      {/* 3. New Customers */}
      <MetricChartCard
        title="New Customers"
        value={newCustomersData?.totalNewCustomers?.toLocaleString("en-IN") || "0"}
        icon={Users}
        data={newCustomersTrend}
        description={`Joined in ${newCustomersYear}`}
        color="#ccd88f"
        loading={isNewCustomersLoading}
        period={newCustomersYear}
        onPeriodChange={setNewCustomersYear}
      />

      {/* 4. Online Customers */}
      <MetricChartCard
        title="Online Customers"
        value={onlineCustomersData?.totalOnline || "0"}
        icon={Users}
        data={onlineHistory}
        description="Currently active on site"
        color="#ccd88f"
        loading={!onlineCustomersData}
        dateFormat="time"
      />
    </div>
  )
})
