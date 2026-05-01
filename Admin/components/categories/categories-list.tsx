"use client"

import { useState, useMemo } from "react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  FilterIcon,
  SearchIcon,
  XIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { formatDateOnlyIST } from "@/lib/date-utils"
import { usePermissions } from "@/hooks/use-permissions"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CategoryDialog } from "./category-dialog"
import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
} from "@/lib/redux/api/categoryApi"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

const sortPositionRanges = ["1-10", "11-20", "21-30", "31-40"]

interface ApiCategory {
  _id: string
  name: string
  description?: string
  image?: string
  sortOrder: number
  status?: boolean
  createdAt?: string
  updatedAt?: string
  productCount?: number
}

export function CategoriesList() {
  // Fetch categories
  const { data: categoriesApiData, isLoading, isError } = useGetCategoriesQuery({})
  const [deleteCategory] = useDeleteCategoryMutation()

  // Sorting state
  const [sortField, setSortField] = useState<"name" | "count" | "sortPosition" | "updatedAt">("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Filtering state
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRanges, setSelectedRanges] = useState<string[]>(sortPositionRanges)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)

  const { canUpdate, canDelete } = usePermissions()


  // Defensive: extract categories safely
  let apiCategories: ApiCategory[] = []
  if (
    categoriesApiData &&
    typeof categoriesApiData === "object" &&
    "data" in categoriesApiData &&
    Array.isArray((categoriesApiData as any).data)
  ) {
    apiCategories = (categoriesApiData as any).data
  }

  // Normalize categories
  const categoriesData = apiCategories.map((cat) => ({
    id: cat._id,
    name: cat.name,
    count: cat.productCount ?? 0,
    sortPosition: cat.sortOrder ?? 0,
    status: cat.status ?? true,
    sortOrder: cat.sortOrder ?? 0,
    productCount: cat.productCount ?? 0,
    description: cat.description || "",
    image: cat.image || "",
    createdAt: cat.createdAt || "",
    updatedAt: cat.updatedAt || "",
  }))

  // Delete handler
  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id).unwrap()
      console.log("Category deleted:", id)
    } catch (err) {
      console.error("Failed to delete category:", err)
    }
  }

  // Sorting logic
  const handleSort = (field: "name" | "count" | "sortPosition" | "updatedAt") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Filter + sort
  const filteredAndSortedCategories = useMemo(() => {
    return categoriesData
      .filter((category) => category.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        switch (sortField) {
          case "name":
            return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
          case "sortPosition":
            return sortDirection === "asc" ? a.sortPosition - b.sortPosition : b.sortPosition - a.sortPosition;
          case "count":
            return sortDirection === "asc" ? a.count - b.count : b.count - a.count;
          case "updatedAt":
            return sortDirection === "asc"
              ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
              : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          default:
            return 0;
        }
      })
  }, [categoriesData, sortField, sortDirection, searchQuery, selectedRanges])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCategories.length / itemsPerPage)
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedCategories.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedCategories, currentPage, itemsPerPage])

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const toggleSortPositionRange = (range: string) => {
    if (selectedRanges.includes(range)) {
      setSelectedRanges(selectedRanges.filter((r) => r !== range))
    } else {
      setSelectedRanges([...selectedRanges, range])
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedRanges(sortPositionRanges)
  }

  if (isLoading) return <div>Loading categories...</div>
  if (isError) return <div>Error loading categories.</div>

  return (
    <Card className="glass-card border-none ring-1 ring-[#311807]/5 overflow-hidden">
      <CardHeader className="bg-transparent border-b border-[#311807]/5 pb-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-[#311807] font-poppins">Categories</CardTitle>
            <CardDescription className="text-[#311807]/40 font-inter text-sm mt-1">
              <span className="font-bold text-[#ccd88f]">{filteredAndSortedCategories.length}</span> classification labels
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative w-full sm:w-64">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#311807]/30" />
              <Input
                placeholder="Search categories..."
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
                  Filter
                  {selectedRanges.length < sortPositionRanges.length && (
                    <Badge className="ml-1 bg-[#ccd88f] text-[#311807] hover:bg-[#ccd88f]/90 h-5 px-1.5 min-w-[20px] justify-center">
                      {selectedRanges.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-card border-none ring-1 ring-[#311807]/5 p-2">
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-[#311807]/40 pb-2">Sort Position Range</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#311807]/5" />
                {sortPositionRanges.map((range) => (
                  <DropdownMenuCheckboxItem
                    key={range}
                    checked={selectedRanges.includes(range)}
                    onCheckedChange={() => toggleSortPositionRange(range)}
                    className="rounded-lg focus:bg-[#ccd88f]/10"
                  >
                    {range}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator className="bg-[#311807]/5" />
                <div className="p-1">
                  <Button variant="ghost" size="sm" className="w-full text-[#311807]/40 hover:text-[#311807] font-bold text-[10px] uppercase tracking-wider" onClick={clearFilters}>
                    Reset Filters
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 bg-transparent">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#311807]/5 hover:bg-transparent">
                <TableHead className="pl-6">
                  <Button
                    variant="ghost"
                    className="flex h-8 items-center gap-1.5 p-0 font-bold text-[#311807]/40 uppercase text-[10px] tracking-widest hover:bg-transparent hover:text-[#311807]"
                    onClick={() => handleSort("name")}
                  >
                    Category Name
                    {sortField === "name" && (sortDirection === "asc" ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />)}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="flex h-8 items-center gap-1.5 p-0 font-bold text-[#311807]/40 uppercase text-[10px] tracking-widest hover:bg-transparent hover:text-[#311807]"
                    onClick={() => handleSort("sortPosition")}
                  >
                    Order
                    {sortField === "sortPosition" && (sortDirection === "asc" ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />)}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="flex h-8 items-center gap-1.5 p-0 font-bold text-[#311807]/40 uppercase text-[10px] tracking-widest hover:bg-transparent hover:text-[#311807]"
                    onClick={() => handleSort("count")}
                  >
                    Total Products
                    {sortField === "count" && (sortDirection === "asc" ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />)}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="flex h-8 items-center gap-1.5 p-0 font-bold text-[#311807]/40 uppercase text-[10px] tracking-widest hover:bg-transparent hover:text-[#311807]"
                    onClick={() => handleSort("updatedAt")}
                  >
                    Last Refined
                    {sortField === "updatedAt" && (sortDirection === "asc" ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />)}
                  </Button>
                </TableHead>
                <TableHead className="text-right pr-6 font-bold text-[#311807]/40 uppercase text-[10px] tracking-widest">Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCategories.length > 0 ? (
                paginatedCategories.map((category) => (
                  <TableRow key={category.id} className="border-b border-[#311807]/5 hover:bg-[#ccd88f]/5 transition-colors group">
                    <TableCell className="pl-6">
                      <span className="font-bold text-[#311807]">{category.name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[10px] font-bold bg-[#311807]/5 text-[#311807]/60 px-2 py-1 rounded-md">{category.sortPosition}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-[#311807]">{category.count}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-[#311807]/50 font-medium">{formatDateOnlyIST(category.updatedAt)}</span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        {canUpdate('categories') && (
                          <CategoryDialog mode="edit" category={category}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 rounded-lg bg-[#311807]/5 text-[#311807] hover:bg-[#311807]/10 font-bold text-[10px] uppercase tracking-wider"
                            >
                              Edit
                            </Button>
                          </CategoryDialog>
                        )}

                        {canDelete('categories') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 rounded-lg text-red-600 hover:bg-red-50 font-bold text-[10px] uppercase tracking-wider"
                            onClick={() => {
                              setCategoryToDelete(category.id)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <p className="text-[#311807]/30 text-xs font-bold uppercase tracking-widest">No categories archived</p>
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
                setItemsPerPage(Number(value))
                setCurrentPage(1)
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
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-[#311807]/10 bg-white/50 backdrop-blur-sm rounded-lg hover:bg-[#ccd88f]/20 hover:text-[#311807]"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>

            <div className="mx-4 flex flex-col items-center">
              <span className="text-[10px] font-bold text-[#311807]/30 uppercase tracking-tighter mb-0.5">Page</span>
              <span className="text-sm font-bold text-[#311807] leading-none">
                {currentPage} <span className="text-[#311807]/20 mx-1">/</span> {totalPages}
              </span>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-[#311807]/10 bg-white/50 backdrop-blur-sm rounded-lg hover:bg-[#ccd88f]/20 hover:text-[#311807]"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-[#311807]/10 bg-white/50 backdrop-blur-sm rounded-lg hover:bg-[#ccd88f]/20 hover:text-[#311807]"
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px] glass-card border-none ring-1 ring-[#311807]/10">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#311807] font-poppins">Confirm Archival</DialogTitle>
              <DialogDescription className="text-[#311807]/60 font-medium">
                Are you sure you want to permanently archive the category{" "}
                <span className="font-bold text-[#311807]">
                  "{categoriesData.find((cat) => cat.id === categoryToDelete)?.name}"
                </span>
                ? This action cannot be reversed.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" className="font-bold text-[#311807]/40 uppercase tracking-widest text-[10px]" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 font-bold text-[10px] uppercase tracking-widest"
                onClick={async () => {
                  if (categoryToDelete) {
                    await handleDelete(categoryToDelete)
                    setIsDeleteDialogOpen(false)
                    setCategoryToDelete(null)
                  }
                }}
              >
                Archive Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

