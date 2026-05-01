"use client"

import { SiteSettingsShell } from "@/components/settings/site-settings-shell"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function SiteSettingsPage() {
    return (
        <DashboardShell>
            <SiteSettingsShell />
        </DashboardShell>
    )
}
