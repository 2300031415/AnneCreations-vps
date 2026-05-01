import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BannerDialog } from "./BannerDialog"

export function BannerHeader() {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Banners</h1>
        <p className="text-sm text-gray-500">Manage your Banner Images.</p>
      </div>

      <BannerDialog mode="create">
        <Button className="bg-[#ccd88f] text-[#311807] hover:bg-[#ccd88f]/90">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Banner
        </Button>
      </BannerDialog>
    </div>
  )
}
