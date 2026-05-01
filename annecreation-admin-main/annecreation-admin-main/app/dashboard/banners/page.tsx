
import { BannerHeader } from "@/components/banners/banner-header"
import { BannersList } from "@/components/banners/banner-list"
import { BannersShell } from "@/components/banners/banner-shell"

export default function BannersPage() {
  return (
    <BannersShell>
      <BannerHeader />
      <BannersList />
    </BannersShell>
  )
}
