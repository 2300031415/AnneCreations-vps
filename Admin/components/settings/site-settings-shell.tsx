"use client"

import { SiteSettingsHeader } from "./site-settings-header"
import { SiteSettingsForm } from "./site-settings-form"
import { usePermissions } from "@/hooks/use-permissions"
import { AccessDenied } from "@/components/ui/access-denied"

export function SiteSettingsShell() {
    const { canRead, isSuperAdmin, isLoading } = usePermissions()
    const hasSettingsAccess = isSuperAdmin || canRead('settings')

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6">
                <SiteSettingsHeader />
                <div className="flex min-h-[400px] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#ccd88f]"></div>
                </div>
            </div>
        )
    }

    if (!hasSettingsAccess) {
        return (
            <div className="flex flex-col gap-6">
                <SiteSettingsHeader />
                <AccessDenied
                    description="You don't have permission to manage site settings"
                    message="This page requires settings write permission. Please contact your administrator if you believe you should have access."
                />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <SiteSettingsHeader />
            <SiteSettingsForm />
        </div>
    )
}
