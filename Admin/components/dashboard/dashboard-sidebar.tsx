"use client"

import {
  BarChart3,
  Box,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Home,
  LayoutDashboard,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Users,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import React, { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSidebar } from "@/contexts/sidebar-context"
import { cn } from "@/lib/utils";
import Logo from '@/public/logo.svg'
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const showBanners = process.env.NEXT_PUBLIC_ENABLE_BANNERS === "true";

const sidebarLinks = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/dashboard/products",
    icon: Box,
  },
  {
    title: "Categories",
    href: "/dashboard/categories",
    icon: Tag,
  },
  {
    title: "New Orders",
    href: "/dashboard/orders?filter=new",
    icon: ShoppingBag,
  },
  {
    title: "Orders",
    href: "/dashboard/orders",
    icon: ShoppingBag,
  },
  {
    title: "Customers",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    title: "Banners",
    href: "/dashboard/banners",
    icon: Box,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    subItems: [
      {
        title: "Sales Analytics",
        href: "/dashboard/analytics/sales",
      },
      {
        title: "Product Analytics",
        href: "/dashboard/analytics/products",
      },
      {
        title: "Online Users",
        href: "/dashboard/analytics/online-users",
      },
    ],
  },
  {
    title: "Marketing",
    href: "/dashboard/marketing",
    icon: ShoppingCart,
    subItems: [
      {
        title: "Coupons",
        href: "/dashboard/marketing/coupons",
      },
    ],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    subItems: [
      {
        title: "Admin Users",
        href: "/dashboard/settings/users",
      },
      {
        title: "Roles",
        href: "/dashboard/settings/roles",
      },
      {
        title: "Site Settings",
        href: "/dashboard/settings/site",
      },
    ],
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isExpanded, toggleSidebar } = useSidebar()
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "/dashboard/marketing": false, // Always collapsed
    "/dashboard/settings": false, // Always collapsed
    "/dashboard/orders": false,
  })

  // Initialize expanded sections based on current path and default collapsed sections
  useEffect(() => {
    const initialExpandedSections: Record<string, boolean> = {
      "/dashboard/marketing": false, // Always collapsed
      "/dashboard/settings": false, // Always collapsed
      "/dashboard/orders": false,
    }

    sidebarLinks.forEach((link) => {
      if (link.subItems) {
        // Check if the current path is in this section's subitems
        const isCurrentSection = link.subItems.some(
          (subItem) => pathname === subItem.href.split('?')[0] || pathname.startsWith(subItem.href.split('?')[0] + "/"),
        )

        // Always expand Analytics if we're in an Analytics page
        if (link.title === "Analytics") {
          initialExpandedSections[link.href] = isCurrentSection || pathname.includes("/dashboard/analytics")
        } else {
          initialExpandedSections[link.href] = isCurrentSection
        }
      }
    })

    setExpandedSections(initialExpandedSections)
  }, [pathname])

  const toggleSection = (href: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [href]: !prev[href],
    }))
  }

  const isLinkActive = (link: (typeof sidebarLinks)[0]) => {
    // Check if the link has subItems
    if (
      link.subItems &&
      link.subItems.some((subItem) => pathname === subItem.href.split('?')[0] || pathname.startsWith(subItem.href.split('?')[0] + "/"))
    )
      return true

    // Direct link check with query parameters support
    const [linkPath, linkQuery] = link.href.split('?');
    if (pathname === linkPath) {
      if (linkQuery) {
        const linkParams = new URLSearchParams(linkQuery);
        let allParamsMatch = true;

        linkParams.forEach((value, key) => {
          if (searchParams.get(key) !== value) allParamsMatch = false;
        });

        if (!allParamsMatch) return false;
        return true;
      }

      // If the link has NO query params (e.g. /dashboard/orders)
      // We exclude it IF we are in a specific sub-view
      const currentStatus = searchParams.get('status');
      const currentFilter = searchParams.get('filter');

      if (link.title === 'Orders') {
        if (currentStatus === 'Pending') return false;
        if (currentFilter === 'new') return false;
      }

      return true;
    }

    return false
  }

  const isSubLinkActive = (href: string) => {
    const [path, query] = href.split('?');
    if (path !== pathname) return false;

    const statusParam = searchParams.get('status');
    if (query && query.includes('status=')) {
      // Check if status matches
      const expectedStatus = new URLSearchParams(query).get('status');
      return statusParam === expectedStatus;
    }

    // If no query in href, active if no status in searchParams (or at least filtering specifically)
    // For "All Orders" (/dashboard/orders), we want it active if NOT filtering by status? 
    // Or just if status is not 'Pending'?
    if (!query && statusParam) return false;

    return true;
  }

  return (
    <aside
      className={cn(
        "relative z-40 hidden h-full transition-all duration-500 ease-in-out lg:flex flex-col",
        isExpanded ? "w-72" : "w-24"
      )}
    >
      <div className="flex h-full flex-col overflow-hidden p-4">
        <div className={cn(
          "flex h-full flex-col rounded-[2.5rem] bg-[#311807] shadow-2xl shadow-[#311807]/40 border border-white/5 relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] before:opacity-[0.03]"
        )}>
          {/* Header/Logo Section */}
          <div className="flex h-24 items-center px-6 relative">
            <Link href="/dashboard" className="flex items-center gap-4 w-full group">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#ccd88f] shadow-lg shadow-[#ccd88f]/20 transition-all duration-500 group-hover:rotate-[10deg] group-hover:scale-110 overflow-hidden border border-white/20">
                <img
                  src="/logo.svg"
                  alt="Anne"
                  className="h-8 w-8 object-contain transition-all duration-500"
                  style={{ imageRendering: 'crisp-edges' }}
                />
              </div>
              {isExpanded && (
                <div className="flex flex-col overflow-hidden animate-in fade-in slide-in-from-left-4 duration-500">
                  <span className="text-sm font-bold tracking-tight text-[#ccd88f] font-poppins truncate leading-tight">Anne Creations</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#ccd88f]/40 leading-none mt-1">Premium Studio</span>
                </div>
              )}
            </Link>
          </div>

          <ScrollArea className="flex-1 px-4 py-2">
            <nav className="space-y-8">
              {/* Main Navigation */}
              <div className="space-y-1.5">
                {sidebarLinks
                  .filter((link) => !(link.title === "Banners" && !showBanners))
                  .map((link) => (
                    <div key={link.href} className="relative">
                      {!link.subItems ? (
                        <Link
                          href={link.href}
                          className={cn(
                            "group relative flex items-center h-12 gap-4 rounded-2xl px-4 transition-all duration-300",
                            isLinkActive(link)
                              ? "bg-[#ccd88f] text-[#311807] shadow-xl shadow-[#ccd88f]/10 translate-x-1"
                              : "text-[#ccd88f]/50 hover:bg-white/5 hover:text-[#ccd88f] hover:translate-x-1"
                          )}
                        >
                          <link.icon className={cn(
                            "h-5 w-5 shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                            isLinkActive(link) ? "text-[#311807]" : "text-[#ccd88f]/40 group-hover:text-[#ccd88f]"
                          )} />
                          {isExpanded ? (
                            <span className="text-sm font-bold font-inter truncate tracking-wide">{link.title}</span>
                          ) : (
                            <div className="absolute left-full ml-4 opacity-0 group-hover:opacity-100 transition-opacity bg-[#311807] text-[#ccd88f] text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg pointer-events-none whitespace-nowrap shadow-2xl border border-white/5 z-50">
                              {link.title}
                            </div>
                          )}
                          {isLinkActive(link) && (
                            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#311807] rounded-full" />
                          )}
                        </Link>
                      ) : (
                        <div className="space-y-1">
                          <button
                            onClick={() => isExpanded && toggleSection(link.href)}
                            className={cn(
                              "group flex w-full items-center h-12 gap-4 rounded-2xl px-4 transition-all duration-300",
                              isLinkActive(link)
                                ? "bg-white/5 text-[#ccd88f] translate-x-1"
                                : "text-[#ccd88f]/50 hover:bg-white/5 hover:text-[#ccd88f] hover:translate-x-1"
                            )}
                          >
                            <link.icon className={cn(
                              "h-5 w-5 shrink-0 transition-all duration-300 group-hover:rotate-3",
                              isLinkActive(link) ? "text-[#ccd88f]" : "text-[#ccd88f]/40 group-hover:text-[#ccd88f]"
                            )} />
                            {isExpanded && (
                              <>
                                <span className="flex-1 text-sm font-bold font-inter text-left tracking-wide">{link.title}</span>
                                <ChevronDown className={cn(
                                  "h-4 w-4 transition-transform duration-300 opacity-30",
                                  expandedSections[link.href] && "rotate-180 opacity-100"
                                )} />
                              </>
                            )}
                            {!isExpanded && (
                              <div className="absolute left-full ml-4 opacity-0 group-hover:opacity-100 transition-opacity bg-[#311807] text-[#ccd88f] text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg pointer-events-none whitespace-nowrap shadow-2xl border border-white/5 z-50">
                                {link.title}
                              </div>
                            )}
                          </button>
                          {isExpanded && expandedSections[link.href] && (
                            <div className="ml-6 space-y-1 border-l border-white/5 pl-4 pt-1 animate-in fade-in slide-in-from-left-4 duration-500">
                              {link.subItems.map((subItem) => (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  className={cn(
                                    "flex h-10 items-center px-4 rounded-xl text-xs font-bold tracking-wide transition-all duration-200",
                                    isSubLinkActive(subItem.href)
                                      ? "text-[#ccd88f] bg-[#ccd88f]/10"
                                      : "text-[#ccd88f]/30 hover:text-[#ccd88f] hover:bg-white/5"
                                  )}
                                >
                                  {subItem.title}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </nav>
          </ScrollArea>

          {/* Bottom Profile Section */}
          <div className="mt-auto p-4 border-t border-white/5 bg-black/20 backdrop-blur-xl">
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-[1.5rem] bg-white/[0.03] border border-white/5 transition-all duration-300",
              !isExpanded && "justify-center px-0 bg-transparent border-none"
            )}>
              <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-[#ccd88f] to-[#ccd88f]/60 flex items-center justify-center text-[#311807] font-bold text-lg shadow-lg shadow-[#ccd88f]/10 group cursor-help transition-transform hover:scale-110">
                <Home className="h-5 w-5" />
              </div>
              {isExpanded && (
                <div className="flex flex-col min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <span className="text-xs font-bold text-[#ccd88f] truncate font-poppins tracking-wide">Administrator</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-[#ccd88f]/30 font-bold uppercase tracking-widest truncate">Online Now</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Floating Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="absolute bottom-10 -right-4 h-9 w-9 rounded-2xl bg-[#ccd88f] text-[#311807] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-50 border-[3px] border-[#311807] group"
          >
            {isExpanded ? (
              <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            ) : (
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}
