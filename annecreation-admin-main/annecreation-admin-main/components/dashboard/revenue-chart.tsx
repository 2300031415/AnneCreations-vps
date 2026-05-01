"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useGetYearlyRevenueQuery } from "@/lib/redux/api/dashboardApi"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"



const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface RevenueChartProps extends React.HTMLAttributes<HTMLDivElement> { }

export function RevenueChart({ className, ...props }: RevenueChartProps) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const { data, isLoading } = useGetYearlyRevenueQuery({ year });

  // Prepare chart data from API
  const chartData = MONTHS.map((month, idx) => {
    const monthData = data?.monthlyData?.find((m) => m.month === idx + 1);
    return {
      name: month.slice(0, 3),
      total: monthData?.revenue ?? 0,
    };
  });

  return (
    <Card className={`glass-card border-none ring-1 ring-[#311807]/5 ${className}`} {...props}>
      <CardHeader className="flex flex-row items-center justify-between pb-8 bg-transparent">
        <div>
          <CardTitle className="text-lg font-bold text-[#311807] font-poppins">Revenue Overview</CardTitle>
          <CardDescription className="text-[#311807]/50 font-inter">Monthly performance tracking</CardDescription>
        </div>
        <div className="w-[120px]">
          <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
            <SelectTrigger className="border-[#311807]/10 bg-white/50 backdrop-blur-sm">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent className="bg-white/90 backdrop-blur-md">
              {[currentYear, currentYear - 1, currentYear - 2].map(y => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="h-[300px] bg-transparent">
        {isLoading ? (
          <div className="h-full w-full animate-pulse rounded-xl bg-[#ccd88f]/10"></div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#311807" strokeOpacity={0.05} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} tick={{ fill: "#311807", opacity: 0.4 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickFormatter={(value) => `₹${value}`}
                tick={{ fill: "#311807", opacity: 0.4 }}
              />
              <Tooltip
                cursor={{ fill: "rgba(204, 216, 143, 0.15)" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-xl border border-[#311807]/10 bg-white/90 backdrop-blur-md p-3 shadow-xl text-xs">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col">
                            <span className="text-[0.65rem] uppercase font-bold text-[#311807]/40">Month</span>
                            <span className="font-bold text-[#311807]">{payload[0].payload.name}</span>
                          </div>
                          <div className="flex flex-col border-l border-[#311807]/10 pl-4">
                            <span className="text-[0.65rem] uppercase font-bold text-[#311807]/40">Revenue</span>
                            <span className="font-bold text-[#311807]">₹{payload[0].value}</span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="#ccd88f" barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
