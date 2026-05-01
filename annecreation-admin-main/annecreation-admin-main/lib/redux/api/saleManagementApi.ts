import { baseApi } from "./baseApi";

export interface SaleConfig {
  isActive: boolean;
  discountPercentage: number;
  expiryDate?: string;
  targetCategories: string[] | "ALL";
}

export const saleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSaleConfig: builder.query<{ success: boolean; data: SaleConfig }, void>({
      query: () => "/api/sales/config",
      providesTags: ["SaleConfig"],
    }),
    updateSaleConfig: builder.mutation<{ success: boolean; data: SaleConfig }, SaleConfig>({
      query: (body) => ({
        url: "/api/sales/config",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["SaleConfig", "Products", "Cart", "Wishlist"],
    }),
  }),
  overrideExisting: true,
});

export const { useGetSaleConfigQuery, useUpdateSaleConfigMutation } = saleApi;
