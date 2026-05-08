"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  FilterIcon,
  SearchIcon,
  XIcon,
  Edit,
  Trash,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ProductDialog } from "./product-dialog";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "@/lib/redux/api/productApi";
import { ProductImage } from "@/components/ui/product-image";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { usePermissions } from "@/hooks/use-permissions"

export function ProductsList() {
  const searchParams = useSearchParams()

  // State for sorting
  const [sortField, setSortField] = useState<"name" | "price" | "category" | "createdAt" | "salesCount">(
    "createdAt"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // State for filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<boolean[]>([
    true,
    false,
  ]);

  // State for date range
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [appliedDateFrom, setAppliedDateFrom] = useState<string>("");
  const [appliedDateTo, setAppliedDateTo] = useState<string>("");

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Read URL params and pre-populate date range
  useEffect(() => {
    const urlDateFrom = searchParams.get('dateFrom');
    const urlDateTo = searchParams.get('dateTo');

    if (urlDateFrom && urlDateTo) {
      setDateFrom(urlDateFrom);
      setDateTo(urlDateTo);
      setAppliedDateFrom(urlDateFrom);
      setAppliedDateTo(urlDateTo);
    }
  }, [searchParams]);

  const formatDateForApi = (date: string) => {
    if (!date) return undefined;
    // Format date as YYYY-MM-DD
    const formattedDate = new Date(date);
    if (isNaN(formattedDate.getTime())) return undefined;
    return formattedDate.toISOString().split('T')[0];
  };

  // Fetch products
  const { data: productData, isLoading, error } = useGetProductsQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery || undefined,
    sortBy: sortField,
    sortOrder: sortDirection,
    dateFrom: formatDateForApi(appliedDateFrom),
    dateTo: formatDateForApi(appliedDateTo),
  });

  // Toast notifications
  const { toast } = useToast();

  // Delete product mutation
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation()
  const { canUpdate, canDelete } = usePermissions()


  // Toggle status selection
  const toggleStatus = (status: boolean) => {
    if (selectedStatus.includes(status)) {
      setSelectedStatus(selectedStatus.filter((s) => s !== status));
    } else {
      setSelectedStatus([...selectedStatus, status]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStatus([true, false]);
    setSortField("createdAt");
    setSortDirection("desc");
    setDateFrom("");
    setDateTo("");
    setAppliedDateFrom("");
    setAppliedDateTo("");
  };

  // Function to handle product deletion
  const handleDeleteProduct = async (productId: string) => {
    try {
      const result = await deleteProduct(productId.toString()).unwrap();
      toast({
        title: "Product deleted",
        description: result.message || "Product was deleted successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    }
  };
  function buildImageUrl(imagePath?: string) {
    if (!imagePath) return "/placeholder.png";

    const base = (process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "").replace(/\/+$/, "");
    const path = imagePath.replace(/^\/+/, ""); // remove leading slashes
    return base ? `${base}/${path}` : `/${path}`; // if no base, use relative path
  }

  return (
    <Card className="glass-card border-none ring-1 ring-[#311807]/5 overflow-hidden">
      <CardHeader className="bg-transparent border-b border-[#311807]/5 pb-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4 text-[#ccd88f]" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#311807]/40 leading-none">Filters & Controls</p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-[#311807]/60 uppercase ml-1">From</span>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-40 border-[#311807]/10 bg-white/50 backdrop-blur-sm focus:ring-[#ccd88f] text-xs h-9"
                  max={dateTo || undefined}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-[#311807]/60 uppercase ml-1">To</span>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-40 border-[#311807]/10 bg-white/50 backdrop-blur-sm focus:ring-[#ccd88f] text-xs h-9"
                  min={dateFrom || undefined}
                />
              </div>

              <div className="flex items-end gap-2 mt-auto">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-[#ccd88f] text-[#311807] hover:bg-[#ccd88f]/90 font-bold text-xs h-9 rounded-lg px-4"
                  onClick={() => {
                    setAppliedDateFrom(dateFrom);
                    setAppliedDateTo(dateTo);
                    setCurrentPage(1);
                  }}
                  disabled={!dateFrom && !dateTo}
                >
                  Apply
                </Button>

                {(dateFrom || dateTo) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#311807]/40 hover:text-[#311807] font-bold text-xs h-9 uppercase tracking-tighter"
                    onClick={() => {
                      setDateFrom("");
                      setDateTo("");
                      setAppliedDateFrom("");
                      setAppliedDateTo("");
                      setCurrentPage(1);
                    }}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-t border-[#311807]/5 pt-6">
            <div>
              <CardTitle className="text-2xl font-bold text-[#311807] font-poppins">
                Inventory
              </CardTitle>
              <CardDescription className="text-[#311807]/40 font-inter text-sm mt-1">
                <span className="font-bold text-[#ccd88f]">{productData?.pagination.total || 0}</span> products currently active
              </CardDescription>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="relative w-full sm:w-64">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#311807]/30" />
                <Input
                  placeholder="Search inventory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-[#311807]/10 bg-white/50 backdrop-blur-sm focus:ring-[#ccd88f] h-10 rounded-xl"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                    onClick={() => setSearchQuery("")}
                  >
                    <XIcon className="h-4 w-4 text-[#311807]/30" />
                  </Button>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-10 border-[#311807]/10 bg-white/50 backdrop-blur-sm gap-2 rounded-xl text-xs font-bold text-[#311807]/60">
                    <FilterIcon className="h-4 w-4" />
                    Status
                    {selectedStatus.length < 2 && (
                      <Badge className="ml-1 bg-[#ccd88f] text-[#311807] hover:bg-[#ccd88f]/90 h-5 px-1.5 min-w-[20px] justify-center">
                        {selectedStatus.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass-card border-none ring-1 ring-[#311807]/5 p-2">
                  <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-[#311807]/40 pb-2">Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#311807]/5" />
                  <DropdownMenuCheckboxItem
                    checked={selectedStatus.includes(true)}
                    onCheckedChange={() => toggleStatus(true)}
                    className="rounded-lg focus:bg-[#ccd88f]/10"
                  >
                    Active
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={selectedStatus.includes(false)}
                    onCheckedChange={() => toggleStatus(false)}
                    className="rounded-lg focus:bg-[#ccd88f]/10"
                  >
                    Inactive
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Select
                value={`${sortField}-${sortDirection}`}
                onValueChange={(value) => {
                  const [field, direction] = value.split("-") as ["name" | "price" | "category" | "createdAt" | "salesCount", "asc" | "desc"]
                  setSortField(field)
                  setSortDirection(direction)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="h-10 w-full sm:w-[180px] border-[#311807]/10 bg-white/50 backdrop-blur-sm rounded-xl text-xs font-bold text-[#311807]/60">
                  <SelectValue placeholder="Sort Order" />
                </SelectTrigger>
                <SelectContent className="glass-card border-none ring-1 ring-[#311807]/5">
                  <SelectItem value="salesCount-desc">Best Sellers</SelectItem>
                  <SelectItem value="salesCount-asc">Least Sellers</SelectItem>
                  <SelectItem value="createdAt-desc">Newest First</SelectItem>
                  <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="sm"
                className="h-10 px-4 text-[#311807]/40 hover:text-[#311807] font-bold text-xs uppercase tracking-tighter"
                onClick={clearFilters}
              >
                Reset All
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 bg-transparent">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#311807]/5 hover:bg-transparent">
                <TableHead className="w-[100px] font-bold text-[#311807]/70 uppercase text-[12px] tracking-widest pl-6">Preview</TableHead>
                <TableHead className="font-bold text-[#311807]/70 uppercase text-[12px] tracking-widest">Product Details</TableHead>
                <TableHead className="font-bold text-[#311807]/70 uppercase text-[12px] tracking-widest">Category</TableHead>
                <TableHead className="font-bold text-[#311807]/70 uppercase text-[12px] tracking-widest">Total Sales</TableHead>
                <TableHead className="font-bold text-[#311807]/70 uppercase text-[12px] tracking-widest">Visibility</TableHead>
                <TableHead className="text-right font-bold text-[#311807]/70 uppercase text-[12px] tracking-widest pr-6">Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ccd88f]/30 border-t-[#ccd88f]"></div>
                      <p className="text-xs text-[#311807]/40 font-bold uppercase tracking-widest">Syncing inventory...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-red-500 font-bold">Error loading products</p>
                      <pre className="text-xs text-left max-w-lg overflow-auto bg-gray-100 p-2 rounded">
                        {JSON.stringify(error, null, 2)}
                      </pre>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (productData?.data?.length ?? 0) > 0 ? (
                productData?.data?.map((product: any) => (
                  <TableRow key={product._id} className="border-b border-[#311807]/5 hover:bg-[#ccd88f]/5 transition-colors group">
                    <TableCell className="pl-6">
                      <div className="h-14 w-10 overflow-hidden rounded-lg border border-[#311807]/10 bg-white group-hover:shadow-md transition-shadow">
                        <ProductImage
                          src={product.image}
                          alt={product.productModel}
                          width={40}
                          height={56}
                        />
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-[#311807]">{product.productModel}</span>
                        <span className="text-[10px] text-[#311807]/60 font-mono">ID: {product._id.slice(-6).toUpperCase()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {product.categories?.map((c: any) => (
                          <span key={c._id} className="text-[10px] font-bold bg-[#311807]/5 text-[#311807]/70 px-2 py-0.5 rounded-md">
                            {c.name}
                          </span>
                        )) || <span className="text-[#311807]/30">-</span>}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-[#311807]">
                      {product.salesCount !== undefined ? product.salesCount.toLocaleString() : "0"}
                    </TableCell>
                    <TableCell>
                      <div className={cn(
                        "flex w-fit items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                        product.status ? "bg-green-100/50 text-green-700" : "bg-red-100/50 text-red-700"
                      )}>
                        <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", product.status ? "bg-green-500" : "bg-red-500")} />
                        {product.status ? "Live" : "Ghost"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-[#311807]/5 text-[#311807]">
                            <MoreHorizontal className="h-5 w-5" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-card border-none ring-1 ring-[#311807]/5 p-2 w-40">
                          <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-[#311807]/40 pb-2">Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-[#311807]/5" />
                          {canUpdate('products') && (
                            <ProductDialog mode="edit" product={product}>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="rounded-lg focus:bg-[#ccd88f]/10 cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Details
                              </DropdownMenuItem>
                            </ProductDialog>
                          )}
                          {canDelete('products') && (
                            <ConfirmDialog
                              title="Archive Product"
                              description={`Are you sure you want to permanently archive "${product.productModel}"? This action cannot be undone.`}
                              confirmText="Archive"
                              cancelText="Cancel"
                              variant="destructive"
                              isLoading={isDeleting}
                              onConfirm={() => handleDeleteProduct(product._id)}
                              trigger={
                                <DropdownMenuItem
                                  className="text-red-600 rounded-lg focus:bg-red-50 cursor-pointer"
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Remove
                                </DropdownMenuItem>
                              }
                            />
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))

              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <p className="text-[#311807]/30 text-xs font-bold uppercase tracking-widest">Warehouse empty</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row px-6 pb-6">
          <div className="flex items-center gap-3">
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-[75px] border-[#311807]/10 bg-white/50 backdrop-blur-sm rounded-lg text-xs font-bold">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent className="glass-card border-none ring-1 ring-[#311807]/5">
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] font-bold text-[#311807]/30 uppercase tracking-wider">Per Page</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-[#311807]/10 bg-white/50 backdrop-blur-sm rounded-lg hover:bg-[#ccd88f]/20 hover:text-[#311807]"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-[#311807]/10 bg-white/50 backdrop-blur-sm rounded-lg hover:bg-[#ccd88f]/20 hover:text-[#311807]"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>

            <div className="mx-4 flex flex-col items-center">
              <span className="text-[10px] font-bold text-[#311807]/30 uppercase tracking-tighter mb-0.5">Page</span>
              <span className="text-sm font-bold text-[#311807] leading-none">
                {currentPage} <span className="text-[#311807]/20 mx-1">/</span> {productData?.pagination.pages || 1}
              </span>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-[#311807]/10 bg-white/50 backdrop-blur-sm rounded-lg hover:bg-[#ccd88f]/20 hover:text-[#311807]"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === (productData?.pagination.pages || 1)}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-[#311807]/10 bg-white/50 backdrop-blur-sm rounded-lg hover:bg-[#ccd88f]/20 hover:text-[#311807]"
              onClick={() => setCurrentPage(productData?.pagination.pages || 1)}
              disabled={currentPage === (productData?.pagination.pages || 1)}
            >
              <ChevronsRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
