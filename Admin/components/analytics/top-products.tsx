"use client";

import { useGetTopProductsQuery } from "@/lib/redux/api/dashboardApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function TopProducts({ className }: { className?: string }) {
  const { data, isLoading } = useGetTopProductsQuery({ days: 30, limit: 5 });
  const products = data?.topProducts || [];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
        <CardDescription>Best performing products by sales volume (last 30 days)</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-10 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading...
          </div>
        ) : products.length > 0 ? (
          <div className="space-y-8">
            {products.map((product) => (
              <div key={product.productId} className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.totalSold} sales · ₹{product.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="ml-auto font-medium text-xs text-muted-foreground">
                  {product.sku}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            No product data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
