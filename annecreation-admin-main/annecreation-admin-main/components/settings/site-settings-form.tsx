"use client"

import React, { useState, useEffect } from "react"
import { useGetSettingsQuery, useUpdateSettingMutation } from "@/lib/redux/api/settingsApi"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"

export function SiteSettingsForm() {
    const { data: settings, isLoading } = useGetSettingsQuery()
    const [updateSetting, { isLoading: isUpdating }] = useUpdateSettingMutation()

    const [scrollingMessage, setScrollingMessage] = useState("")

    useEffect(() => {
        if (settings) {
            const msg = settings.find(s => s.key === 'scrolling_message')?.value || ""
            setScrollingMessage(msg)
        }
    }, [settings])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await updateSetting({
                key: 'scrolling_message',
                value: scrollingMessage,
                description: 'Text displayed in the top scrolling marquee'
            }).unwrap()
            toast.success("Scrolling message updated successfully")
        } catch (error) {
            console.error("Failed to update setting:", error)
            toast.error("Failed to update setting")
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[200px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#ccd88f]" />
            </div>
        )
    }

    return (
        <div className="grid gap-6">
            <Card className="overflow-hidden border-none bg-white/60 shadow-xl shadow-[#311807]/5 backdrop-blur-xl rounded-[2.5rem]">
                <CardHeader className="bg-[#311807]/[0.02] border-b border-[#311807]/5 px-8 py-8">
                    <CardTitle className="text-2xl font-black text-[#311807] tracking-tight">Marquee Settings</CardTitle>
                    <CardDescription className="text-sm font-medium text-[#311807]/40 mt-2">
                        Update the scrolling message shown at the top of the frontend
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="scrollingMessage" className="text-sm font-bold text-[#311807]/70 ml-1">
                                Scrolling Message Text
                            </Label>
                            <Input
                                id="scrollingMessage"
                                placeholder="Enter text for the scrolling strip"
                                value={scrollingMessage}
                                onChange={(e) => setScrollingMessage(e.target.value)}
                                className="h-14 px-6 rounded-2xl bg-white border-[#311807]/5 focus:border-[#ccd88f] focus:ring-[#ccd88f]/20 transition-all font-medium text-[#311807]"
                            />
                            <p className="text-[10px] text-[#311807]/40 font-bold uppercase tracking-wider ml-1">
                                Visible on all homepage and product pages
                            </p>
                        </div>

                        <Button
                            type="submit"
                            disabled={isUpdating}
                            className="h-14 px-8 rounded-2xl bg-[#311807] hover:bg-[#45210a] text-white font-bold transition-all disabled:opacity-50"
                        >
                            {isUpdating ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-5 w-5" />
                            )}
                            Save Changes
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
