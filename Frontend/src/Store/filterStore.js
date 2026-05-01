import { create } from 'zustand';

export const useFilterStore = create((set) => ({
    selectedCategories: [],
    activeTab: 'all',

    setSelectedCategories: (updater) => set((state) => ({
        selectedCategories: typeof updater === 'function' ? updater(state.selectedCategories) : updater
    })),
    setActiveTab: (updater) => set((state) => ({
        activeTab: typeof updater === 'function' ? updater(state.activeTab) : updater
    })),

    resetFilters: () => set({
        selectedCategories: [],
        activeTab: 'all'
    })
}));

