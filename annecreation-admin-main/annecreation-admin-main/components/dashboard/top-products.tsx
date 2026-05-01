'use client'
import type React from "react"
import { ArrowRightIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useGetTopProductsQuery } from "@/lib/redux/api/dashboardApi"
import { BASE_URL } from "@/lib/redux/api/baseApi"


interface TopProductsProps extends React.HTMLAttributes<HTMLDivElement> { }


export function TopProducts({ className, ...props }: TopProductsProps) {
  const router = useRouter();
  const { data, isLoading } = useGetTopProductsQuery({ days: 90, limit: 5 });
  const products = data?.topProducts || [];
  const maxSales = Math.max(...products.map((p) => p.totalSold), 1);

  return (
    <Card className={`glass-card border-none ring-1 ring-[#311807]/5 ${className}`} {...props}>
      <CardHeader className="flex flex-row items-center justify-between bg-transparent">
        <div>
          <CardTitle className="text-lg font-bold text-[#311807] font-poppins">Top Products</CardTitle>
          <CardDescription className="text-[#311807]/50 font-inter text-xs">Best selling products (90 days)</CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-[#311807] hover:bg-[#ccd88f]/20 hover:text-[#311807] font-bold text-xs uppercase tracking-wider"
          onClick={() => {
            // Calculate date range for last 90 days
            const today = new Date();
            today.setHours(23, 59, 59, 999); // End of today

            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 89);
            startDate.setHours(0, 0, 0, 0); // Start of day

            const formatDate = (date: Date) => {
              // Format as YYYY-MM-DD in local timezone
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              return `${year}-${month}-${day}`;
            };

            router.push(`/dashboard/products?dateFrom=${formatDate(startDate)}&dateTo=${formatDate(today)}`);
          }}
        >
          View All
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="bg-transparent">
        <div className="space-y-6">
          {isLoading ? (
            <div className="h-48 w-full animate-pulse rounded-xl bg-[#ccd88f]/10" />
          ) : products.length === 0 ? (
            <div className="text-center text-[#311807]/40 text-sm py-10">No data found</div>
          ) : (
            products.map((product) => {
              const percent = Math.round((product.totalSold / maxSales) * 100);
              return (
                <div key={product.productId} className="space-y-3 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 overflow-hidden rounded-xl border border-[#311807]/10 bg-white shadow-sm group-hover:shadow-md transition-shadow">
                        <Image
                          src={product.image ? `${BASE_URL}/${product.image}` : "/placeholder.svg"}
                          alt={product.name}
                          width={56}
                          height={56}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-[#311807] truncate max-w-[150px] md:max-w-none">{product.name}</div>
                        <div className="text-xs font-semibold text-[#ccd88f]">{product.totalSold} sales</div>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-[#311807]/40">{percent}%</div>
                  </div>
                  <Progress value={percent} className="h-2 bg-[#311807]/5" indicatorClassName="bg-[#ccd88f] rounded-full" />
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
