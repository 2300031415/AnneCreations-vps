"use client"

import { Area, AreaChart, ResponsiveContainer } from "recharts"

interface MiniChartProps {
    data: { date: string; value: number }[]
    color?: string
}

export function MiniChart({ data, color = "#ccd88f" }: MiniChartProps) {
    if (!data || data.length === 0) return null

    // Ensure consistent sorting
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const gradientId = `gradient-${color.replace('#', '')}`

    return (
        <div className="h-[40px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sortedData}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        fillOpacity={1}
                        fill={`url(#${gradientId})`}
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
