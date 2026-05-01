"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  useGetSaleConfigQuery, 
  useUpdateSaleConfigMutation 
} from "@/lib/redux/api/saleManagementApi";
import { useGetCategoriesQuery } from "@/lib/redux/api/categoryApi";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Save, Loader2, Percent, Calendar, Layers } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

export default function SalesConfigContent() {
  const { data: configData, isLoading, refetch } = useGetSaleConfigQuery();
  const { data: categoriesData } = useGetCategoriesQuery({});
  const [updateSale, { isLoading: isUpdating }] = useUpdateSaleConfigMutation();

  const [isActive, setIsActive] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [expiryDate, setExpiryDate] = useState("");
  const [targetAll, setTargetAll] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (configData?.data) {
      const config = configData.data;
      setIsActive(config.isActive);
      setDiscountPercentage(config.discountPercentage);
      if (config.expiryDate) {
        setExpiryDate(new Date(config.expiryDate).toISOString().split('T')[0]);
      }
      if (config.targetCategories === "ALL") {
        setTargetAll(true);
        setSelectedCategories([]);
      } else {
        setTargetAll(false);
        setSelectedCategories(Array.isArray(config.targetCategories) ? config.targetCategories : []);
      }
    }
  }, [configData]);

  const apiCategories = Array.isArray((categoriesData as any)?.data) ? (categoriesData as any).data : [];

  const handleSave = async () => {
    try {
      await updateSale({
        isActive,
        discountPercentage: Number(discountPercentage),
        expiryDate: expiryDate || undefined,
        targetCategories: targetAll ? "ALL" : selectedCategories
      }).unwrap();
      toast.success("Sale configuration updated successfully");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update sale configuration");
    }
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#ccd88f]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-[#311807] font-poppins tracking-tight">GLOBAL SALE MANAGEMENT</h1>
        <p className="text-sm text-[#311807]/40 font-bold uppercase tracking-widest">Configure store-wide or category-specific discounts</p>
      </div>

      <Alert className="bg-[#ccd88f]/10 border-[#ccd88f]/20 text-[#311807]">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="font-bold uppercase tracking-wider text-[11px]">Notice</AlertTitle>
        <AlertDescription className="text-xs">
          Enabling a global sale will overwrite individual product discounts. Use with caution.
        </AlertDescription>
      </Alert>

      <Card className="glass-card border-none ring-1 ring-[#311807]/5 overflow-hidden">
        <CardHeader className="border-b border-[#311807]/5 bg-[#311807]/5 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-[#311807] flex items-center justify-center text-[#ccd88f]">
                  <Percent className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-[#311807] font-poppins">Sale Configuration</CardTitle>
                <CardDescription className="text-xs uppercase tracking-widest font-bold text-[#311807]/30">Active Status & Amount</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/50 px-4 py-2 rounded-2xl ring-1 ring-[#311807]/5">
              <Label htmlFor="active-status" className="font-black text-[10px] uppercase tracking-widest text-[#311807]/60">Live Mode</Label>
              <Switch 
                id="active-status" 
                checked={isActive} 
                onCheckedChange={setIsActive} 
                className="data-[state=checked]:bg-[#ccd88f] data-[state=unchecked]:bg-[#311807]/10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] text-[#311807]/40">
                 Discount Percentage (%)
              </Label>
              <div className="relative">
                <Percent className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#311807]/30" />
                <Input 
                  type="number" 
                  value={discountPercentage} 
                  onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                  className="pl-12 h-12 rounded-xl border-[#311807]/10 focus:ring-[#ccd88f]"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] text-[#311807]/40">
                Expiry Date (Optional)
              </Label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#311807]/30" />
                <Input 
                  type="date" 
                  value={expiryDate} 
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="pl-12 h-12 rounded-xl border-[#311807]/10 focus:ring-[#ccd88f]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-4 border-t border-[#311807]/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#311807]/5 flex items-center justify-center text-[#311807]">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                    <h3 className="font-bold text-[#311807] font-poppins text-sm uppercase tracking-tight">Scope Selection</h3>
                    <p className="text-[10px] font-bold text-[#311807]/30 uppercase tracking-widest leading-none mt-1">Which products are discounted?</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-[#311807]/5 px-4 py-2 rounded-xl">
                 <div className="flex items-center gap-2">
                    <Checkbox id="target-all" checked={targetAll} onCheckedChange={(checked) => setTargetAll(!!checked)} />
                    <Label htmlFor="target-all" className="font-bold text-[10px] uppercase tracking-widest text-[#311807]">All Store Products</Label>
                 </div>
              </div>
            </div>

            {!targetAll && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-white/30 p-4 rounded-2xl ring-1 ring-[#311807]/5 animate-in fade-in slide-in-from-top-4 duration-300">
                {apiCategories.map((cat: any) => (
                  <div key={cat._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#ccd88f]/10 transition-colors cursor-pointer" onClick={() => toggleCategory(cat._id)}>
                    <Checkbox checked={selectedCategories.includes(cat._id)} onCheckedChange={() => toggleCategory(cat._id)} />
                    <span className="text-[10px] font-bold text-[#311807] uppercase tracking-wide truncate">{cat.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-6">
            <Button 
                onClick={handleSave} 
                disabled={isUpdating}
                className="h-12 px-8 rounded-xl bg-[#311807] text-[#ccd88f] hover:bg-[#311807]/90 font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#311807]/20 gap-3 group active:scale-95 transition-all"
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 group-hover:scale-125 transition-transform" />}
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
