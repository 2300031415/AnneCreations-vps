"use client"

import { Settings } from "lucide-react"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function SiteSettingsHeader() {
    return (
        <div className="flex flex-col gap-4 bg-white/40 p-6 rounded-[2rem] border border-white/60 backdrop-blur-xl">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/dashboard/settings/site">Settings</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Site Settings</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ccd88f] shadow-lg shadow-[#ccd88f]/20">
                    <Settings className="h-6 w-6 text-[#311807]" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-[#311807] tracking-tight">Site Settings</h1>
                    <p className="text-sm font-medium text-[#311807]/50 mt-1">Manage general site configuration and scrolling messages</p>
                </div>
            </div>
        </div>
    )
}
