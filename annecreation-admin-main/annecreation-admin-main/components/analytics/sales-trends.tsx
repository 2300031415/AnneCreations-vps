"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useGetYearlyRevenueQuery } from "@/lib/redux/api/dashboardApi";
import { Loader2 } from "lucide-react";

export function SalesTrends({ className }: { className?: string }) {
  const currentYear = new Date().getFullYear();
  const { data, isLoading } = useGetYearlyRevenueQuery({ year: currentYear });

  const chartData = data?.monthlyData?.map(item => ({
    month: item.month_name.substring(0, 3),
    revenue: item.revenue,
    orders: item.orders
  })) || [];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Revenue Trends ({currentYear})</CardTitle>
        <CardDescription>Monthly revenue and order volume for the current year</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-full text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            Loading chart data...
          </div>
        ) : chartData.length > 0 ? (
          <ChartContainer
            config={{
              revenue: {
                label: "Revenue (₹)",
                color: "hsl(var(--chart-1))",
              },
              orders: {
                label: "Orders",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-full w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  strokeWidth={2}
                  stroke="var(--color-revenue)"
                  dot={{ r: 4, fill: "var(--color-revenue)" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  strokeWidth={2}
                  stroke="var(--color-orders)"
                  dot={{ r: 4, fill: "var(--color-orders)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex justify-center items-center h-full text-muted-foreground">
            No data available for {currentYear}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
