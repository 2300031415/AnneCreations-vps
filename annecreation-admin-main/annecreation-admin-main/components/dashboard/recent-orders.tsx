'use client'
import { ArrowRightIcon, CheckCircle2, Clock, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useGetRecentOrdersQuery } from "@/lib/redux/api/dashboardApi"
import { useRouter } from "next/navigation"
import { formatDateIST } from "@/lib/date-utils"
interface RecentOrdersProps extends React.HTMLAttributes<HTMLDivElement> { }

export function RecentOrders({ className, ...props }: RecentOrdersProps) {

  const router = useRouter();
  const { data, isLoading } = useGetRecentOrdersQuery({ limit: 10 });
  const orders = data?.recentOrders || [];
  function getStatusLabel(status: string) {
    const key = status.toLowerCase();
    if (key === "processing") return { label: "Processing", color: "yellow" };
    if (key === "paid" || key === "completed") return { label: "Completed", color: "green" };
    if (key === "cancelled") return { label: "Cancelled", color: "red" };
    return { label: status, color: "gray" }; // fallback for unknown statuses
  }

  return (
    <Card className={cn("glass-card border-none ring-1 ring-[#311807]/5 overflow-hidden", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between bg-transparent">
        <div>
          <CardTitle className="text-lg font-bold text-[#311807] font-poppins">Recent Orders</CardTitle>
          <CardDescription className="text-[#311807]/50 font-inter text-xs">Manage your latest {orders.length} transactions</CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-[#311807] hover:bg-[#ccd88f]/20 hover:text-[#311807] font-bold text-xs uppercase tracking-wider"
          onClick={() => router.push("/dashboard/orders")}
        >
          View All
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="bg-transparent p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#311807]/5 hover:bg-transparent">
                <TableHead className="font-bold text-[#311807]/40 uppercase text-[10px] tracking-widest pl-6">Order ID</TableHead>
                <TableHead className="font-bold text-[#311807]/40 uppercase text-[10px] tracking-widest">Customer</TableHead>
                <TableHead className="font-bold text-[#311807]/40 uppercase text-[10px] tracking-widest">Date</TableHead>
                <TableHead className="font-bold text-[#311807]/40 uppercase text-[10px] tracking-widest">Amount</TableHead>
                <TableHead className="font-bold text-[#311807]/40 uppercase text-[10px] tracking-widest">Status</TableHead>
                <TableHead className="text-right font-bold text-[#311807]/40 uppercase text-[10px] tracking-widest pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#ccd88f]/30 border-t-[#ccd88f]"></div>
                      <p className="text-xs text-[#311807]/40 font-bold uppercase tracking-tighter">Syncing orders...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-[#311807]/30 text-xs font-bold uppercase">No orders recorded</TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const status = getStatusLabel(order.status);

                  return (
                    <TableRow key={order.orderId} className="border-b border-[#311807]/5 hover:bg-[#ccd88f]/5 transition-colors">
                      <TableCell className="font-bold text-[#311807] pl-6">{order.orderNumber}</TableCell>
                      <TableCell className="text-[#311807]/70 font-medium">{order?.customer?.name || "N/A"}</TableCell>
                      <TableCell className="text-[#311807]/50 text-xs font-semibold">{formatDateIST(order.createdAt)}</TableCell>
                      <TableCell className="font-bold text-[#311807]">₹{order.total}</TableCell>
                      <TableCell>
                        <div className={cn(
                          "flex w-fit items-center gap-1.5 rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                          status.color === "green" ? "bg-green-100/50 text-green-700" :
                            status.color === "yellow" ? "bg-amber-100/50 text-amber-700" :
                              "bg-red-100/50 text-red-700"
                        )}>
                          {status.color === "green" ? <CheckCircle2 className="h-3 w-3" /> :
                            status.color === "yellow" ? <Clock className="h-3 w-3" /> :
                              <XCircle className="h-3 w-3" />}
                          <span>{status.label}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 rounded-lg bg-[#311807]/5 text-[#311807] hover:bg-[#311807]/10 font-bold text-[10px] uppercase tracking-wider"
                          onClick={() => router.push(`/dashboard/orders?id=${order.orderNumber}`)}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
