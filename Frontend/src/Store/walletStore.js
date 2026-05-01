import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosClient from '@/lib/axiosClient';

const getApiErrorMessage = (err, fallback) =>
    err?.response?.data?.message || err?.message || fallback;

export const useWalletStore = create(
    persist(
        (set, get) => ({
            balance: 0,
            transactions: [],
            isLoading: false,
            error: null,

            fetchWallet: async () => {
                set({ isLoading: true, error: null });
                try {
                    const res = await axiosClient.get('/api/wallet');
                    set({
                        balance: res.data?.data?.balance || 0,
                        transactions: res.data?.data?.transactions || [],
                        isLoading: false,
                        error: null,
                    });
                } catch (err) {
                    const errorMsg = getApiErrorMessage(err, 'Failed to load wallet');
                    set({ isLoading: false, error: errorMsg });
                    throw new Error(errorMsg);
                }
            },

            addBalance: (amount) => set((state) => ({ balance: state.balance + amount })),
            deductBalance: (amount) => set((state) => ({ balance: Math.max(0, state.balance - amount) })),

            createAddMoneyOrder: async (amount) => {
                set({ isLoading: true, error: null });
                try {
                    const res = await axiosClient.post('/api/wallet/create-add-money-order', { amount });
                    set({ isLoading: false, error: null });
                    return res.data?.data;
                } catch (err) {
                    const errorMsg = getApiErrorMessage(err, 'Failed to initiate wallet payment');
                    set({ isLoading: false, error: errorMsg });
                    throw new Error(errorMsg);
                }
            },

            verifyAddMoney: async (paymentData) => {
                set({ isLoading: true, error: null });
                try {
                    const res = await axiosClient.post('/api/wallet/verify-add-money', paymentData);
                    await get().fetchWallet(); // Refresh
                    set({ isLoading: false, error: null });
                    return res.data?.data;
                } catch (err) {
                    const errorMsg = getApiErrorMessage(err, 'Payment verification failed');
                    set({ isLoading: false, error: errorMsg });
                    throw new Error(errorMsg);
                }
            },

            payWithWallet: async (orderId) => {
                set({ isLoading: true, error: null });
                try {
                    const res = await axiosClient.post('/api/wallet/pay-order', { orderId });
                    await get().fetchWallet(); // Refresh balance
                    set({ isLoading: false, error: null });
                    return res.data?.data;
                } catch (err) {
                    const errorMsg = err.response?.data?.message || 'Wallet payment failed';
                    set({ isLoading: false, error: errorMsg });
                    throw new Error(errorMsg);
                }
            }
        }),
        {
            name: 'wallet-storage',
        }
    )
);

