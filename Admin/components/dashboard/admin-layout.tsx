"use client";

import { ReactNode } from "react";
import { DashboardHeader } from "./dashboard-header";
import { DashboardShell } from "./dashboard-shell";

interface AdminLayoutProps {
    children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <div className="flex h-screen w-full bg-background overflow-hidden">
            <div className="flex flex-1 flex-col overflow-hidden">
                <DashboardHeader />
                <div className="flex-1 overflow-auto">
                    <DashboardShell>
                        {children}
                    </DashboardShell>
                </div>
            </div>
        </div>
    );
}
