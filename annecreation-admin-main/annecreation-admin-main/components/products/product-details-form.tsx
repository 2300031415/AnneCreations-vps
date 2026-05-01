"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useGetCategoriesQuery } from "@/lib/redux/api/categoryApi";
import { useGetMachineFormatsQuery } from "@/lib/redux/api/machineApi";
import { ProductFormData } from "./product-dialog";
import { ProductImageUpload } from "./product-image-upload";
import { ProductImage } from "../ui/product-image";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductDetailsFormProps {
  product?: any;
  formData: ProductFormData;
  onChange: (field: keyof ProductFormData, value: any) => void;
  onImagesChange: (images: File[]) => void;
  onRemoveImage: (index: number) => void;
  onFileUpload: (formatId: string, file: File) => void;
  onMachineFormatsLoaded?: (formats: { id: string; name: string }[]) => void;
  validationErrors?: {
    name?: boolean;
    stitches?: boolean;
    designSpec?: boolean;
    categories?: boolean;
  };
  onRemoveExistingImage: (index: number | "main") => void;
  machineFormats?: { id: string; name: string }[];
}

// ---------------- Image URL Helper ----------------
function buildImageUrl(imagePath?: string) {
  if (!imagePath) return "/placeholder.png";

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  const base = (process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "").replace(/\/+$/, "");
  const path = imagePath.replace(/^\/+/, "");
  return base ? `${base}/${path}` : `/${path}`;
}

