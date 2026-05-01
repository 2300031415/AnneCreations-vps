"use client";

import {
  Bell,
  Search,
  LayoutDashboard,
  Box,
  Tag,
  ShoppingBag,
  Users,
  BarChart3,
  ShoppingCart,
  ChevronDown,
  Monitor,
  UserCog,
  ShieldCheck,
  ExternalLink,
  Eye
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logo from '@/public/logo.svg'

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileSidebar } from "./mobile-sidebar";
import { LogoutButton } from "@/components/auth/logout-button";
import { cn } from "@/lib/utils";

export function DashboardHeader() {
  const pathname = usePathname();

  const navItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    {
      title: "Inventory",
      items: [
        { title: "All Products", href: "/dashboard/products", icon: Box },
        { title: "Categories", href: "/dashboard/categories", icon: Tag },
        { title: "Banners", href: "/dashboard/banners", icon: Monitor },
      ]
    },
    {
      title: "Sales",
      items: [
        { title: "New Orders", href: "/dashboard/orders?filter=new", icon: ShoppingBag },
        { title: "Full Order List", href: "/dashboard/orders", icon: ShoppingBag },
        { title: "Customer Database", href: "/dashboard/customers", icon: Users },
      ]
    },
    {
      title: "Solutions",
      items: [
        { title: "Marketing Tool", href: "/dashboard/marketing/coupons", icon: ShoppingCart },
        { title: "Global Sales", href: "/dashboard/marketing/sales", icon: Tag },
      ]
    },
    {
      title: "System",
      items: [
        { title: "Staff Users", href: "/dashboard/settings/users", icon: UserCog },
        { title: "Staff Roles", href: "/dashboard/settings/roles", icon: ShieldCheck },
        { title: "Site Settings", href: "/dashboard/settings/site", icon: Monitor },
        { title: "Studio Settings", href: "/dashboard/profile", icon: Bell },
      ]
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-4 z-40 mx-4 mb-4 flex h-24 items-center justify-between gap-4 rounded-[2rem] bg-white/60 border border-white/40 backdrop-blur-2xl px-8 shadow-2xl shadow-[#311807]/5 mt-4 transition-all duration-500">
      <div className="flex items-center gap-10">
        <Link href="/dashboard" className="flex items-center gap-4 group">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] bg-[#ccd88f] shadow-xl shadow-[#ccd88f]/30 transition-all duration-500 group-hover:rotate-[15deg] group-hover:scale-110 border border-white/20">
            <Image
              src={logo}
              alt="Anne Creations"
              width={36}
              height={36}
              priority
              className="object-contain"
            />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-lg font-black text-[#311807] font-poppins tracking-tight leading-none">ANNE CREATIONS</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#311807]/30 mt-1">Admin Studio</span>
          </div>
        </Link>

        {/* Desktop Horizontal Navigation */}
        <nav className="hidden xl:flex items-center gap-2">
          {navItems.map((group) => (
            group.items ? (
              <DropdownMenu key={group.title}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "h-12 gap-2 rounded-2xl text-[11px] font-bold uppercase tracking-[0.1em] transition-all px-5",
                      group.items?.some(item => pathname.startsWith(item.href))
                        ? "bg-[#311807] text-[#ccd88f] shadow-lg shadow-[#311807]/20"
                        : "text-[#311807]/60 hover:text-[#311807] hover:bg-[#ccd88f]/10"
                    )}
                  >
                    {group.title}
                    <ChevronDown className={cn(
                      "h-3 w-3 transition-transform duration-300",
                      group.items?.some(item => pathname.startsWith(item.href)) ? "opacity-100" : "opacity-30"
                    )} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="glass-card border-none ring-1 ring-[#311807]/5 p-2 mt-4 w-56 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#311807]/30 mb-1">{group.title} System</div>
                  {group.items.map((item) => (
                    <DropdownMenuItem key={item.title} asChild className="rounded-[1rem] focus:bg-[#ccd88f]/10 cursor-pointer m-0.5">
                      <Link href={item.href} className="flex items-center gap-4 py-3 px-4">
                        <div className="h-8 w-8 rounded-lg bg-[#311807]/5 flex items-center justify-center text-[#ccd88f]">
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-bold text-[#311807] tracking-tight">{item.title}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                key={group.title}
                variant="ghost"
                asChild
                className={cn(
                  "h-12 rounded-2xl text-[11px] font-bold uppercase tracking-[0.1em] transition-all px-5",
                  isActive(group.href!)
                    ? "bg-[#311807] text-[#ccd88f] shadow-lg shadow-[#311807]/20"
                    : "text-[#311807]/60 hover:text-[#311807] hover:bg-[#ccd88f]/10"
                )}
              >
                <Link href={group.href!}>{group.title}</Link>
              </Button>
            )
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          target="_blank"
          className="hidden md:flex items-center gap-3 bg-[#ccd88f]/10 hover:bg-[#ccd88f]/20 px-5 py-2.5 rounded-2xl border border-[#ccd88f]/20 transition-all group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
          <div className="flex items-center gap-2">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#311807] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#311807]"></span>
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.15em] text-[#311807]">Live Website</span>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-[#311807]/40 group-hover:text-[#311807] group-hover:scale-110 transition-all" />
        </Link>

        {/* Account Controls */}
        <div className="flex items-center gap-2">
          <div className="xl:hidden">
            <MobileSidebar />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-14 w-14 rounded-2xl border border-white bg-white/40 shadow-xl shadow-[#311807]/5 transition-all hover:scale-105 active:scale-95 group overflow-hidden"
              >
                <Image
                  src={logo}
                  alt="User"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 glass-card border-none ring-1 ring-[#311807]/5 p-3 mt-6">
              <DropdownMenuLabel className="font-poppins text-[#311807] p-3 rounded-2xl bg-[#311807]/5 mb-2">
                <p className="text-sm font-black tracking-tight">System Administrator</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#311807]/40">Active Session</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuItem className="rounded-xl focus:bg-[#ccd88f]/20 focus:text-[#311807] cursor-pointer py-3">
                <Link href="/dashboard/profile" className="flex w-full items-center gap-4 font-bold text-xs uppercase tracking-widest">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ccd88f]/20">⚙️</span>
                  Studio Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#311807]/5 mx-2 my-2" />
              <DropdownMenuItem className="p-0 focus:bg-red-50 rounded-xl overflow-hidden mt-1">
                <LogoutButton
                  variant="ghost"
                  className="w-full justify-start px-4 py-3 text-red-600 hover:text-red-700 font-black text-[10px] uppercase tracking-[0.2em]"
                />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
