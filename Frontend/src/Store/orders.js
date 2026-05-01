import { create } from 'zustand';

import axiosClient from '@/lib/axiosClient'; // ✅ uses refresh token logic

export const useOrderStore = create((set) => ({
  orders: [],
  totalOrders: 0,
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
  isSearchMode: false,

  setCurrentPage: (page) => {
    set({ currentPage: page });
  },

  fetchOrders: async (page = 1) => {
    set({ isLoading: true, error: null, isSearchMode: false });

    try {
      const response = await axiosClient.get(`/api/orders/my?page=${page}`);
    
      // API returns { data: [...], pagination: { total, page, pages, limit } }
      const { data, pagination } = response.data;
  
      set({
        orders: data || [],
        totalOrders: pagination?.total || data.length,
        totalPages: pagination?.pages || 1,
        currentPage: pagination?.page || page,
        error: null,
        isLoading: false,
      });
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error.message;

      set({ isLoading: false, error: errorMsg });
    }
  },

  searchOrders: async (searchQuery) => {
    set({ isLoading: true, error: null, isSearchMode: true });

    try {
      const response = await axiosClient.get(`/api/orders/my?search=${encodeURIComponent(searchQuery)}&page=1&limit=100`);

      // API returns { data: [...], pagination: { total, page, pages, limit } }
      const { data, pagination } = response.data;
      console.log(data)
      set({
        orders: data || [],
        totalOrders: pagination?.total || data.length,
        totalPages: 1, // No pagination for search results
        currentPage: 1,
        error: null,
        isLoading: false,
      });
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error.message;

      set({ isLoading: false, error: errorMsg });
    }
  },
}));

