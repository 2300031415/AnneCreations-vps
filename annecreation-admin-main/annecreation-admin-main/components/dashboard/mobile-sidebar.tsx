"use client";

import {
  Menu,
  LayoutDashboard,
  Box,
  Tag,
  ShoppingBag,
  Users,
  Monitor,
  ShoppingCart,
  BarChart3,
  ChevronRight,
  UserCog,
  ShieldCheck
} from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Products", href: "/dashboard/products", icon: Box },
    { title: "Categories", href: "/dashboard/categories", icon: Tag },
    { title: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
    { title: "Customers", href: "/dashboard/customers", icon: Users },
    { title: "Banners", href: "/dashboard/banners", icon: Monitor },
    { title: "Coupons", href: "/dashboard/marketing/coupons", icon: ShoppingCart },
    { title: "Global Sales", href: "/dashboard/marketing/sales", icon: Tag },
    { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { title: "Staff Users", href: "/dashboard/settings/users", icon: UserCog },
    { title: "Staff Roles", href: "/dashboard/settings/roles", icon: ShieldCheck },
  ];

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="xl:hidden h-12 w-12 rounded-2xl bg-white/40 border border-white/20 shadow-lg group">
          <Menu className="h-6 w-6 text-[#311807] transition-transform group-hover:scale-110" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 border-none bg-[#311807] text-[#ccd88f] w-[300px]">
        <SheetHeader className="p-6 text-left border-b border-white/5">
          <SheetTitle className="text-[#ccd88f] font-poppins font-black tracking-tight text-xl uppercase">Anne Studio</SheetTitle>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ccd88f]/40">Administrative Access</p>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] py-6 px-4">
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between h-14 px-4 rounded-2xl transition-all group",
                  pathname === item.href
                    ? "bg-[#ccd88f] text-[#311807] shadow-xl shadow-[#ccd88f]/10"
                    : "text-[#ccd88f]/50 hover:bg-white/5 hover:text-[#ccd88f]"
                )}
              >
                <div className="flex items-center gap-4">
                  <item.icon className={cn(
                    "h-5 w-5",
                    pathname === item.href ? "text-[#311807]" : "text-[#ccd88f]/30 group-hover:text-[#ccd88f]"
                  )} />
                  <span className="text-sm font-bold tracking-tight">{item.title}</span>
                </div>
                <ChevronRight className={cn(
                  "h-4 w-4 transition-transform",
                  pathname === item.href ? "text-[#311807] translate-x-1" : "opacity-0 group-hover:opacity-30 group-hover:translate-x-1"
                )} />
              </Link>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
