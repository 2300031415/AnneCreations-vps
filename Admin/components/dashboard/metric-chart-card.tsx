"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricChartCardProps {
    title: string
    value: string | number
    description?: string
    icon: LucideIcon
    color?: string
    data: { date: string; value: number }[]
    period?: string
    onPeriodChange?: (period: string) => void
    loading?: boolean
    dateFormat?: 'date' | 'time' | 'auto'
}

export function MetricChartCard({
    title,
    value,
    description,
    icon: Icon,
    color = "#ccd88f",
    data,
    period = "30",
    onPeriodChange,
    loading = false,
    dateFormat = 'auto'
}: MetricChartCardProps) {

    // Ensure consistent sorting
    const sortedData = React.useMemo(() => {
        if (!data) return []
        return [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }, [data])

    const range = React.useMemo(() => {
        if (sortedData.length < 2) return 0;
        const times = sortedData.map(d => new Date(d.date).getTime());
        return Math.max(...times) - Math.min(...times);
    }, [sortedData]);

    const isIntraday = dateFormat === 'time' || (dateFormat === 'auto' && range < 24 * 60 * 60 * 1000 && range > 0);

    return (
        <Card className="glass-card overflow-hidden border-none ring-1 ring-[#311807]/5 transition-transform hover:scale-[1.01]">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-transparent">
                <div className="space-y-1">
                    <CardTitle className="text-sm font-semibold text-[#311807]/90 flex items-center gap-2 font-poppins uppercase tracking-wider">
                        <Icon className="h-4 w-4" />
                        {title}
                    </CardTitle>
                    <div className="text-3xl font-bold text-[#311807] font-poppins">{loading ? "..." : value}</div>
                </div>
                {onPeriodChange && (
                    <div className="w-[100px]">
                        <Select value={period} onValueChange={onPeriodChange}>
                            <SelectTrigger className="h-8 text-xs border-[#311807]/10 bg-white/50 backdrop-blur-sm">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent className="bg-white/90 backdrop-blur-md">
                                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i + 1).map(year => (
                                    <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </CardHeader>
            <CardContent className="bg-transparent pt-0">
                <div className="h-[180px] w-full mt-4">
                    {loading ? (
                        <div className="h-full w-full animate-pulse bg-[#ccd88f]/10 rounded-xl" />
                    ) : sortedData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sortedData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#311807" strokeOpacity={0.05} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    fontSize={10}
                                    tickFormatter={(val) => {
                                        const d = new Date(val);
                                        if (isIntraday) {
                                            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                        }
                                        return d.toLocaleDateString('en-US', { month: 'short' });
                                    }}
                                    minTickGap={30}
                                    tick={{ fill: "#311807", opacity: 0.8 }}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    fontSize={10}
                                    tick={{ fill: "#311807", opacity: 0.8 }}
                                />
                                <Tooltip
                                    cursor={{ fill: "rgba(204, 216, 143, 0.2)" }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            const d = new Date(label);
                                            const labelText = isIntraday
                                                ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                                : d.toLocaleDateString('en-US', { month: 'long' });

                                            return (
                                                <div className="rounded-xl border border-[#311807]/10 bg-white/90 backdrop-blur-md p-3 shadow-xl text-xs">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-[0.65rem] uppercase font-bold text-[#311807]/40 tracking-tighter">
                                                                {isIntraday ? 'Time' : 'Month'}
                                                            </span>
                                                            <span className="font-bold text-[#311807]">{labelText}</span>
                                                        </div>
                                                        <div className="flex flex-col border-l border-[#311807]/10 pl-4">
                                                            <span className="text-[0.65rem] uppercase font-bold text-[#311807]/40 tracking-tighter">{title}</span>
                                                            <span className="font-bold text-[#311807]">{payload[0].value}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Bar
                                    dataKey="value"
                                    fill={color}
                                    radius={[6, 6, 0, 0]}
                                    barSize={sortedData.length > 20 ? 8 : 16}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-[#311807]/30 text-sm">
                            No patterns detected
                        </div>
                    )}
                </div>
                {description && (
                    <div className="mt-4 flex items-center gap-2 border-t border-[#311807]/5 pt-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#311807]/70 leading-none">{description}</p>
                        <div className="h-1 flex-1 bg-[#311807]/5 rounded-full overflow-hidden">
                            <div className="h-full bg-[#ccd88f] w-1/3 rounded-full opacity-50" />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