// ---------------- ProductDetailsForm ----------------
export function ProductDetailsForm({
  product,
  formData,
  onChange,
  onImagesChange,
  onRemoveImage,
  onFileUpload,
  validationErrors,
  onMachineFormatsLoaded = () => { },
  onRemoveExistingImage,
}: ProductDetailsFormProps) {
  // ---------------- Categories ----------------
  const { data: categoriesApiData, isLoading: categoriesLoading, isError: categoriesError } =
    useGetCategoriesQuery({ include_inactive: false });
  const categories = Array.isArray(categoriesApiData?.data)
    ? [...categoriesApiData.data].sort((a: any, b: any) => a.name.localeCompare(b.name))
    : [];

  useEffect(() => {
    if (product?.categories) {
      const ids = product.categories.map((cat: any) => String(cat._id));
      onChange("categories", ids);
    }
  }, [product]);

  // ---------------- Machine Formats ----------------
  const { data: machineFormatsData, isLoading: machineLoading } = useGetMachineFormatsQuery();
  const machineFormats = machineFormatsData?.map(m => ({ id: m._id, name: m.name })) || [];

  useEffect(() => {
    if (machineFormats.length) onMachineFormatsLoaded(machineFormats);
  }, [machineFormats]);

  // ---------------- Local State ----------------
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [applyGlobalPrice, setApplyGlobalPrice] = useState(false);
  const [globalPrice, setGlobalPrice] = useState(product?.price?.toString() || "");

  // Stitches management
  const [stitchEntries, setStitchEntries] = useState<{ id: string; type: string; value: string; customType?: string }[]>([
    { id: "1", type: "Back", value: "" },
    { id: "2", type: "Hand", value: "" }
  ]);

  // Initial load of stitches from formData (edit mode)
  useEffect(() => {
    if (product) {
      const initialStitches: { id: string; type: string; value: string; customType?: string }[] = [];
      if (product.backStitches) {
        initialStitches.push({ id: `back-${Date.now()}`, type: "Back", value: String(product.backStitches) });
      }
      if (product.handStitches) {
        initialStitches.push({ id: `hand-${Date.now()}`, type: "Hand", value: String(product.handStitches) });
      }
      if (product.frontStitches) {
        initialStitches.push({ id: `front-${Date.now()}`, type: "Front", value: String(product.frontStitches) });
      }
      if (product.overallStitches) {
        initialStitches.push({ id: `overall-${Date.now()}`, type: "Overall", value: String(product.overallStitches) });
      }
      // If there are other stitches in the string field, we could parse them here if needed

      if (initialStitches.length === 0) {
        // Default empty fields if no data
        initialStitches.push({ id: "1", type: "Back", value: "" });
        initialStitches.push({ id: "2", type: "Hand", value: "" });
      }
      setStitchEntries(initialStitches);
    }
  }, [product]);

  // Update parent formData when stitchEntries change
  useEffect(() => {
    const totalBack = stitchEntries
      .filter(s => s.type === "Back")
      .reduce((sum, s) => sum + (parseInt(s.value) || 0), 0);

    const totalHand = stitchEntries
      .filter(s => s.type === "Hand")
      .reduce((sum, s) => sum + (parseInt(s.value) || 0), 0);

    const totalFront = stitchEntries
      .filter(s => s.type === "Front")
      .reduce((sum, s) => sum + (parseInt(s.value) || 0), 0);

    const totalOverall = stitchEntries
      .filter(s => s.type === "Overall")
      .reduce((sum, s) => sum + (parseInt(s.value) || 0), 0);

    // Filter out custom types and store them in the 'stitches' string field
    const customTypes = stitchEntries
      .filter(s => !["Back", "Hand", "Front", "Overall"].includes(s.type))
      .map(s => `${s.type === "Custom" ? s.customType || "Other" : s.type}: ${s.value}`)
      .join(", ");

    // Only call onChange if values differ to avoid infinite loops
    if (formData.backStitches !== totalBack) onChange("backStitches", totalBack);
    if (formData.handStitches !== totalHand) onChange("handStitches", totalHand);
    if (formData.frontStitches !== totalFront) onChange("frontStitches", totalFront);
    if (formData.overallStitches !== totalOverall) onChange("overallStitches", totalOverall);
    if (formData.stitches !== customTypes) onChange("stitches", customTypes);
  }, [stitchEntries]);

  const addStitchEntry = () => {
    setStitchEntries(prev => [...prev, { id: `new-${Date.now()}-${Math.random()}`, type: "Hand", value: "" }]);
  };

  const removeStitchEntry = (id: string) => {
    // Prevent removing the last item if you want at least one, but here we allow dynamic
    setStitchEntries(prev => prev.filter(s => s.id !== id));
  };

  const updateStitchEntry = (id: string, field: string, value: string) => {
    setStitchEntries(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  // ---------------- Handlers ----------------
  const handleImageSelect = (files: File[]) => {
    const allFiles = [...formData.images, ...files];
    onImagesChange(allFiles);

    const newPreviews = files.map(f => URL.createObjectURL(f));
    setPreviewImages(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveImageInternal = (index: number) => {
    const newFiles = formData.images.filter((_, i) => i !== index);
    onImagesChange(newFiles);

    const newPreviews = previewImages.filter((_, i) => i !== index);
    setPreviewImages(newPreviews);
  };

  const toggleMachineFormat = (formatId: string) => {
    if (machineLoading) return;

    const isSelected = formData.selectedMachineFormats.includes(formatId);
    let updatedFormats = isSelected
      ? formData.selectedMachineFormats.filter(f => f !== formatId)
      : [...formData.selectedMachineFormats, formatId];

    onChange("selectedMachineFormats", updatedFormats);

    if (isSelected) {
      const updatedPrices = { ...formData.machineFormatPrices };
      updatedPrices[formatId] = "";
      onChange("machineFormatPrices", updatedPrices);
    }
  };

  const handleMachineFormatPriceChange = (formatId: string, value: string) => {
    const updatedPrices = { ...formData.machineFormatPrices, [formatId]: value };
    onChange("machineFormatPrices", updatedPrices);
  };

  const toggleApplyGlobalPrice = () => {
    const newState = !applyGlobalPrice;
    setApplyGlobalPrice(newState);

    if (newState) {
      const allIds = machineFormats.map(f => f.id);
      onChange("selectedMachineFormats", allIds);

      const updatedPrices: Record<string, string> = {};
      allIds.forEach(id => (updatedPrices[id] = globalPrice));
      onChange("machineFormatPrices", updatedPrices);
    } else {
      onChange("selectedMachineFormats", []);
      const clearedPrices: Record<string, string> = {};
      machineFormats.forEach(f => (clearedPrices[f.id] = ""));
      onChange("machineFormatPrices", clearedPrices);
    }
  };

  const handleGlobalPriceChange = (value: string) => {
    setGlobalPrice(value);
    if (applyGlobalPrice) {
      const updatedPrices = { ...formData.machineFormatPrices };
      machineFormats.forEach(f => (updatedPrices[f.id] = value));
      onChange("machineFormatPrices", updatedPrices);
    }
  };

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      previewImages.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewImages]);

  // ---------------- JSX ----------------
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-1">
        {/* Product Info */}
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="model">Product Name</Label>
              <Input
                id="model"
                placeholder="Enter product name"
                value={formData.productModel}
                onChange={e => onChange("productModel", e.target.value)}
                className="border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                placeholder="Enter SKU"
                value={formData.sku}
                onChange={e => onChange("sku", e.target.value)}
                className="border-gray-300"
              />
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Checkbox
                id="status"
                checked={formData.status}
                onCheckedChange={checked => onChange("status", checked)}
              />
              <Label htmlFor="status">Active</Label>
            </div>

            <div className="flex items-center gap-2 border-l pl-4">
              <Checkbox
                id="todayDeal"
                checked={formData.todayDeal}
                onCheckedChange={checked => onChange("todayDeal", checked)}
              />
              <Label htmlFor="todayDeal" className="text-yellow-700 font-semibold">Today's Deal</Label>
            </div>
          </div>

          {formData.todayDeal && (
            <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
              <Label htmlFor="todayDealExpiry" className="text-yellow-800 text-xs font-bold mb-1 block">Deal Expiry Date</Label>
              <Input
                id="todayDealExpiry"
                type="date"
                value={formData.todayDealExpiry || ""}
                onChange={e => onChange("todayDealExpiry", e.target.value)}
                className="border-yellow-300 bg-white h-9"
              />
            </div>
          )}

          <div>
            <Label htmlFor="createdAt">Date (Optional)</Label>
            <Input
              id="createdAt"
              type="date"
              value={formData.createdAt ? new Date(formData.createdAt).toISOString().split('T')[0] : ""}
              onChange={e => onChange("createdAt", e.target.value)}
              className="border-gray-300"
            />
          </div>

          <div className="grid gap-4">
            <div>
              <Label>Design Specification</Label>
              <Textarea
                value={formData.description || ""}
                onChange={e => onChange("description", e.target.value)}
              />
            </div>
            {/* Stitches Section */}
            <div className="border p-4 rounded-md bg-gray-50/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Stitches</h3>
                <Button type="button" variant="outline" size="sm" onClick={addStitchEntry} className="h-8 gap-1">
                  <Plus className="h-3.5 w-3.5" /> Add Stitch
                </Button>
              </div>

              <div className="space-y-3">
                {stitchEntries.map((entry, index) => (
                  <div key={entry.id} className="flex gap-3 items-end">
                    <div className="w-1/3 min-w-[100px]">
                      <Label className="text-xs text-gray-500 mb-1.5 block">Type</Label>
                      <Select
                        value={entry.type}
                        onValueChange={(val) => updateStitchEntry(entry.id, "type", val)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Back">Back</SelectItem>
                          <SelectItem value="Hand">Hand</SelectItem>
                          <SelectItem value="Front">Front</SelectItem>
                          <SelectItem value="Overall">Overall</SelectItem>
                          <SelectItem value="Custom">Other...</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {entry.type === "Custom" && (
                      <div className="w-1/4 min-w-[100px]">
                        <Label className="text-xs text-gray-500 mb-1.5 block">Custom Type</Label>
                        <Input
                          placeholder="Type name"
                          value={entry.customType || ""}
                          onChange={(e) => updateStitchEntry(entry.id, "customType", e.target.value)}
                          className="h-9 border-gray-300"
                        />
                      </div>
                    )}

                    <div className="flex-1 relative">
                      <Label className="text-xs text-gray-500 mb-1.5 block">Count</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="Count"
                          value={entry.value}
                          onChange={(e) => updateStitchEntry(entry.id, "value", e.target.value)}
                          className="pl-8 h-9 border-gray-300"
                        />
                        <span className="absolute left-2.5 top-2.5 text-gray-400 text-xs font-bold uppercase">
                          {entry.type === "Back" ? "B" : entry.type === "Hand" ? "H" : entry.type === "Front" ? "F" : entry.type === "Overall" ? "O" : "S"}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-gray-500 hover:text-red-500 hover:bg-red-50"
                      onClick={() => removeStitchEntry(entry.id)}
                      disabled={stitchEntries.length === 1 && index === 0} // Optional: keep at least one? User said "add symbol", implying list. Let's allow deleting.
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Totals Summary (Optional but helpful) */}
              <div className="mt-3 text-xs text-gray-500 flex flex-wrap gap-4 border-t pt-2">
                <span>Total Back: {stitchEntries.filter(s => s.type === "Back").reduce((sum, s) => sum + (parseInt(s.value) || 0), 0)}</span>
                <span>Total Hand: {stitchEntries.filter(s => s.type === "Hand").reduce((sum, s) => sum + (parseInt(s.value) || 0), 0)}</span>
                <span>Total Front: {stitchEntries.filter(s => s.type === "Front").reduce((sum, s) => sum + (parseInt(s.value) || 0), 0)}</span>
                <span>Total Overall: {stitchEntries.filter(s => s.type === "Overall").reduce((sum, s) => sum + (parseInt(s.value) || 0), 0)}</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Dimensions", key: "dimensions", placeholder: "e.g. 8x10 inches" },
                { label: "Colour & Needles", key: "colourNeedles", placeholder: "e.g. DMC threads included" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <Label>{label}</Label>
                  <Input
                    type="text"
                    placeholder={placeholder}
                    value={formData[key as keyof typeof formData] || ""}
                    onChange={e => onChange(key as keyof typeof formData, e.target.value)}
                    className={validationErrors?.[key as keyof typeof validationErrors] ? "border-red-500" : "border-gray-300"}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* New Images */}
        <ProductImageUpload
          onImageSelect={handleImageSelect}
          selectedImages={formData.images}
          previewImages={previewImages}
          onRemoveImage={handleRemoveImageInternal}
          label="Product Images"
          description="Upload product images (JPEG, PNG, GIF, WebP - max 5MB each)"
        />
        {/* Existing Images */}
        <div className="mb-4">
          <Label className="block font-medium mb-2">Existing Images</Label>
          <div className="flex gap-2 flex-wrap">
            {/* Main Image */}
            {formData.existingImage && (
              <ProductImage
                src={buildImageUrl(formData.existingImage)}
                alt="Main Product"
                onRemove={() => onRemoveExistingImage("main")}
              />
            )}

            {/* Additional Images */}
            {formData.existingAdditionalImages?.map((imgObj, idx) => (
              <ProductImage
                key={idx} // use index, not _id
                src={buildImageUrl(typeof imgObj === "string" ? imgObj : imgObj.image)}
                alt={`Additional ${idx}`}
                onRemove={() => onRemoveExistingImage(idx)}
              />
            ))}

          </div>
        </div>

        {/* Categories */}
        <div className="grid gap-2">
          <Label htmlFor="category" className="text-gray-700">
            Category <span className="text-red-500">*</span>
          </Label>
          {categoriesLoading ? (
            <p className="text-gray-500">Loading categories...</p>
          ) : categoriesError ? (
            <p className="text-red-500">Failed to load categories</p>
          ) : categories.length > 0 ? (
            <div className="columns-1 sm:columns-2 md:columns-3 gap-3 space-y-3">
              {categories.map(cat => {
                const id = String(cat._id);
                return (
                  <label key={id} className="flex items-center gap-2 border p-2 rounded break-inside-avoid shadow-sm hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      value={id}
                      checked={formData.categories.includes(id)}
                      onChange={e => {
                        const updated = e.target.checked
                          ? [...formData.categories, id]
                          : formData.categories.filter(item => item !== id);
                        onChange("categories", updated);
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-[#ccd88f] focus:ring-[#ccd88f]"
                    />
                    <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{cat.name}</span>
                  </label>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">No categories found</p>
          )}
          {validationErrors?.categories && (
            <p className="text-red-500 text-sm">Please select at least one category.</p>
          )}
        </div>

        {/* Machine Formats */}
        <div>
          <h3 className="font-medium text-gray-900">Pricing & Machine Formats</h3>

          {/* Global Price */}
          <div className="flex items-center gap-4 bg-gray-50 border p-4 rounded-md">
            <Checkbox
              id="apply-global-price"
              checked={applyGlobalPrice}
              onCheckedChange={toggleApplyGlobalPrice}
              disabled={machineLoading}
            />
            <Label htmlFor="apply-global-price">Add Price to all Products</Label>
            <Input
              type="number"
              placeholder="Price"
              value={globalPrice}
              onChange={e => handleGlobalPriceChange(e.target.value)}
              className="border-gray-300 w-32"
            />
          </div>

          {machineLoading ? (
            <p className="text-center text-gray-500 mt-2">Loading machine formats...</p>
          ) : (
            <div className="space-y-4 border p-4 rounded-md">
              {machineFormats.map(format => (
                <div key={format.id} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`format-${format.id}`}
                      checked={formData.selectedMachineFormats.includes(format.id)}
                      onCheckedChange={() => toggleMachineFormat(format.id)}
                    />
                    <Label htmlFor={`format-${format.id}`}>{format.name}</Label>
                  </div>
                  <Input
                    type="number"
                    placeholder="Price"
                    value={formData.machineFormatPrices?.[format.id] || ""}
                    onChange={e => handleMachineFormatPriceChange(format.id, e.target.value)}
                  />
                  <Input
                    type="file"
                    accept=".zip"
                    className="file:mr-4 file:bg-[#ccd88f] file:text-[#311807]"
                    disabled={!formData.selectedMachineFormats.includes(format.id)}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (!file.name.endsWith(".zip")) {
                        alert("Only zip files are allowed.");
                        e.target.value = "";
                        return;
                      }
                      onFileUpload(format.id, file);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>


      </div>
    </div>
  );
}
