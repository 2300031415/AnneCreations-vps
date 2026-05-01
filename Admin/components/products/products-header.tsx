"use client"

import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductDialog } from "./product-dialog"
import { usePermissions } from "@/hooks/use-permissions"


export function ProductsHeader() {
  const { canCreate } = usePermissions()

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Products</h1>
        <p className="text-sm text-gray-500">Manage your product catalog, pricing, and details.</p>
      </div>
      {canCreate('products') && (
        <ProductDialog>
          <Button className="gap-1 bg-[#ccd88f] text-[#311807] hover:bg-[#ccd88f]/90">
            <PlusCircle className="h-4 w-4" />
            Add Product
          </Button>
        </ProductDialog>
      )}
    </div>
  )
}
